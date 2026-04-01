const db = require('../config/database');
const Joi = require('joi');

const createSigningPartySchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  companyId: Joi.string().uuid().optional(),
  position: Joi.string().optional(),
  notes: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

const updateSigningPartySchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional().allow(null),
  phone: Joi.string().optional().allow(null),
  companyId: Joi.string().uuid().optional().allow(null),
  position: Joi.string().optional().allow(null),
  notes: Joi.string().optional().allow(null),
  tags: Joi.array().items(Joi.string()).optional(),
}).min(1);

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, companyId } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, co.name as company_name
      FROM public.contacts c
      LEFT JOIN public.companies co ON co.id = c.company_id
      WHERE c.org_id = $1 AND c.contact_type = 'signing_party'
    `;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (companyId) {
      query += ` AND c.company_id = $${paramIndex}`;
      params.push(companyId);
      paramIndex++;
    }

    if (search) {
      query += ` AND (c.first_name ILIKE $${paramIndex} OR c.last_name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    const countResult = await db.query(
      `SELECT COUNT(*) FROM public.contacts WHERE org_id = $1 AND contact_type = 'signing_party'`,
      [req.user.orgId]
    );

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
      `SELECT c.*, co.name as company_name
       FROM public.contacts c
       LEFT JOIN public.companies co ON co.id = c.company_id
       WHERE c.id = $1 AND c.org_id = $2 AND c.contact_type = 'signing_party'`,
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Signing party not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { error, value } = createSigningPartySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { firstName, lastName, email, phone, companyId, position, notes, tags } = value;

    const result = await db.query(
      `INSERT INTO public.contacts 
       (org_id, user_id, first_name, last_name, email, phone, company_id, position, notes, tags, contact_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'signing_party')
       RETURNING *`,
      [req.user.orgId, req.user.id, firstName, lastName, email, phone, companyId, position, notes, tags]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateSigningPartySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(value).forEach(([key, val]) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      fields.push(`${snakeKey} = $${paramIndex++}`);
      values.push(val);
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, req.user.orgId);

    const query = `
      UPDATE public.contacts
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1} AND contact_type = 'signing_party'
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Signing party not found' });
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
      `DELETE FROM public.contacts 
       WHERE id = $1 AND org_id = $2 AND contact_type = 'signing_party'
       RETURNING id`,
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Signing party not found' });
    }

    res.json({ message: 'Signing party deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
