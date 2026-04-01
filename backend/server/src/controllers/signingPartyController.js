const db = require('../config/database');
const Joi = require('joi');

const createSigningPartySchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().optional().allow(''),
  secondName: Joi.string().optional().allow(''),
  salutation: Joi.string().optional().allow(''),
  dob: Joi.date().optional().allow('', null),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  companyId: Joi.string().uuid().optional().allow('', null),
  position: Joi.string().optional().allow(''),
  website: Joi.string().optional().allow(''),
  websiteType: Joi.string().optional().allow(''),
  messenger: Joi.string().optional().allow(''),
  messengerType: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  contactType: Joi.string().optional().allow(''),
  source: Joi.string().optional().allow(''),
  sourceInfo: Joi.string().optional().allow(''),
  isPublic: Joi.boolean().optional(),
  includeInExport: Joi.boolean().optional(),
  responsibleId: Joi.string().uuid().optional().allow('', null),
  observers: Joi.array().items(Joi.string().uuid()).optional(),
  notes: Joi.string().optional().allow(''),
  tags: Joi.array().items(Joi.string()).optional(),
});

const updateSigningPartySchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional().allow('', null),
  secondName: Joi.string().optional().allow('', null),
  salutation: Joi.string().optional().allow('', null),
  dob: Joi.date().optional().allow('', null),
  email: Joi.string().email().optional().allow('', null),
  phone: Joi.string().optional().allow('', null),
  companyId: Joi.string().uuid().optional().allow('', null),
  position: Joi.string().optional().allow('', null),
  website: Joi.string().optional().allow('', null),
  websiteType: Joi.string().optional().allow('', null),
  messenger: Joi.string().optional().allow('', null),
  messengerType: Joi.string().optional().allow('', null),
  address: Joi.string().optional().allow('', null),
  contactType: Joi.string().optional().allow('', null),
  source: Joi.string().optional().allow('', null),
  sourceInfo: Joi.string().optional().allow('', null),
  isPublic: Joi.boolean().optional(),
  includeInExport: Joi.boolean().optional(),
  responsibleId: Joi.string().uuid().optional().allow('', null),
  observers: Joi.array().items(Joi.string().uuid()).optional(),
  notes: Joi.string().optional().allow('', null),
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
      WHERE c.org_id = $1 AND (c.contact_type = 'signing_party' OR c.contact_type = 'clients' OR c.contact_type = 'contact')
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
      `SELECT COUNT(*) FROM public.contacts WHERE org_id = $1 AND (contact_type = 'signing_party' OR contact_type = 'clients' OR contact_type = 'contact')`,
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
       WHERE c.id = $1 AND c.org_id = $2`,
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

    const {
      firstName, lastName, secondName, salutation, dob,
      email, phone, companyId, position, website, websiteType,
      messenger, messengerType, address, contactType,
      source, sourceInfo, isPublic, includeInExport, responsibleId, observers, notes, tags
    } = value;

    const result = await db.query(
      `INSERT INTO public.contacts 
       (org_id, user_id, first_name, last_name, second_name, salutation, dob, 
        email, phone, company_id, position, website, website_type, 
        messenger, messenger_type, address, contact_type, 
        source, source_info, is_public, include_in_export, responsible_id, observers, notes, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
       RETURNING *`,
      [
        req.user.orgId, req.user.id, firstName, lastName, secondName, salutation, dob || null,
        email, phone, companyId || null, position, website, websiteType,
        messenger, messengerType, address, contactType || 'signing_party',
        source, sourceInfo, isPublic ?? true, includeInExport ?? true, 
        responsibleId || null, observers || [], notes, tags || []
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
    const idIndex = paramIndex++;
    const orgIdIndex = paramIndex++;
    values.push(id, req.user.orgId);

    const query = `
      UPDATE public.contacts
      SET ${fields.join(', ')}
      WHERE id = $${idIndex} AND org_id = $${orgIdIndex}
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
