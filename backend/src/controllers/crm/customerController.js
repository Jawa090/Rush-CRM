const db = require('../../config/database');
const Joi = require('joi');

const createCustomerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().allow(null, ''),
  phone: Joi.string().allow(null, ''),
  status: Joi.string().allow(null, ''),
  tier: Joi.string().allow(null, ''),
  notes: Joi.string().allow(null, ''),
  tags: Joi.array().items(Joi.string()).optional(),
  leadId: Joi.string().uuid().allow(null, ''),
  dealId: Joi.string().uuid().allow(null, ''),
  companyId: Joi.string().uuid().allow(null, ''),
  industry: Joi.string().allow(null, ''),
});

const updateCustomerSchema = createCustomerSchema.min(1);

const mapDbCustomer = (row) => ({ ...row });

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*,
             co.name as company_name,
             co.email as company_email,
             co.phone as company_phone
      FROM customers c
      LEFT JOIN companies co ON co.id = c.company_id
      WHERE c.org_id = $1
    `;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (status) {
      query += ` AND c.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (c.name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex} OR c.industry ILIKE $${paramIndex} OR co.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const { rows } = await db.query(query, params);
    const count = await db.query('SELECT COUNT(*) FROM customers WHERE org_id = $1', [req.user.orgId]);

    res.json({
      data: rows.map(mapDbCustomer),
      pagination: {
        total: parseInt(count.rows[0].count, 10),
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(count.rows[0].count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      `SELECT c.*, co.name as company_name
       FROM customers c
       LEFT JOIN companies co ON co.id = c.company_id
       WHERE c.id = $1 AND c.org_id = $2`,
      [id, req.user.orgId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(mapDbCustomer(rows[0]));
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { error, value } = createCustomerSchema.validate(req.body, { stripUnknown: true, allowUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, email, phone, status, tier, notes, tags, leadId, dealId, companyId, industry } = value;
    const { rows } = await db.query(
      `INSERT INTO customers
       (org_id, user_id, name, email, phone, status, tier, notes, tags, lead_id, deal_id, company_id, industry, converted_from_lead_id, converted_from_deal_id)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'active'), $7, $8, $9, $10, $11, $12, $13, $10, $11)
       RETURNING *`,
      [req.user.orgId, req.user.id, name, email, phone, status, tier, notes, tags, leadId === '' ? null : leadId, dealId === '' ? null : dealId, companyId === '' ? null : companyId, industry]
    );
    res.status(201).json(mapDbCustomer(rows[0]));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateCustomerSchema.validate(req.body, { stripUnknown: true, allowUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const fields = [];
    const values = [];
    let idx = 1;
    const mapping = {
      name: 'name',
      email: 'email',
      phone: 'phone',
      status: 'status',
      tier: 'tier',
      notes: 'notes',
      tags: 'tags',
      leadId: 'lead_id',
      dealId: 'deal_id',
      companyId: 'company_id',
      industry: 'industry',
    };

    Object.entries(value).forEach(([key, val]) => {
      const column = mapping[key];
      if (column) {
        fields.push(`${column} = $${idx}`);
        // Handle empty strings for ID fields
        if ((column === 'lead_id' || column === 'deal_id' || column === 'company_id') && val === '') {
          values.push(null);
        } else {
          values.push(val);
        }
        idx++;
      }
    });

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    fields.push('updated_at = now()');
    values.push(id, req.user.orgId);

    const { rows } = await db.query(
      `UPDATE customers SET ${fields.join(', ')} WHERE id = $${idx} AND org_id = $${idx + 1} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(mapDbCustomer(rows[0]));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM customers WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
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
