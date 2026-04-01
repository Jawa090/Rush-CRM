const db = require('../config/database');
const crypto = require('crypto');

// Create external source (website, API, webhook)
const createExternalSource = async (req, res, next) => {
  try {
    const {
      sourceName,
      sourceType,
      sourceUrl,
      workspaceId,
      fieldMapping,
      defaultValues,
      autoAssignEnabled,
      assignmentRules
    } = req.body;

    if (!sourceName || !sourceType) {
      return res.status(400).json({ error: 'Source name and type are required' });
    }

    // Generate API key and webhook secret
    const apiKey = `ls_${crypto.randomBytes(32).toString('hex')}`;
    const webhookSecret = crypto.randomBytes(32).toString('hex');

    const result = await db.query(
      `INSERT INTO lead_external_sources 
       (org_id, workspace_id, source_name, source_type, source_url, api_key, webhook_secret,
        field_mapping, default_values, auto_assign_enabled, assignment_rules, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        req.user.orgId,
        workspaceId || null,
        sourceName,
        sourceType,
        sourceUrl || null,
        apiKey,
        webhookSecret,
        JSON.stringify(fieldMapping || {}),
        JSON.stringify(defaultValues || {}),
        autoAssignEnabled || false,
        JSON.stringify(assignmentRules || {}),
        req.user.id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Source name already exists' });
    }
    next(err);
  }
};

// Get all external sources
const getAllExternalSources = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;

    let query = `
      SELECT les.*, w.name as workspace_name
      FROM lead_external_sources les
      LEFT JOIN workgroups w ON w.id = les.workspace_id
      WHERE les.org_id = $1
    `;
    const params = [req.user.orgId];

    if (workspaceId && workspaceId !== 'undefined' && workspaceId !== 'null') {
      query += ` AND les.workspace_id = $2`;
      params.push(workspaceId);
    }

    query += ` ORDER BY les.created_at DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Update external source
const updateExternalSource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      sourceName,
      sourceUrl,
      fieldMapping,
      defaultValues,
      autoAssignEnabled,
      assignmentRules,
      isActive
    } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (sourceName !== undefined) {
      fields.push(`source_name = $${paramIndex}`);
      values.push(sourceName);
      paramIndex++;
    }
    if (sourceUrl !== undefined) {
      fields.push(`source_url = $${paramIndex}`);
      values.push(sourceUrl);
      paramIndex++;
    }
    if (fieldMapping !== undefined) {
      fields.push(`field_mapping = $${paramIndex}`);
      values.push(JSON.stringify(fieldMapping));
      paramIndex++;
    }
    if (defaultValues !== undefined) {
      fields.push(`default_values = $${paramIndex}`);
      values.push(JSON.stringify(defaultValues));
      paramIndex++;
    }
    if (autoAssignEnabled !== undefined) {
      fields.push(`auto_assign_enabled = $${paramIndex}`);
      values.push(autoAssignEnabled);
      paramIndex++;
    }
    if (assignmentRules !== undefined) {
      fields.push(`assignment_rules = $${paramIndex}`);
      values.push(JSON.stringify(assignmentRules));
      paramIndex++;
    }
    if (isActive !== undefined) {
      fields.push(`is_active = $${paramIndex}`);
      values.push(isActive);
      paramIndex++;
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE lead_external_sources 
       SET ${fields.join(', ')}
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'External source not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Delete external source
const deleteExternalSource = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM lead_external_sources WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'External source not found' });
    }

    res.json({ message: 'External source deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Regenerate API key
const regenerateApiKey = async (req, res, next) => {
  try {
    const { id } = req.params;

    const newApiKey = `ls_${crypto.randomBytes(32).toString('hex')}`;

    const result = await db.query(
      `UPDATE lead_external_sources 
       SET api_key = $1, updated_at = NOW()
       WHERE id = $2 AND org_id = $3
       RETURNING *`,
      [newApiKey, id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'External source not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Public API endpoint to receive leads from external sources
const receiveExternalLead = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    // Find external source by API key
    const sourceResult = await db.query(
      'SELECT * FROM lead_external_sources WHERE api_key = $1 AND is_active = true',
      [apiKey]
    );

    if (sourceResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or inactive API key' });
    }

    const source = sourceResult.rows[0];
    const leadData = req.body;

    // Apply field mapping
    const mappedData = {};
    const fieldMapping = source.field_mapping || {};
    
    for (const [externalField, internalField] of Object.entries(fieldMapping)) {
      if (leadData[externalField]) {
        mappedData[internalField] = leadData[externalField];
      }
    }

    // Apply default values
    const defaultValues = source.default_values || {};
    for (const [field, value] of Object.entries(defaultValues)) {
      if (!mappedData[field]) {
        mappedData[field] = value;
      }
    }

    // Ensure required fields
    if (!mappedData.title && !mappedData.name) {
      return res.status(400).json({ error: 'Lead name/title is required' });
    }

    // Check for duplicate
    if (leadData.external_id) {
      const existing = await db.query(
        'SELECT id FROM leads WHERE external_source_id = $1 AND external_id = $2',
        [source.id, leadData.external_id]
      );
      if (existing.rows.length > 0) {
        return res.status(200).json({ 
          message: 'Lead already exists', 
          leadId: existing.rows[0].id,
          duplicate: true 
        });
      }
    }

    // Auto-assignment logic
    let assignedTo = null;
    if (source.auto_assign_enabled && source.assignment_rules) {
      // Simple round-robin or rule-based assignment
      // You can extend this with more complex logic
      const rules = source.assignment_rules;
      if (rules.type === 'round_robin' && rules.users) {
        // Get last assigned user and rotate
        const lastAssigned = await db.query(
          `SELECT assigned_to FROM leads 
           WHERE external_source_id = $1 AND assigned_to IS NOT NULL 
           ORDER BY created_at DESC LIMIT 1`,
          [source.id]
        );
        
        const users = rules.users;
        if (users.length > 0) {
          if (lastAssigned.rows.length > 0) {
            const lastIndex = users.indexOf(lastAssigned.rows[0].assigned_to);
            const nextIndex = (lastIndex + 1) % users.length;
            assignedTo = users[nextIndex];
          } else {
            assignedTo = users[0];
          }
        }
      }
    }

    // Insert lead
    const result = await db.query(
      `INSERT INTO leads 
       (org_id, workspace_id, external_source_id, external_id, title, name, email, phone, 
        company_name, company_email, company_phone, designation, source, status, value, 
        website, address, notes, agent_name, service_interested, company_size, 
        decision_maker, assigned_to, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, NOW(), NOW())
       RETURNING *`,
      [
        source.org_id,
        source.workspace_id,
        source.id,
        leadData.external_id || null,
        mappedData.title || mappedData.name,
        mappedData.name || mappedData.title,
        mappedData.email || null,
        mappedData.phone || null,
        mappedData.company || mappedData.companyName || null,
        mappedData.companyEmail || null,
        mappedData.companyPhone || null,
        mappedData.designation || null,
        source.source_name,
        mappedData.status || 'new',
        mappedData.value ? parseFloat(mappedData.value) : null,
        mappedData.website || null,
        mappedData.address || null,
        mappedData.notes || null,
        mappedData.agentName || null,
        mappedData.serviceInterested || null,
        mappedData.companySize || null,
        mappedData.decisionMaker || null,
        assignedTo
      ]
    );

    // Update source stats
    await db.query(
      `UPDATE lead_external_sources 
       SET total_leads_received = total_leads_received + 1, last_sync_at = NOW()
       WHERE id = $1`,
      [source.id]
    );

    res.status(201).json({
      message: 'Lead created successfully',
      leadId: result.rows[0].id,
      duplicate: false
    });
  } catch (err) {
    console.error('External lead receive error:', err);
    next(err);
  }
};

module.exports = {
  createExternalSource,
  getAllExternalSources,
  updateExternalSource,
  deleteExternalSource,
  regenerateApiKey,
  receiveExternalLead
};
