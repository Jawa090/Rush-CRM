const db = require('../config/database');
const Joi = require('joi');

const createDocumentSchema = Joi.object({
  title: Joi.string().required(),
  type: Joi.string().valid('contract', 'nda', 'purchase_order', 'invoice', 'certificate').required(),
  status: Joi.string().valid('draft', 'pending', 'signed', 'completed', 'cancelled').default('draft'),
  content: Joi.string().optional().allow(''),
  signers: Joi.array().items(Joi.string()).optional(),
  company_id: Joi.string().uuid().optional().allow(null, ''),
  contact_id: Joi.string().uuid().optional().allow(null, ''),
  expiry_date: Joi.date().optional().allow(null, ''),
  notes: Joi.string().optional().allow(''),
});

const updateDocumentSchema = Joi.object({
  title: Joi.string().optional(),
  type: Joi.string().valid('contract', 'nda', 'purchase_order', 'invoice', 'certificate').optional(),
  status: Joi.string().valid('draft', 'pending', 'signed', 'completed', 'cancelled').optional(),
  content: Joi.string().optional().allow(''),
  signers: Joi.array().items(Joi.string()).optional(),
  company_id: Joi.string().uuid().optional().allow(null, ''),
  contact_id: Joi.string().uuid().optional().allow(null, ''),
  expiry_date: Joi.date().optional().allow(null, ''),
  notes: Joi.string().optional().allow(''),
}).min(1);

// Get all documents for signing and management
const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, status, type } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        d.*,
        c.first_name as contact_first_name,
        c.last_name as contact_last_name,
        comp.name as company_name
      FROM public.documents d
      LEFT JOIN public.contacts c ON d.contact_id = c.id
      LEFT JOIN public.companies comp ON d.company_id = comp.id
      WHERE d.org_id = $1
    `;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (search) {
      query += ` AND (d.title ILIKE $${paramIndex} OR d.type ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status && status !== 'all') {
      query += ` AND d.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (type && type !== 'all') {
      query += ` AND d.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ` ORDER BY d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM public.documents WHERE org_id = $1`;
    const countParams = [req.user.orgId];
    let countParamIndex = 2;

    if (search) {
      countQuery += ` AND (title ILIKE $${countParamIndex} OR type ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (status && status !== 'all') {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (type && type !== 'all') {
      countQuery += ` AND type = $${countParamIndex}`;
      countParams.push(type);
      countParamIndex++;
    }

    const countResult = await db.query(countQuery, countParams);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get vault documents (signed/completed documents)
const getVault = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, type } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        d.*,
        c.first_name as contact_first_name,
        c.last_name as contact_last_name,
        comp.name as company_name
      FROM public.documents d
      LEFT JOIN public.contacts c ON d.contact_id = c.id
      LEFT JOIN public.companies comp ON d.company_id = comp.id
      WHERE d.org_id = $1 AND d.status IN ('signed', 'completed')
    `;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (search) {
      query += ` AND (d.title ILIKE $${paramIndex} OR comp.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (type && type !== 'all') {
      query += ` AND d.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ` ORDER BY d.signed_at DESC, d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM public.documents WHERE org_id = $1 AND status IN ('signed', 'completed')`;
    const countParams = [req.user.orgId];
    let countParamIndex = 2;

    if (search) {
      countQuery += ` AND (title ILIKE $${countParamIndex} OR EXISTS (SELECT 1 FROM companies comp WHERE comp.id = documents.company_id AND comp.name ILIKE $${countParamIndex}))`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (type && type !== 'all') {
      countQuery += ` AND type = $${countParamIndex}`;
      countParams.push(type);
      countParamIndex++;
    }

    const countResult = await db.query(countQuery, countParams);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT 
        d.*,
        c.first_name as contact_first_name,
        c.last_name as contact_last_name,
        comp.name as company_name
      FROM public.documents d
      LEFT JOIN public.contacts c ON d.contact_id = c.id
      LEFT JOIN public.companies comp ON d.company_id = comp.id
      WHERE d.id = $1 AND d.org_id = $2`,
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { error, value } = createDocumentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { 
      title, 
      type, 
      status, 
      content, 
      signers, 
      company_id, 
      contact_id, 
      expiry_date, 
      notes 
    } = value;

    // Convert empty strings to null for UUID fields
    const companyId = company_id && company_id.trim() !== '' ? company_id : null;
    const contactId = contact_id && contact_id.trim() !== '' ? contact_id : null;
    const expiryDate = expiry_date || null;

    const result = await db.query(
      `INSERT INTO public.documents (
        org_id, user_id, title, type, status, content, signers, 
        company_id, contact_id, expiry_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        req.user.orgId, 
        req.user.id, 
        title, 
        type, 
        status || 'draft', 
        content || '', 
        JSON.stringify(signers || []), 
        companyId, 
        contactId, 
        expiryDate, 
        notes || ''
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateDocumentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(value).forEach(([key, val]) => {
      if (key === 'signers') {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(JSON.stringify(val));
      } else if (key === 'company_id' || key === 'contact_id') {
        // Convert empty strings to null for UUID fields
        const cleanVal = val && val.trim() !== '' ? val : null;
        fields.push(`${key} = $${paramIndex++}`);
        values.push(cleanVal);
      } else {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(val);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add signed_at timestamp if status is being changed to signed
    if (value.status === 'signed') {
      fields.push(`signed_at = NOW()`);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.documents SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM public.documents WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getVault,
  getById,
  create,
  update,
  remove,
};