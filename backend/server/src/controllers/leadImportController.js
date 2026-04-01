const db = require('../config/database');
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/imports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  }
});

// Detect fields from uploaded file
const detectFields = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let headers = [];
    let sampleData = [];

    if (ext === '.csv') {
      // Parse CSV
      const results = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => {
            if (results.length < 5) results.push(data);
          })
          .on('end', () => {
            if (results.length > 0) {
              headers = Object.keys(results[0]);
              sampleData = results;
            }
            resolve();
          })
          .on('error', reject);
      });
    } else {
      // Parse Excel
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length > 0) {
        headers = Object.keys(jsonData[0]);
        sampleData = jsonData.slice(0, 5);
      }
    }

    // Suggest field mappings based on common patterns
    const fieldMappings = suggestFieldMappings(headers);

    res.json({
      fileName: req.file.originalname,
      filePath: req.file.filename,
      headers,
      sampleData,
      suggestedMappings: fieldMappings,
      totalRows: sampleData.length
    });
  } catch (err) {
    next(err);
  }
};

// Smart field mapping suggestions
const suggestFieldMappings = (headers) => {
  const mappings = {};
  const patterns = {
    // Basic fields
    title: /^(title|name|lead[\s_]?name|contact[\s_]?name|full[\s_]?name|caller)$/i,
    email: /^(email|e[\s_-]?mail|contact[\s_]?email|mail)$/i,
    phone: /^(phone|mobile|telephone|contact[\s_]?number|tel|cell)$/i,
    company: /^(company|company[\s_]?name|organization|org|business)$/i,
    companyEmail: /^(company[\s_]?email|org[\s_]?email|business[\s_]?email)$/i,
    companyPhone: /^(company[\s_]?phone|org[\s_]?phone|business[\s_]?phone)$/i,
    designation: /^(designation|title|job[\s_]?title|position|role)$/i,
    
    // Status and source
    source: /^(source|lead[\s_]?source|origin|channel|first[\s_]?intent)$/i,
    status: /^(status|stage|lead[\s_]?status|current[\s_]?status|state)$/i,
    
    // Value and business
    value: /^(value|amount|deal[\s_]?value|revenue|price|offer)$/i,
    website: /^(website|url|web|site|link)$/i,
    address: /^(address|location|city|street|area)$/i,
    
    // Notes and communication
    notes: /^(notes|description|comments|remarks|details|leads[\s_]?notes)$/i,
    agentName: /^(agent|sales[\s_]?rep|assigned[\s_]?to|owner|handler)$/i,
    serviceInterested: /^(service|product|interest|interested[\s_]?in|offering)$/i,
    
    // Company details
    companySize: /^(company[\s_]?size|employees|team[\s_]?size|staff)$/i,
    decisionMaker: /^(decision[\s_]?maker|authority|buyer|dm)$/i,
    
    // Dates and tracking
    interactionNotes: /^(interaction|conversation|discussion|first[\s_]?reply|last[\s_]?reply)$/i,
    
    // Additional mappings for your specific fields
    // sr no -> skip (internal reference)
    // response date -> last_contacted_date or created_at
    // caller -> title/name
    // first reply -> interaction_notes
    // last reply -> interaction_notes
  };

  headers.forEach(header => {
    const lowerHeader = header.toLowerCase().trim();
    
    // Skip serial number fields
    if (/^(sr|s\.?no|serial|#|no\.)$/i.test(lowerHeader)) {
      mappings[header] = null;
      return;
    }
    
    // Check patterns
    for (const [field, pattern] of Object.entries(patterns)) {
      if (pattern.test(lowerHeader)) {
        mappings[header] = field;
        return;
      }
    }
    
    // If no match, keep as unmapped
    mappings[header] = null;
  });

  return mappings;
};

// Import leads with field mapping
const importLeads = async (req, res, next) => {
  try {
    const { filePath, fieldMapping, workspaceId, skipDuplicates = true } = req.body;

    if (!filePath || !fieldMapping) {
      return res.status(400).json({ error: 'File path and field mapping are required' });
    }

    const fullPath = path.join(__dirname, '../../uploads/imports', filePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Create import record
    const importRecord = await db.query(
      `INSERT INTO lead_imports 
       (org_id, workspace_id, imported_by, source_type, file_name, file_path, field_mapping, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.orgId,
        workspaceId || null,
        req.user.id,
        path.extname(filePath).toLowerCase() === '.csv' ? 'csv' : 'excel',
        path.basename(filePath),
        filePath,
        JSON.stringify(fieldMapping),
        'processing'
      ]
    );

    const importId = importRecord.rows[0].id;

    // Parse file
    const ext = path.extname(filePath).toLowerCase();
    let rows = [];

    if (ext === '.csv') {
      await new Promise((resolve, reject) => {
        fs.createReadStream(fullPath)
          .pipe(csv())
          .on('data', (data) => rows.push(data))
          .on('end', resolve)
          .on('error', reject);
      });
    } else {
      const workbook = XLSX.readFile(fullPath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(worksheet);
    }

    // Import leads
    let successful = 0;
    let failed = 0;
    let duplicates = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // Map fields
        const leadData = {};
        for (const [csvField, dbField] of Object.entries(fieldMapping)) {
          if (dbField && row[csvField]) {
            leadData[dbField] = row[csvField];
          }
        }

        // Validate required fields
        if (!leadData.title && !leadData.name) {
          errors.push({ row: i + 1, error: 'Title/Name is required' });
          failed++;
          continue;
        }

        // Check for duplicates
        if (skipDuplicates && leadData.email) {
          const existing = await db.query(
            'SELECT id FROM leads WHERE org_id = $1 AND email = $2',
            [req.user.orgId, leadData.email]
          );
          if (existing.rows.length > 0) {
            duplicates++;
            continue;
          }
        }

        // Build dynamic INSERT query based on available fields
        const columns = ['org_id', 'workspace_id', 'import_id', 'created_by', 'created_at', 'updated_at'];
        const values = [req.user.orgId, workspaceId || null, importId, req.user.id];
        let paramIndex = 5;

        // Add title/name (required)
        columns.push('title', 'name');
        values.push(leadData.title || leadData.name, leadData.name || leadData.title);
        paramIndex += 2;

        // Map all other fields dynamically
        const fieldMap = {
          email: 'email',
          phone: 'phone',
          company: 'company_name',
          companyName: 'company_name',
          companyEmail: 'company_email',
          companyPhone: 'company_phone',
          designation: 'designation',
          source: 'source',
          status: 'status',
          stage: 'stage',
          value: 'value',
          currency: 'currency',
          priority: 'priority',
          website: 'website',
          address: 'address',
          notes: 'notes',
          agentName: 'agent_name',
          serviceInterested: 'service_interested',
          companySize: 'company_size',
          decisionMaker: 'decision_maker',
          industry: 'source_info',
          country: 'address',
          city: 'address',
          state: 'address',
          zipCode: 'address',
          linkedIn: 'website',
          facebook: 'website',
          twitter: 'website',
          interactionNotes: 'interaction_notes',
          expectedCloseDate: 'expected_close_date',
          tags: 'tags',
          pipeline: 'pipeline',
        };

        for (const [frontendField, dbColumn] of Object.entries(fieldMap)) {
          if (leadData[frontendField] !== undefined && leadData[frontendField] !== null) {
            columns.push(dbColumn);
            
            // Handle special data types
            if (frontendField === 'value') {
              values.push(parseFloat(leadData[frontendField]) || null);
            } else if (frontendField === 'tags' && Array.isArray(leadData[frontendField])) {
              values.push(leadData[frontendField]);
            } else {
              values.push(leadData[frontendField]);
            }
            paramIndex++;
          }
        }

        // Set defaults for missing fields
        if (!leadData.source) {
          columns.push('source');
          values.push('import');
          paramIndex++;
        }
        if (!leadData.status) {
          columns.push('status');
          values.push('new');
          paramIndex++;
        }

        // Build placeholders
        const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');

        // Insert lead
        await db.query(
          `INSERT INTO leads (${columns.join(', ')}) 
           VALUES (${placeholders})`,
          values
        );
        successful++;
      } catch (err) {
        errors.push({ row: i + 1, error: err.message });
        failed++;
      }
    }

    // Update import record
    await db.query(
      `UPDATE lead_imports 
       SET total_rows = $1, successful_imports = $2, failed_imports = $3, 
           duplicate_skipped = $4, status = $5, error_log = $6, completed_at = NOW()
       WHERE id = $7`,
      [
        rows.length,
        successful,
        failed,
        duplicates,
        failed > 0 ? 'partial' : 'completed',
        JSON.stringify(errors),
        importId
      ]
    );

    res.json({
      importId,
      total: rows.length,
      successful,
      failed,
      duplicates,
      errors: errors.slice(0, 10) // Return first 10 errors
    });
  } catch (err) {
    next(err);
  }
};

// Get import history
const getImportHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, workspaceId } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT li.*, w.name as workspace_name
      FROM lead_imports li
      LEFT JOIN workgroups w ON w.id = li.workspace_id
      WHERE li.org_id = $1
    `;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (workspaceId) {
      query += ` AND li.workspace_id = $${paramIndex}`;
      params.push(workspaceId);
      paramIndex++;
    }

    query += ` ORDER BY li.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    const countResult = await db.query(
      'SELECT COUNT(*) FROM lead_imports WHERE org_id = $1',
      [req.user.orgId]
    );

    res.json({
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  upload,
  detectFields,
  importLeads,
  getImportHistory
};
