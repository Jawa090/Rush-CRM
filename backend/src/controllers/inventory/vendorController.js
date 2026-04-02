const db = require('../../config/database');
const Joi = require('joi');

const createVendorSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  contactPerson: Joi.string().optional().allow(''),
  businessType: Joi.string().optional().allow(''),
  website: Joi.string().optional().allow(''),
  notes: Joi.string().optional().allow(''),
  status: Joi.string().optional().default('active'),
  rating: Joi.number().optional(),
});

const updateVendorSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional().allow('', null),
  phone: Joi.string().optional().allow('', null),
  address: Joi.string().optional().allow('', null),
  contactPerson: Joi.string().optional().allow('', null),
  businessType: Joi.string().optional().allow('', null),
  website: Joi.string().optional().allow('', null),
  notes: Joi.string().optional().allow('', null),
  status: Joi.string().optional(),
  rating: Joi.number().optional().allow(null),
}).min(1);

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM public.vendors WHERE org_id = $1`;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    const countQuery = `SELECT COUNT(*) FROM public.vendors WHERE org_id = $1${search ? ` AND (name ILIKE $2 OR email ILIKE $2 OR phone ILIKE $2)` : ''}`;
    const countParams = search ? [req.user.orgId, `%${search}%`] : [req.user.orgId];
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
      'SELECT * FROM public.vendors WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { error, value } = createVendorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, phone, address, contactPerson, businessType, website, notes, status, rating } = value;

    const result = await db.query(
      `INSERT INTO public.vendors (org_id, created_by, name, email, phone, address, contact_person, business_type, website, notes, status, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [req.user.orgId, req.user.id, name, email, phone, address, contactPerson, businessType, website, notes, status || 'active', rating || 4.0]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateVendorSchema.validate(req.body);
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

    const result = await db.query(
      `UPDATE public.vendors SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
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
      'DELETE FROM public.vendors WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({ message: 'Vendor deleted successfully' });
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
