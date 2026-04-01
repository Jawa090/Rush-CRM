const db = require('../config/database');
const Joi = require('joi');

const createContactSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  companyId: Joi.string().uuid().optional().allow(null),
  position: Joi.string().optional(),
  source: Joi.string().optional(),
  notes: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

const updateContactSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional().allow(null),
  phone: Joi.string().optional().allow(null),
  companyId: Joi.string().uuid().optional().allow(null),
  position: Joi.string().optional().allow(null),
  source: Joi.string().optional().allow(null),
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
      WHERE c.org_id = $1
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
      'SELECT COUNT(*) FROM public.contacts WHERE org_id = $1',
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
      `SELECT c.*, co.name as company_name
       FROM public.contacts c
       LEFT JOIN public.companies co ON co.id = c.company_id
       WHERE c.id = $1 AND c.org_id = $2`,
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const normalizeContactInput = (body = {}) => {
  const companyId = body.companyId ?? body.company_id;
  return {
    firstName: body.firstName ?? body.first_name,
    lastName: body.lastName ?? body.last_name,
    email: body.email ?? null,
    phone: body.phone ?? null,
    companyId: companyId === '' ? null : companyId ?? null,
    position: body.position ?? body.title ?? body.job_title ?? null,
    source: body.source ?? null,
    notes: body.notes ?? null,
    tags: body.tags ?? body.labels ?? undefined,
  };
};

const create = async (req, res, next) => {
  try {
    const normalized = normalizeContactInput(req.body);
    const { error, value } = createContactSchema.validate(normalized, { stripUnknown: true, allowUnknown: true });
    if (error) throw error;

    const { firstName, lastName, email, phone, companyId, position, source, notes, tags } = value;

    let result;
    try {
      result = await db.query(
        `INSERT INTO public.contacts 
         (org_id, first_name, last_name, email, phone, company_id, position, notes, tags, contact_type, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [req.user.orgId, firstName, lastName, email, phone, companyId, position, notes, tags, 'contact', req.user.id]
      );
    } catch (err) {
      if (err.code === '42703') {
        // Fallback for older schemas without position/contact_type/created_by/notes/tags
        result = await db.query(
          `INSERT INTO public.contacts 
           (org_id, first_name, last_name, email, phone, company_id)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [req.user.orgId, firstName, lastName, email, phone, companyId]
        );
      } else {
        throw err;
      }
    }

    try {
      await db.query(
        `INSERT INTO public.crm_activities 
         (org_id, user_id, entity_type, entity_id, activity_type, title, description)
         VALUES ($1, $2, 'contact', $3, 'created', $4, $5)`,
        [req.user.orgId, req.user.id, result.rows[0].id, 'Contact Created', `${firstName} ${lastName || ''}`]
      );
    } catch (activityErr) {
      console.error('Failed to log contact activity:', activityErr.message || activityErr);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const normalized = normalizeContactInput(req.body);
    const { error, value } = updateContactSchema.validate(normalized, { stripUnknown: true, allowUnknown: true });
    if (error) throw error;

    const { id } = req.params;

    const existingContact = await db.query(
      'SELECT * FROM public.contacts WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );
    if (existingContact.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMapping = {
      firstName: 'first_name', lastName: 'last_name', email: 'email',
      phone: 'phone', companyId: 'company_id', position: 'position',
      source: 'source', notes: 'notes', tags: 'tags',
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
      `UPDATE public.contacts SET ${fields.join(', ')}, updated_at = now()
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
      `DELETE FROM public.contacts WHERE id = $1 AND org_id = $2 RETURNING id`,
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
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
