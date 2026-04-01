const db = require('../config/database');
const Joi = require('joi');
const { fireWorkflows } = require('../services/workflowEngine');

// Map database status/stage values to frontend expected values
const mapStatusToFrontend = (status) => {
  const statusMap = {
    'unassigned': 'new',
    'new': 'new',
    'contacted': 'contacted',
    'qualified': 'qualified',
    'unqualified': 'unqualified',
    'processed': 'qualified',
    'converted': 'qualified',
    'in_progress': 'contacted',
    'progress': 'contacted',
  };
  return statusMap[status] || 'new';
};

// Map frontend status/stage values to database values
const mapStatusToDatabase = (status) => {
  const statusMap = {
    'new': 'new',
    'contacted': 'contacted',
    'qualified': 'qualified',
    'unqualified': 'unqualified',
  };
  return statusMap[status] || status;
};

const createLeadSchema = Joi.object({
  title: Joi.string().required(),
  name: Joi.string().optional().allow(''),
  stage: Joi.string().default('new'),
  status: Joi.string().default('new'),
  source: Joi.string().optional(),
  value: Joi.number().optional(),
  currency: Joi.string().default('USD'),
  priority: Joi.string().default('medium'),
  notes: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  expectedCloseDate: Joi.alternatives().try(Joi.date(), Joi.string().isoDate()).optional().allow(null, ''),
  contactId: Joi.string().uuid().optional().allow(null),
  companyId: Joi.string().uuid().optional().allow(null),
  // Marketing fields
  designation: Joi.string().optional().allow(null, ''),
  phone: Joi.string().optional().allow(null, ''),
  email: Joi.string().email().optional().allow(null, ''),
  website: Joi.string().uri().optional().allow(null, ''),
  address: Joi.string().optional().allow(null, ''),
  companyName: Joi.string().optional().allow(null, ''),
  companyPhone: Joi.string().optional().allow(null, ''),
  companyEmail: Joi.string().email().optional().allow(null, ''),
  companySize: Joi.string().optional().allow(null, ''),
  agentName: Joi.string().optional().allow(null, ''),
  decisionMaker: Joi.string().optional().allow(null, ''),
  serviceInterested: Joi.string().optional().allow(null, ''),
  interactionNotes: Joi.string().optional().allow(null, ''),
  firstMessage: Joi.string().optional().allow(null, ''),
  lastTouch: Joi.date().optional().allow(null),
});

const normalizeLeadInput = (body = {}) => {
  const valueNumber = body.value === undefined || body.value === null || body.value === ''
    ? undefined
    : Number(body.value);

  const expectedRaw = body.expectedCloseDate ?? body.expected_close_date;
  const expectedCloseDate = expectedRaw === '' || expectedRaw === null || expectedRaw === undefined
    ? null
    : expectedRaw;

  const lastTouchRaw = body.lastTouch ?? body.last_touch;
  const lastTouch = lastTouchRaw === '' || lastTouchRaw === null || lastTouchRaw === undefined
    ? null
    : lastTouchRaw;

  // Ensure both title and name are set - they're both NOT NULL in the database
  const titleValue = body.title ?? body.name;
  const nameValue = body.name ?? body.title;

  return {
    title: titleValue,
    name: nameValue,
    stage: body.stage ?? body.status ?? 'new',
    status: body.status ?? body.stage ?? 'new',
    source: body.source ?? null,
    value: Number.isNaN(valueNumber) ? undefined : valueNumber,
    currency: body.currency ?? body.currency_code ?? 'USD',
    priority: body.priority ?? 'medium',
    notes: body.notes ?? null,
    tags: body.tags ?? body.labels ?? undefined,
    expectedCloseDate,
    contactId: body.contactId ?? body.contact_id ?? null,
    companyId: body.companyId ?? body.company_id ?? null,
    // Marketing fields with snake_case to camelCase conversion
    designation: body.designation ?? null,
    phone: body.phone ?? null,
    email: body.email ?? null,
    website: body.website ?? null,
    address: body.address ?? null,
    companyName: body.companyName ?? body.company_name ?? null,
    companyPhone: body.companyPhone ?? body.company_phone ?? null,
    companyEmail: body.companyEmail ?? body.company_email ?? null,
    companySize: body.companySize ?? body.company_size ?? null,
    agentName: body.agentName ?? body.agent_name ?? null,
    decisionMaker: body.decisionMaker ?? body.decision_maker ?? null,
    serviceInterested: body.serviceInterested ?? body.service_interested ?? null,
    interactionNotes: body.interactionNotes ?? body.interaction_notes ?? null,
    firstMessage: body.firstMessage ?? body.first_message ?? null,
    lastTouch,
  };
};

const updateLeadSchema = Joi.object({
  title: Joi.string().optional(),
  name: Joi.string().optional(),
  stage: Joi.string().optional(),
  status: Joi.string().optional(),
  source: Joi.string().optional().allow(null, ''),
  value: Joi.number().optional().allow(null),
  currency: Joi.string().optional(),
  priority: Joi.string().optional(),
  notes: Joi.string().optional().allow(null),
  tags: Joi.array().items(Joi.string()).optional(),
  expectedCloseDate: Joi.alternatives().try(Joi.date(), Joi.string().isoDate()).optional().allow(null, ''),
  contactId: Joi.string().uuid().optional().allow(null),
  companyId: Joi.string().uuid().optional().allow(null),
  assignedTo: Joi.string().uuid().optional().allow(null),
  // Marketing fields
  designation: Joi.string().optional().allow(null, ''),
  phone: Joi.string().optional().allow(null, ''),
  email: Joi.string().email().optional().allow(null, ''),
  website: Joi.string().uri().optional().allow(null, ''),
  address: Joi.string().optional().allow(null, ''),
  companyName: Joi.string().optional().allow(null, ''),
  companyPhone: Joi.string().optional().allow(null, ''),
  companyEmail: Joi.string().email().optional().allow(null, ''),
  companySize: Joi.string().optional().allow(null, ''),
  agentName: Joi.string().optional().allow(null, ''),
  decisionMaker: Joi.string().optional().allow(null, ''),
  serviceInterested: Joi.string().optional().allow(null, ''),
  interactionNotes: Joi.string().optional().allow(null, ''),
  firstMessage: Joi.string().optional().allow(null, ''),
  lastTouch: Joi.date().optional().allow(null),
}).min(1);

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, stage, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT l.*, 
             c.first_name as contact_first_name, c.last_name as contact_last_name, c.email as contact_email,
             co.name as company_name
      FROM public.leads l
      LEFT JOIN public.contacts c ON c.id = l.contact_id
      LEFT JOIN public.companies co ON co.id = l.company_id
      WHERE l.org_id = $1
    `;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (stage) {
      query += ` AND l.stage = $${paramIndex}`;
      params.push(stage);
      paramIndex++;
    }

    if (status) {
      query += ` AND l.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (l.title ILIKE $${paramIndex} OR co.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY l.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    let result;
    try {
      result = await db.query(query, params);
    } catch (err) {
      if (err.code === '42703') {
        // Fallback for legacy schemas without contact_id/company_id; rebuild params for clarity
        const legacyParams = [req.user.orgId];
        let legacyIdx = 2;
        let legacyQuery = `SELECT l.* FROM public.leads l WHERE l.org_id = $1`;

        if (stage) {
          legacyQuery += ` AND l.stage = $${legacyIdx}`;
          legacyParams.push(stage);
          legacyIdx++;
        }

        if (status) {
          legacyQuery += ` AND l.status = $${legacyIdx}`;
          legacyParams.push(status);
          legacyIdx++;
        }

        if (search) {
          legacyQuery += ` AND (l.title ILIKE $${legacyIdx})`;
          legacyParams.push(`%${search}%`);
          legacyIdx++;
        }

        legacyQuery += ` ORDER BY l.created_at DESC LIMIT $${legacyIdx} OFFSET $${legacyIdx + 1}`;
        legacyParams.push(limit, offset);

        result = await db.query(legacyQuery, legacyParams);
      } else {
        throw err;
      }
    }

    const countResult = await db.query(
      'SELECT COUNT(*) FROM public.leads WHERE org_id = $1',
      [req.user.orgId]
    );

    res.json({
      data: result.rows.map(lead => ({
        ...lead,
        // Ensure consistent field names for frontend
        name: lead.title || lead.name,
        title: lead.title || lead.name,
        company: lead.company_name || lead.company,
        // Map database status/stage to frontend expected values
        status: mapStatusToFrontend(lead.status),
        stage: mapStatusToFrontend(lead.stage),
        // Ensure value is a number
        value: lead.value ? Number(lead.value) : 0,
        // Format dates
        createdAt: lead.created_at,
        updatedAt: lead.updated_at,
      })),
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let result;
    try {
      result = await db.query(
        `SELECT l.*,
                c.id as contact_id, c.first_name as contact_first_name, c.last_name as contact_last_name, c.email as contact_email, c.phone as contact_phone,
                co.id as company_id, co.name as company_name, co.email as company_email, co.phone as company_phone
         FROM public.leads l
         LEFT JOIN public.contacts c ON c.id = l.contact_id
         LEFT JOIN public.companies co ON co.id = l.company_id
         WHERE l.id = $1 AND l.org_id = $2`,
        [id, req.user.orgId]
      );
    } catch (err) {
      if (err.code === '42703') {
        // Legacy schema without contact_id/company_id
        result = await db.query(
          `SELECT l.* FROM public.leads l WHERE l.id = $1 AND l.org_id = $2`,
          [id, req.user.orgId]
        );
      } else {
        throw err;
      }
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = result.rows[0];
    res.json({
      ...lead,
      // Ensure consistent field names for frontend
      name: lead.title || lead.name,
      title: lead.title || lead.name,
      company: lead.company_name || lead.company,
      // Map database status/stage to frontend expected values
      status: mapStatusToFrontend(lead.status),
      stage: mapStatusToFrontend(lead.stage),
      // Ensure value is a number
      value: lead.value ? Number(lead.value) : 0,
      // Format dates
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
    });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const normalized = normalizeLeadInput(req.body);
    const { error, value } = createLeadSchema.validate(normalized, { stripUnknown: true, allowUnknown: true });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      title, name, stage, status, source, value: leadValue, currency, priority,
      notes, tags, expectedCloseDate, contactId, companyId,
      // Marketing fields
      designation, phone, email, website, address, companyName, companyPhone, 
      companyEmail, companySize, agentName, decisionMaker, serviceInterested, 
      interactionNotes, firstMessage, lastTouch
    } = value;

    let result;
    try {
      result = await db.query(
        `INSERT INTO public.leads 
         (org_id, user_id, title, name, stage, status, source, value, currency, priority, 
          notes, tags, expected_close_date, contact_id, company_id,
          designation, phone, email, website, address, company_name, company_phone,
          company_email, company_size, agent_name, decision_maker, service_interested,
          interaction_notes, first_message, last_touch)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                 $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
         RETURNING *`,
        [req.user.orgId, req.user.id, title, name, stage, status, source, leadValue, 
         currency, priority, notes, tags, expectedCloseDate, contactId, companyId,
         designation, phone, email, website, address, companyName, companyPhone,
         companyEmail, companySize, agentName, decisionMaker, serviceInterested,
         interactionNotes, firstMessage, lastTouch]
      );
    } catch (err) {
      if (err.code === '42703') {
        // Fallback for legacy schema without many optional columns
        result = await db.query(
          `INSERT INTO public.leads 
           (org_id, user_id, title, name, stage, status, source, value, currency)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [req.user.orgId, req.user.id, title, name, stage, status, source, leadValue, currency]
        );
      } else {
        throw err;
      }
    }

    // Log activity
    try {
      await db.query(
        `INSERT INTO public.crm_activities 
         (org_id, user_id, entity_type, entity_id, activity_type, title, description)
         VALUES ($1, $2, 'lead', $3, 'created', $4, $5)`,
        [req.user.orgId, req.user.id, result.rows[0].id, 'Lead Created', title]
      );
    } catch (activityErr) {
      // Don't fail the request if activity logging fails
      console.error('Failed to log activity:', activityErr);
    }

    const lead = result.rows[0];

    // Fire workflow triggers (non-blocking)
    fireWorkflows(req.user.orgId, 'lead_created', lead, req.user.id);

    res.status(201).json({
      ...lead,
      // Ensure consistent field names for frontend
      name: lead.title || lead.name,
      title: lead.title || lead.name,
      company: lead.company_name || lead.company,
      // Map database status/stage to frontend expected values
      status: mapStatusToFrontend(lead.status),
      stage: mapStatusToFrontend(lead.stage),
      // Ensure value is a number
      value: lead.value ? Number(lead.value) : 0,
      // Format dates
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const normalized = normalizeLeadInput(req.body);
    const { error, value } = updateLeadSchema.validate(normalized, { stripUnknown: true, allowUnknown: true });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { id } = req.params;

    const existingLead = await db.query(
      'SELECT * FROM public.leads WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );
    if (existingLead.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMapping = {
      title: 'title',
      name: 'name',
      stage: 'stage',
      status: 'status',
      source: 'source',
      value: 'value',
      currency: 'currency',
      priority: 'priority',
      notes: 'notes',
      tags: 'tags',
      contactId: 'contact_id',
      companyId: 'company_id',
      assignedTo: 'assigned_to',
      expectedCloseDate: 'expected_close_date',
    };

    for (const [key, val] of Object.entries(value)) {
      const dbField = fieldMapping[key];
      if (dbField && val !== undefined) {
        let dbValue = val;
        // Map frontend status/stage values to database values
        if (key === 'status' || key === 'stage') {
          dbValue = mapStatusToDatabase(val);
        }
        fields.push(`${dbField} = $${paramIndex}`);
        values.push(dbValue);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.leads SET ${fields.join(', ')}
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    // Log activity
    try {
      await db.query(
        `INSERT INTO public.crm_activities 
         (org_id, user_id, entity_type, entity_id, activity_type, title, description, metadata)
         VALUES ($1, $2, 'lead', $3, 'updated', $4, $5, $6)`,
        [req.user.orgId, req.user.id, id, 'Lead Updated', JSON.stringify(value), JSON.stringify(value)]
      );
    } catch (activityErr) {
      console.error('Failed to log activity:', activityErr);
    }

    const lead = result.rows[0];
    res.json({
      ...lead,
      // Ensure consistent field names for frontend
      name: lead.title || lead.name,
      title: lead.title || lead.name,
      company: lead.company_name || lead.company,
      // Map database status/stage to frontend expected values
      status: mapStatusToFrontend(lead.status),
      stage: mapStatusToFrontend(lead.stage),
      // Ensure value is a number
      value: lead.value ? Number(lead.value) : 0,
      // Format dates
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
    });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM public.leads WHERE id = $1 AND org_id = $2 RETURNING id`,
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'new') as new_leads,
        COUNT(*) FILTER (WHERE status = 'contacted') as contacted_leads,
        COUNT(*) FILTER (WHERE status = 'qualified') as qualified_leads,
        COUNT(*) FILTER (WHERE status = 'lost') as lost_leads,
        COALESCE(SUM(value) FILTER (WHERE status != 'lost'), 0) as total_value,
        COUNT(*) as total_leads
       FROM public.leads WHERE org_id = $1`,
      [req.user.orgId]
    );

    const stageStats = await db.query(
      `SELECT stage, COUNT(*), COALESCE(SUM(value), 0) as value
       FROM public.leads WHERE org_id = $1
       GROUP BY stage`,
      [req.user.orgId]
    );

    res.json({
      overview: stats.rows[0],
      byStage: stageStats.rows,
    });
  } catch (err) {
    next(err);
  }
};

const convertToDeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      'SELECT * FROM public.leads WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Lead not found' });
    const lead = rows[0];

    if (lead.converted_to_deal_id) {
      return res.status(200).json({ message: 'Lead already converted', dealId: lead.converted_to_deal_id });
    }

    const stage = lead.stage || 'qualification';
    const status = 'open';

    const { rows: dealRows } = await db.query(
      `INSERT INTO public.deals 
       (org_id, user_id, title, contact_id, company_id, stage, status, value, currency, probability, notes, tags, expected_close_date, converted_from_lead_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        req.user.orgId,
        req.user.id,
        lead.title || lead.name || 'Converted Lead',
        lead.contact_id,
        lead.company_id,
        stage,
        status,
        lead.value,
        lead.currency || 'USD',
        0, // probability
        lead.notes,
        lead.tags,
        lead.expected_close_date,
        id,
      ]
    );

    const deal = dealRows[0];

    await db.query(
      `UPDATE public.leads SET converted_to_deal_id = $1, converted_at = now(), status = 'converted', updated_at = now() WHERE id = $2`,
      [deal.id, id]
    );

    await db.query(
      `INSERT INTO public.crm_activities (org_id, user_id, entity_type, entity_id, activity_type, title, description)
       VALUES ($1, $2, 'lead', $3, 'converted', 'Lead converted to deal', $4)`,
      [req.user.orgId, req.user.id, id, `Deal ${deal.title}`]
    );

    // Return the deal with consistent formatting
    res.status(201).json({
      ...deal,
      // Ensure consistent field names for frontend
      name: deal.title || deal.name,
      title: deal.title || deal.name,
      company: deal.company_name || deal.company,
      // Ensure value is a number
      value: deal.value ? Number(deal.value) : 0,
      // Format dates
      createdAt: deal.created_at,
      updatedAt: deal.updated_at,
    });
  } catch (err) {
    next(err);
  }
};

const updateStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    if (!stage) {
      return res.status(400).json({ error: 'Stage is required' });
    }

    // Map frontend stage to database stage
    const dbStage = mapStatusToDatabase(stage);

    const result = await db.query(
      `UPDATE public.leads SET stage = $1, status = $1, updated_at = NOW()
       WHERE id = $2 AND org_id = $3
       RETURNING *`,
      [dbStage, id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Log activity
    try {
      await db.query(
        `INSERT INTO public.crm_activities 
         (org_id, user_id, entity_type, entity_id, activity_type, title, description)
         VALUES ($1, $2, 'lead', $3, 'stage_changed', $4, $5)`,
        [req.user.orgId, req.user.id, id, 'Lead Stage Changed', `Changed to ${stage}`]
      );
    } catch (activityErr) {
      console.error('Failed to log activity:', activityErr);
    }

    const lead = result.rows[0];

    // Fire workflow trigger for stage change (non-blocking)
    fireWorkflows(req.user.orgId, 'lead_stage_changed', lead, req.user.id);

    res.json({
      ...lead,
      // Ensure consistent field names for frontend
      name: lead.title || lead.name,
      title: lead.title || lead.name,
      company: lead.company_name || lead.company,
      // Map database status/stage to frontend expected values
      status: mapStatusToFrontend(lead.status),
      stage: mapStatusToFrontend(lead.stage),
      // Ensure value is a number
      value: lead.value ? Number(lead.value) : 0,
      // Format dates
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
    });
  } catch (err) {
    next(err);
  }
};

const getStages = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM pipeline_stages WHERE org_id = $1 ORDER BY sort_order ASC',
      [req.user.orgId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const createStage = async (req, res, next) => {
  try {
    const { stageName } = req.body;
    
    if (!stageName) {
      return res.status(400).json({ error: 'Stage name is required' });
    }

    const stageKey = stageName.toLowerCase().replace(/\s+/g, '_');
    
    const { rows: existing } = await db.query(
      'SELECT MAX(sort_order) as max_order FROM pipeline_stages WHERE org_id = $1',
      [req.user.orgId]
    );
    
    const sortOrder = (existing[0]?.max_order || 0) + 1;
    
    const { rows } = await db.query(
      `INSERT INTO pipeline_stages (org_id, stage_key, stage_label, sort_order) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (org_id, pipeline, stage_key) 
       DO UPDATE SET stage_label = $3 
       RETURNING *`,
      [req.user.orgId, stageKey, stageName, sortOrder]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// ── Bulk Import ──────────────────────────────────────────────────────────────
const importLeads = async (req, res) => {
  try {
    const { leads: rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No leads provided' });
    }

    const orgId = req.user.org_id;
    const userId = req.user.id;
    const created = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (!row.title && !row.name) { errors.push({ row: i + 1, error: 'Name/Title required' }); continue; }
        const result = await db.query(
          `INSERT INTO leads (
            id, org_id, title, status, stage, source, value, currency,
            email, phone, company_name, company_phone, company_email,
            designation, website, address, agent_name, service_interested,
            interaction_notes, company_size, decision_maker, created_by, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12,
            $13, $14, $15, $16, $17,
            $18, $19, $20, $21, NOW(), NOW()
          ) RETURNING id, title`,
          [
            orgId,
            row.title || row.name,
            row.status || 'new',
            row.stage || 'new',
            row.source || null,
            row.value ? Number(row.value) : null,
            row.currency || 'USD',
            row.email || null,
            row.phone || null,
            row.company_name || row.company || null,
            row.company_phone || null,
            row.company_email || null,
            row.designation || null,
            row.website || null,
            row.address || null,
            row.agent_name || null,
            row.service_interested || null,
            row.interaction_notes || row.notes || null,
            row.company_size || null,
            row.decision_maker || null,
            userId,
          ]
        );
        created.push(result.rows[0]);
      } catch (e) {
        errors.push({ row: i + 1, error: e.message });
      }
    }

    res.json({ imported: created.length, errors, total: rows.length });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  updateStage,
  remove,
  getStats,
  getStages,
  createStage,
  convertToDeal,
  importLeads,
};
