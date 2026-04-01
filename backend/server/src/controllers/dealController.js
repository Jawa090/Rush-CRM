const db = require('../config/database');
const Joi = require('joi');
const { fireWorkflows } = require('../services/workflowEngine');

const createDealSchema = Joi.object({
  title: Joi.string().required(),
  contactId: Joi.string().uuid().optional().allow(null),
  companyId: Joi.string().uuid().optional().allow(null),
  stage: Joi.string().default('qualification'),
  status: Joi.string().default('open'),
  value: Joi.number().optional().allow(null),
  currency: Joi.string().default('USD'),
  probability: Joi.number().integer().min(0).max(100).default(0),
  notes: Joi.string().optional().allow(null, ''),
  tags: Joi.array().items(Joi.string()).optional(),
  expectedCloseDate: Joi.date().optional().allow(null),
  // Additional marketing and contact fields
  contactName: Joi.string().optional().allow(null, ''),
  companyName: Joi.string().optional().allow(null, ''),
  phone: Joi.string().optional().allow(null, ''),
  email: Joi.string().email().optional().allow(null, ''),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  source: Joi.string().optional().allow(null, ''),
  description: Joi.string().optional().allow(null, ''),
  designation: Joi.string().optional().allow(null, ''),
  website: Joi.string().optional().allow(null, ''),
  address: Joi.string().optional().allow(null, ''),
  companyPhone: Joi.string().optional().allow(null, ''),
  companyEmail: Joi.string().optional().allow(null, ''),
  companySize: Joi.string().optional().allow(null, ''),
  agentName: Joi.string().optional().allow(null, ''),
  decisionMaker: Joi.string().optional().allow(null, ''),
  serviceInterested: Joi.string().optional().allow(null, ''),
  interactionNotes: Joi.string().optional().allow(null, ''),
  firstMessage: Joi.string().optional().allow(null, ''),
  lastTouch: Joi.date().optional().allow(null),
  workspaceId: Joi.string().uuid().optional().allow(null),
  sourceInfo: Joi.string().optional().allow(null, ''),
  phoneType: Joi.string().optional().allow(null, ''),
  emailType: Joi.string().optional().allow(null, ''),
  websiteType: Joi.string().optional().allow(null, ''),
  customerType: Joi.string().optional().allow(null, ''),
  lastContactedDate: Joi.date().optional().allow(null),
  nextFollowUpDate: Joi.date().optional().allow(null),
  responsiblePerson: Joi.string().uuid().optional().allow(null),
});

const normalizeDealInput = (body = {}) => {
  const valueNumber = body.value === undefined || body.value === null || body.value === ''
    ? undefined
    : Number(body.value);

  const getVal = (camel, snake) => {
    if (body[camel] !== undefined) return body[camel];
    if (body[snake] !== undefined) return body[snake];
    return undefined;
  };

  return {
    title: getVal('title', 'title'),
    contactId: getVal('contactId', 'contact_id'),
    companyId: getVal('companyId', 'company_id'),
    stage: getVal('stage', 'stage'),
    status: getVal('status', 'status'),
    value: Number.isNaN(valueNumber) ? undefined : valueNumber,
    currency: getVal('currency', 'currency'),
    probability: getVal('probability', 'probability'),
    notes: getVal('notes', 'notes'),
    tags: getVal('tags', 'tags'),
    expectedCloseDate: getVal('expectedCloseDate', 'expected_close_date'),
    assignedTo: getVal('assignedTo', 'assigned_to'),
    lostReason: getVal('lostReason', 'lost_reason'),
    // Additional marketing and contact fields
    contactName: getVal('contactName', 'contact_name'),
    companyName: getVal('companyName', 'company_name'),
    phone: getVal('phone', 'phone'),
    email: getVal('email', 'email'),
    priority: getVal('priority', 'priority'),
    source: getVal('source', 'source'),
    description: getVal('description', 'description'),
    designation: getVal('designation', 'designation'),
    website: getVal('website', 'website'),
    address: getVal('address', 'address'),
    companyPhone: getVal('companyPhone', 'company_phone'),
    companyEmail: getVal('companyEmail', 'company_email'),
    companySize: getVal('companySize', 'company_size'),
    agentName: getVal('agentName', 'agent_name'),
    decisionMaker: getVal('decisionMaker', 'decision_maker'),
    serviceInterested: getVal('serviceInterested', 'service_interested'),
    interactionNotes: getVal('interactionNotes', 'interaction_notes'),
    firstMessage: getVal('firstMessage', 'first_message'),
    lastTouch: getVal('lastTouch', 'last_touch'),
    workspaceId: getVal('workspaceId', 'workspace_id'),
    sourceInfo: getVal('sourceInfo', 'source_info'),
    phoneType: getVal('phoneType', 'phone_type'),
    emailType: getVal('emailType', 'email_type'),
    websiteType: getVal('websiteType', 'website_type'),
    customerType: getVal('customerType', 'customer_type'),
    lastContactedDate: getVal('lastContactedDate', 'last_contacted_date'),
    nextFollowUpDate: getVal('nextFollowUpDate', 'next_follow_up_date'),
    responsiblePerson: getVal('responsiblePerson', 'responsible_person'),
  };
};

const updateDealSchema = Joi.object({
  title: Joi.string().optional(),
  contactId: Joi.string().uuid().optional().allow(null),
  companyId: Joi.string().uuid().optional().allow(null),
  stage: Joi.string().optional(),
  status: Joi.string().optional(),
  value: Joi.number().optional().allow(null),
  currency: Joi.string().optional(),
  probability: Joi.number().integer().min(0).max(100).optional(),
  notes: Joi.string().optional().allow(null),
  tags: Joi.array().items(Joi.string()).optional(),
  expectedCloseDate: Joi.date().optional().allow(null),
  assignedTo: Joi.string().uuid().optional().allow(null),
  lostReason: Joi.string().optional().allow(null),
  // Additional marketing and contact fields
  contactName: Joi.string().optional().allow(null, ''),
  companyName: Joi.string().optional().allow(null, ''),
  phone: Joi.string().optional().allow(null, ''),
  email: Joi.string().email().optional().allow(null, ''),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  source: Joi.string().optional().allow(null, ''),
  description: Joi.string().optional().allow(null, ''),
  designation: Joi.string().optional().allow(null, ''),
  website: Joi.string().optional().allow(null, ''),
  address: Joi.string().optional().allow(null, ''),
  companyPhone: Joi.string().optional().allow(null, ''),
  companyEmail: Joi.string().optional().allow(null, ''),
  companySize: Joi.string().optional().allow(null, ''),
  agentName: Joi.string().optional().allow(null, ''),
  decisionMaker: Joi.string().optional().allow(null, ''),
  serviceInterested: Joi.string().optional().allow(null, ''),
  interactionNotes: Joi.string().optional().allow(null, ''),
  firstMessage: Joi.string().optional().allow(null, ''),
  lastTouch: Joi.date().optional().allow(null),
  workspaceId: Joi.string().uuid().optional().allow(null),
  sourceInfo: Joi.string().optional().allow(null, ''),
  phoneType: Joi.string().optional().allow(null, ''),
  emailType: Joi.string().optional().allow(null, ''),
  websiteType: Joi.string().optional().allow(null, ''),
  customerType: Joi.string().optional().allow(null, ''),
  lastContactedDate: Joi.date().optional().allow(null),
  nextFollowUpDate: Joi.date().optional().allow(null),
  responsiblePerson: Joi.string().uuid().optional().allow(null),
}).min(1);

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, stage, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT d.*,
             c.first_name as contact_first_name, c.last_name as contact_last_name, c.email as contact_email, c.phone as contact_phone,
             co.name as linked_company_name, co.email as linked_company_email, co.phone as linked_company_phone
      FROM public.deals d
      LEFT JOIN public.contacts c ON c.id = d.contact_id
      LEFT JOIN public.companies co ON co.id = d.company_id
      WHERE d.org_id = $1
    `;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (stage) {
      query += ` AND d.stage = $${paramIndex}`;
      params.push(stage);
      paramIndex++;
    }

    if (status) {
      query += ` AND d.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND (d.title ILIKE $${paramIndex} OR co.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    const countResult = await db.query(
      'SELECT COUNT(*) FROM public.deals WHERE org_id = $1',
      [req.user.orgId]
    );

    res.json({
      data: result.rows.map(deal => ({
        ...deal,
        // Ensure consistent field names for frontend - prioritize linked entities but fallback to deal's own fields
        company: deal.linked_company_name || deal.company_name || deal.company,
        companyName: deal.linked_company_name || deal.company_name || deal.company,
        companyPhone: deal.linked_company_phone || deal.company_phone,
        companyEmail: deal.linked_company_email || deal.company_email,
        contactName: deal.contact_first_name ? `${deal.contact_first_name} ${deal.contact_last_name || ''}`.trim() : deal.contact_name || deal.name,
        contactEmail: deal.contact_email || deal.email,
        contactPhone: deal.contact_phone || deal.phone,
        // Ensure value is a number
        value: deal.value ? Number(deal.value) : 0,
        // Format dates
        createdAt: deal.created_at,
        updatedAt: deal.updated_at,
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

    const result = await db.query(
      `SELECT d.*,
              c.first_name as contact_first_name, c.last_name as contact_last_name, c.email as contact_email, c.phone as contact_phone,
              co.name as linked_company_name, co.email as linked_company_email, co.phone as linked_company_phone
       FROM public.deals d
       LEFT JOIN public.contacts c ON c.id = d.contact_id
       LEFT JOIN public.companies co ON co.id = d.company_id
       WHERE d.id = $1 AND d.org_id = $2`,
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const deal = result.rows[0];

    const { rows: contactLinks } = await db.query(
      `SELECT dc.id, dc.deal_id, dc.contact_id, dc.role, dc.primary_contact,
              c.first_name, c.last_name, c.email, c.phone, c.company_id
       FROM deal_contacts dc
       LEFT JOIN contacts c ON c.id = dc.contact_id
       WHERE dc.deal_id = $1 AND dc.org_id = $2`,
      [id, req.user.orgId]
    );

    const { rows: signingPartyLinks } = await db.query(
      `SELECT dsp.id, dsp.deal_id, dsp.contact_id, dsp.role,
              c.first_name, c.last_name, c.email, c.phone, c.company_id
       FROM deal_signing_parties dsp
       LEFT JOIN contacts c ON c.id = dsp.contact_id
       WHERE dsp.deal_id = $1 AND dsp.org_id = $2`,
      [id, req.user.orgId]
    );

    deal.contacts = contactLinks;
    deal.signing_parties = signingPartyLinks;

    res.json({
      ...deal,
      // Ensure consistent field names for frontend
      company: deal.linked_company_name || deal.company_name || deal.company,
      companyName: deal.linked_company_name || deal.company_name || deal.company,
      companyPhone: deal.linked_company_phone || deal.company_phone,
      companyEmail: deal.linked_company_email || deal.company_email,
      contactName: deal.contact_first_name ? `${deal.contact_first_name} ${deal.contact_last_name || ''}`.trim() : deal.contact_name || deal.name,
      contactEmail: deal.contact_email || deal.email,
      contactPhone: deal.contact_phone || deal.phone,
      // Ensure value is a number
      value: deal.value ? Number(deal.value) : 0,
      // Format dates
      createdAt: deal.created_at,
      updatedAt: deal.updated_at,
      contacts: contactLinks,
      signing_parties: signingPartyLinks,
    });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const normalized = normalizeDealInput(req.body);
    const { error, value } = createDealSchema.validate(normalized, { stripUnknown: true, allowUnknown: true });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { 
      title, contactId, companyId, stage, status, value: dealValue, currency, 
      probability, notes, tags, expectedCloseDate, 
      contactName, companyName, phone, email, priority, source, description,
      designation, website, address, companyPhone, companyEmail, companySize,
      agentName, decisionMaker, serviceInterested, interactionNotes, 
      firstMessage, lastTouch, workspaceId, sourceInfo, 
      phoneType, emailType, websiteType, customerType, 
      lastContactedDate, nextFollowUpDate, responsiblePerson
    } = value;

    const result = await db.query(
      `INSERT INTO public.deals 
       (
         org_id, user_id, title, contact_id, company_id, stage, status, 
         value, currency, probability, notes, tags, expected_close_date, 
         contact_name, company_name, phone, email, priority, source, description,
         designation, website, address, company_phone, company_email, company_size,
         agent_name, decision_maker, service_interested, interaction_notes, 
         first_message, last_touch, workspace_id, source_info, 
         phone_type, email_type, website_type, customer_type, 
         last_contacted_date, next_follow_up_date, responsible_person
       )
       VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 
         $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
         $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38,
         $39, $40, $41
       )
       RETURNING *`,
      [
        req.user.orgId, req.user.id, title, contactId, companyId, stage, status, 
        dealValue, currency, probability, notes, tags, expectedCloseDate, 
        contactName, companyName, phone, email, priority, source, description,
        designation, website, address, companyPhone, companyEmail, companySize,
        agentName, decisionMaker, serviceInterested, interactionNotes, 
        firstMessage, lastTouch, workspaceId, sourceInfo, 
        phoneType, emailType, websiteType, customerType, 
        lastContactedDate, nextFollowUpDate, responsiblePerson
      ]
    );

    // Log activity
    try {
      await db.query(
        `INSERT INTO public.crm_activities 
         (org_id, user_id, entity_type, entity_id, activity_type, title, description)
         VALUES ($1, $2, 'deal', $3, 'created', $4, $5)`,
        [req.user.orgId, req.user.id, result.rows[0].id, 'Deal Created', title]
      );
    } catch (activityErr) {
      console.error('Failed to log activity:', activityErr);
    }

    const deal = result.rows[0];

    // Fire workflow trigger (non-blocking)
    fireWorkflows(req.user.orgId, 'deal_created', deal, req.user.id);

    res.status(201).json({
      ...deal,
      // Ensure consistent field names for frontend
      company: deal.linked_company_name || deal.company_name || deal.company,
      companyName: deal.linked_company_name || deal.company_name || deal.company,
      companyPhone: deal.linked_company_phone || deal.company_phone,
      companyEmail: deal.linked_company_email || deal.company_email,
      contactName: deal.contact_first_name ? `${deal.contact_first_name} ${deal.contact_last_name || ''}`.trim() : deal.contact_name || deal.name,
      contactEmail: deal.contact_email || deal.email,
      contactPhone: deal.contact_phone || deal.phone,
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

const update = async (req, res, next) => {
  try {
    const normalized = normalizeDealInput(req.body);
    const { error, value } = updateDealSchema.validate(normalized);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { id } = req.params;

    const existingDeal = await db.query(
      'SELECT * FROM public.deals WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );
    if (existingDeal.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    const fieldMapping = {
      title: 'title', stage: 'stage', status: 'status', value: 'value',
      currency: 'currency', probability: 'probability', notes: 'notes',
      tags: 'tags', contactId: 'contact_id', companyId: 'company_id',
      assignedTo: 'assigned_to', lostReason: 'lost_reason',
      contactName: 'contact_name', companyName: 'company_name',
      phone: 'phone', email: 'email', priority: 'priority', source: 'source',
      description: 'description', designation: 'designation',
      website: 'website', address: 'address',
      companyPhone: 'company_phone', companyEmail: 'company_email',
      companySize: 'company_size', agentName: 'agent_name',
      decisionMaker: 'decision_maker', serviceInterested: 'service_interested',
      interactionNotes: 'interaction_notes', firstMessage: 'first_message',
      sourceInfo: 'source_info', phoneType: 'phone_type',
      emailType: 'email_type', websiteType: 'website_type',
      customerType: 'customer_type', workspaceId: 'workspace_id',
      responsiblePerson: 'responsible_person'
    };

    const dbFieldMapping = {
      expectedCloseDate: 'expected_close_date',
      lastTouch: 'last_touch',
      lastContactedDate: 'last_contacted_date',
      nextFollowUpDate: 'next_follow_up_date',
    };

    for (const [key, val] of Object.entries(value)) {
      const dbField = dbFieldMapping[key] || fieldMapping[key];
      if (dbField && val !== undefined) {
        fields.push(`${dbField} = $${paramIndex}`);
        values.push(val);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    if (value.status === 'won') {
      fields.push(`won_at = now()`);
    } else if (value.status === 'lost') {
      fields.push(`lost_at = now()`);
    }

    fields.push(`updated_at = now()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.deals SET ${fields.join(', ')}
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    // Log activity
    try {
      await db.query(
        `INSERT INTO public.crm_activities 
         (org_id, user_id, entity_type, entity_id, activity_type, title, description, metadata)
         VALUES ($1, $2, 'deal', $3, 'updated', $4, $5, $6)`,
        [req.user.orgId, req.user.id, id, 'Deal Updated', JSON.stringify(value), JSON.stringify(value)]
      );
    } catch (activityErr) {
      console.error('Failed to log activity:', activityErr);
    }

    const deal = result.rows[0];
    res.json({
      ...deal,
      // Ensure consistent field names for frontend
      company: deal.linked_company_name || deal.company_name || deal.company,
      companyName: deal.linked_company_name || deal.company_name || deal.company,
      companyPhone: deal.linked_company_phone || deal.company_phone,
      companyEmail: deal.linked_company_email || deal.company_email,
      contactName: deal.contact_first_name ? `${deal.contact_first_name} ${deal.contact_last_name || ''}`.trim() : deal.contact_name || deal.name,
      contactEmail: deal.contact_email || deal.email,
      contactPhone: deal.contact_phone || deal.phone,
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

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM public.deals WHERE id = $1 AND org_id = $2 RETURNING id`,
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json({ message: 'Deal deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'open') as open_deals,
        COUNT(*) FILTER (WHERE status = 'won') as won_deals,
        COUNT(*) FILTER (WHERE status = 'lost') as lost_deals,
        COALESCE(SUM(value) FILTER (WHERE status = 'won'), 0) as total_won_value,
        COALESCE(SUM(value) FILTER (WHERE status = 'open'), 0) as total_open_value,
        COUNT(*) as total_deals
       FROM public.deals WHERE org_id = $1`,
      [req.user.orgId]
    );

    const stageStats = await db.query(
      `SELECT stage, COUNT(*), COALESCE(SUM(value), 0) as value, AVG(probability) as avg_probability
       FROM public.deals WHERE org_id = $1 AND status = 'open'
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

const updateStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    if (!stage) {
      return res.status(400).json({ error: 'Stage is required' });
    }

    const result = await db.query(
      `UPDATE public.deals SET stage = $1, updated_at = now()
       WHERE id = $2 AND org_id = $3
       RETURNING *`,
      [stage, id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Log activity
    try {
      await db.query(
        `INSERT INTO public.crm_activities 
         (org_id, user_id, entity_type, entity_id, activity_type, title, description)
         VALUES ($1, $2, 'deal', $3, 'stage_changed', $4, $5)`,
        [req.user.orgId, req.user.id, id, 'Deal Stage Changed', `Changed to ${stage}`]
      );
    } catch (activityErr) {
      console.error('Failed to log activity:', activityErr);
    }

    const deal = result.rows[0];

    // Fire workflow trigger for stage change (non-blocking)
    fireWorkflows(req.user.orgId, 'deal_stage_changed', deal, req.user.id);

    res.json({
      ...deal,
      company: deal.linked_company_name || deal.company_name || deal.company,
      companyName: deal.linked_company_name || deal.company_name || deal.company,
      contactName: deal.contact_first_name ? `${deal.contact_first_name} ${deal.contact_last_name || ''}`.trim() : deal.contact_name || deal.name,
      value: deal.value ? Number(deal.value) : 0,
      createdAt: deal.created_at,
      updatedAt: deal.updated_at,
    });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const fields = ['status = $1', 'updated_at = now()'];
    const values = [status];

    if (status === 'won') {
      fields.push('won_at = now()');
    } else if (status === 'lost') {
      fields.push('lost_at = now()');
    }

    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.deals SET ${fields.join(', ')}
       WHERE id = $2 AND org_id = $3
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    await db.query(
      `INSERT INTO public.crm_activities 
       (org_id, user_id, entity_type, entity_id, activity_type, title, description)
       VALUES ($1, $2, 'deal', $3, 'status_changed', $4, $5)`,
      [req.user.orgId, req.user.id, id, 'Deal Status Changed', `Changed to ${status}`]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const addContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { contactId, role, primaryContact } = req.body;
    if (!contactId) return res.status(400).json({ error: 'contactId is required' });

    const { rows } = await db.query(
      `INSERT INTO deal_contacts (org_id, deal_id, contact_id, role, primary_contact)
       VALUES ($1, $2, $3, $4, COALESCE($5, false))
       ON CONFLICT (org_id, deal_id, contact_id) DO UPDATE SET role = EXCLUDED.role, primary_contact = EXCLUDED.primary_contact
       RETURNING *`,
      [req.user.orgId, id, contactId, role, primaryContact]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const { id, contactId } = req.params;
    const result = await db.query(
      `DELETE FROM deal_contacts WHERE deal_id = $1 AND contact_id = $2 AND org_id = $3 RETURNING id`,
      [id, contactId, req.user.orgId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contact link not found' });
    res.json({ message: 'Contact unlinked from deal' });
  } catch (err) {
    next(err);
  }
};

const addSigningParty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { contactId, role } = req.body;
    if (!contactId) return res.status(400).json({ error: 'contactId is required' });

    const { rows } = await db.query(
      `INSERT INTO deal_signing_parties (org_id, deal_id, contact_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (org_id, deal_id, contact_id) DO UPDATE SET role = EXCLUDED.role
       RETURNING *`,
      [req.user.orgId, id, contactId, role]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

const removeSigningParty = async (req, res, next) => {
  try {
    const { id, contactId } = req.params;
    const result = await db.query(
      `DELETE FROM deal_signing_parties WHERE deal_id = $1 AND contact_id = $2 AND org_id = $3 RETURNING id`,
      [id, contactId, req.user.orgId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Signing party link not found' });
    res.json({ message: 'Signing party unlinked from deal' });
  } catch (err) {
    next(err);
  }
};

const convertToCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      'SELECT * FROM public.deals WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Deal not found' });
    const deal = rows[0];

    if (deal.converted_to_customer_id) {
      return res.status(200).json({ message: 'Deal already converted', customerId: deal.converted_to_customer_id });
    }

    let contactEmail = null;
    let contactPhone = null;
    if (deal.contact_id) {
      try {
        const { rows: contactRows } = await db.query(
          'SELECT email, phone FROM public.contacts WHERE id = $1',
          [deal.contact_id]
        );
        if (contactRows[0]) {
          contactEmail = contactRows[0].email;
          contactPhone = contactRows[0].phone;
        }
      } catch (contactErr) {
        console.error('Failed to fetch contact details:', contactErr);
      }
    }

    const { rows: customerRows } = await db.query(
      `INSERT INTO public.customers 
       (org_id, user_id, name, email, phone, status, tier, total_revenue, 
        converted_from_lead_id, converted_from_deal_id, company_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        req.user.orgId,
        req.user.id,
        deal.title || 'Customer',
        contactEmail,
        contactPhone,
        'active',
        null, // tier
        deal.value || 0,
        deal.converted_from_lead_id,
        deal.id,
        deal.company_id,
      ]
    );

    const customer = customerRows[0];

    await db.query(
      `UPDATE public.deals SET converted_to_customer_id = $1, closed_at = now(), status = 'won', updated_at = now() WHERE id = $2`,
      [customer.id, id]
    );

    // Log activity
    try {
      await db.query(
        `INSERT INTO public.crm_activities 
         (org_id, user_id, entity_type, entity_id, activity_type, title, description)
         VALUES ($1, $2, 'deal', $3, 'converted', 'Deal converted to customer', $4)`,
        [req.user.orgId, req.user.id, id, `Customer ${customer.name}`]
      );
    } catch (activityErr) {
      console.error('Failed to log activity:', activityErr);
    }

    res.status(201).json({
      ...customer,
      // Ensure consistent field names for frontend
      name: customer.name,
      // Ensure value is a number
      total_revenue: customer.total_revenue ? Number(customer.total_revenue) : 0,
      // Format dates
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
    });
  } catch (err) {
    console.error('Convert to customer error:', err);
    next(err);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  updateStage,
  updateStatus,
  remove,
  getStats,
  addContact,
  removeContact,
  addSigningParty,
  removeSigningParty,
  convertToCustomer,
};
