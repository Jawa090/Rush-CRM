const db = require('../config/database');
const Joi = require('joi');

const createContactSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().optional().allow('', null),
  email: Joi.string().email().optional().allow('', null),
  phone: Joi.string().optional().allow('', null),
  companyId: Joi.string().uuid().optional().allow('', null),
  companyName: Joi.string().optional().allow('', null),
  position: Joi.string().optional().allow('', null),
  source: Joi.string().optional().allow('', null),
  contactType: Joi.string().optional().allow('', null),
  address: Joi.string().optional().allow('', null),
  messenger: Joi.string().optional().allow('', null),
  notes: Joi.string().optional().allow('', null),
  tags: Joi.array().items(Joi.string()).optional(),
  availableToEveryone: Joi.boolean().optional(),
  includedInExport: Joi.boolean().optional(),
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
      SELECT c.*, COALESCE(co.name, c.company_name) as company_name
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
      query += ` AND (c.first_name ILIKE $${paramIndex} OR c.last_name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex} OR c.company_name ILIKE $${paramIndex} OR co.name ILIKE $${paramIndex})`;
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
    companyName: body.companyName ?? body.company_name ?? null,
    position: body.position ?? body.title ?? body.job_title ?? null,
    source: body.source ?? null,
    notes: body.notes ?? null,
    tags: body.tags ?? body.labels ?? undefined,
    contactType: body.contactType ?? body.contact_type ?? 'contact',
    address: body.address ?? null,
    messenger: body.messenger ?? null,
    availableToEveryone: body.availableToEveryone ?? body.available_to_everyone ?? true,
    includedInExport: body.includedInExport ?? body.included_in_export ?? true,
  };
};

const create = async (req, res, next) => {
  try {
    const normalized = normalizeContactInput(req.body);
    const { error, value } = createContactSchema.validate(normalized, { stripUnknown: true, allowUnknown: true });
    if (error) throw error;

    const { firstName, lastName, email, phone, companyId, companyName, position, source, notes, tags, contactType, address, messenger, availableToEveryone, includedInExport } = value;
    const { rows } = await db.query(
      `INSERT INTO public.contacts 
       (org_id, first_name, last_name, email, phone, company_id, company_name, position, source, notes, tags, contact_type, address, messenger, available_to_everyone, included_in_export, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [req.user.orgId, firstName, lastName, email, phone, companyId, companyName, position, source, notes, tags, contactType, address, messenger, availableToEveryone, includedInExport, req.user.id]
    );

    try {
      await db.query(
        `INSERT INTO public.crm_activities 
         (org_id, user_id, entity_type, entity_id, activity_type, title, description)
         VALUES ($1, $2, 'contact', $3, 'created', $4, $5)`,
        [req.user.orgId, req.user.id, rows[0].id, 'Contact Created', `${firstName} ${lastName || ''}`]
      );
    } catch (activityErr) {
      console.error('Failed to log contact activity:', activityErr.message || activityErr);
    }

    res.status(201).json(rows[0]);
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
      phone: 'phone', companyId: 'company_id', companyName: 'company_name',
      position: 'position', source: 'source', notes: 'notes', tags: 'tags',
      contactType: 'contact_type',
      availableToEveryone: 'available_to_everyone',
      includedInExport: 'included_in_export',
      address: 'address',
      messenger: 'messenger',
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
