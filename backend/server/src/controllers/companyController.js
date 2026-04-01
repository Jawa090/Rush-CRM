const db = require('../config/database');
const Joi = require('joi');

const createCompanySchema = Joi.object({
  name: Joi.string().required(),
  industry: Joi.string().optional(),
  website: Joi.string().uri().optional().allow(''),
  phone: Joi.string().optional(),
  email: Joi.string().email().optional().allow(''),
  address: Joi.string().optional(),
  revenue: Joi.alternatives().try(Joi.number(), Joi.string()).optional().allow(null, ''),
  logoUrl: Joi.string().uri().optional().allow('', null),
  notes: Joi.string().optional(),
});

const updateCompanySchema = Joi.object({
  name: Joi.string().optional(),
  industry: Joi.string().optional().allow(null),
  website: Joi.string().uri().optional().allow(''),
  phone: Joi.string().optional().allow(null),
  email: Joi.string().email().optional().allow(''),
  address: Joi.string().optional().allow(null),
  revenue: Joi.alternatives().try(Joi.number(), Joi.string()).optional().allow(null, ''),
  logoUrl: Joi.string().uri().optional().allow('', null),
  notes: Joi.string().optional().allow(null),
}).min(1);

const normalizeCompanyInput = (body = {}) => {
  const revenueRaw = body.revenue ?? body.annual_revenue;
  const revenue = revenueRaw === '' || revenueRaw === null || revenueRaw === undefined
    ? null
    : revenueRaw;

  return {
    name: body.name ?? body.company_name,
    industry: body.industry ?? body.company_type ?? null,
    website: body.website ?? null,
    phone: body.phone ?? null,
    email: body.email ?? null,
    address: body.address ?? null,
    revenue,
    logoUrl: body.logoUrl ?? body.logo_url ?? null,
    notes: body.notes ?? body.comment ?? null,
  };
};

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, industry } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM public.companies WHERE org_id = $1`;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (industry) {
      query += ` AND industry = $${paramIndex}`;
      params.push(industry);
      paramIndex++;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR industry ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    const countResult = await db.query(
      'SELECT COUNT(*) FROM public.companies WHERE org_id = $1',
      [req.user.orgId]
    );

    res.json({
      data: result.rows,
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

    const result = await db.query(
      'SELECT * FROM public.companies WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const normalized = normalizeCompanyInput(req.body);
    const { error, value } = createCompanySchema.validate(normalized, { stripUnknown: true, allowUnknown: true });
    if (error) throw error;

    const { name, industry, website, phone, email, address, revenue, logoUrl, notes } = value;

    let result;
    try {
      // Prefer modern schema with created_by
      result = await db.query(
        `INSERT INTO public.companies 
         (org_id, name, industry, website, phone, email, address, revenue, logo_url, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [req.user.orgId, name, industry, website, phone, email, address, revenue, logoUrl, notes, req.user.id]
      );
    } catch (err) {
      if (err.code === '42703') {
        // Fallback for older schemas missing revenue/logo_url/notes/created_by/user_id
        result = await db.query(
          `INSERT INTO public.companies 
           (org_id, name, industry, website, phone, email, address)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [req.user.orgId, name, industry, website, phone, email, address]
        );
      } else {
        throw err;
      }
    }

    try {
      await db.query(
        `INSERT INTO public.crm_activities 
         (org_id, user_id, entity_type, entity_id, activity_type, title, description)
         VALUES ($1, $2, 'company', $3, 'created', $4, $5)`,
        [req.user.orgId, req.user.id, result.rows[0].id, 'Company Created', name]
      );
    } catch (activityErr) {
      console.error('Failed to log company activity:', activityErr.message || activityErr);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const normalized = normalizeCompanyInput(req.body);
    const { error, value } = updateCompanySchema.validate(normalized, { stripUnknown: true, allowUnknown: true });
    if (error) throw error;

    const { id } = req.params;

    const existingCompany = await db.query(
      'SELECT * FROM public.companies WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );
    if (existingCompany.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMapping = {
      name: 'name', industry: 'industry', website: 'website',
      phone: 'phone', email: 'email', address: 'address',
      revenue: 'revenue', logoUrl: 'logo_url', notes: 'notes',
    };

    for (const [key, val] of Object.entries(value)) {
      const dbField = fieldMapping[key];
      if (dbField) {
        fields.push(`${dbField} = $${paramIndex}`);
        values.push(val);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.companies SET ${fields.join(', ')}, updated_at = now()
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM public.companies WHERE id = $1 AND org_id = $2 RETURNING id`,
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ message: 'Company deleted successfully' });
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
