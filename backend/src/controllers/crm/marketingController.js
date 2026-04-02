const db = require('../../config/database');

// Campaigns
const getCampaigns = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT c.*, l.name as list_name,
             c.email_subject as subject_line,
             COUNT(CASE WHEN ce.status = 'sent' THEN 1 END) as sent_count,
             COUNT(CASE WHEN ce.opened_at IS NOT NULL THEN 1 END) as opened_count,
             COUNT(CASE WHEN ce.clicked_at IS NOT NULL THEN 1 END) as clicked_count,
             0 as total_conversions
      FROM public.marketing_campaigns c
      LEFT JOIN public.marketing_lists l ON l.id = c.list_id
      LEFT JOIN public.marketing_campaign_events ce ON ce.campaign_id = c.id
      WHERE c.org_id = $1
    `;
    const params = [req.user.orgId];

    if (status) {
      query += ' AND c.status = $2';
      params.push(status);
    }

    query += ' GROUP BY c.id, l.name ORDER BY c.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const createCampaign = async (req, res, next) => {
  try {
    const { name, description, status, list_id, startDate, endDate, budget,
            subject_line, from_name, from_email, campaign_type, channel } = req.body;

    const result = await db.query(
      `INSERT INTO public.marketing_campaigns
         (org_id, user_id, name, description, status, list_id, start_date, end_date, budget, email_subject)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [req.user.orgId, req.user.id, name, description, status || 'draft',
       list_id || null, startDate || null, endDate || null, budget || null,
       subject_line || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const updateCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, startDate, endDate, budget, list_id, subject_line } = req.body;

    const fields = [];
    const values = [];
    let i = 1;

    if (name !== undefined)         { fields.push(`name = $${i++}`);          values.push(name); }
    if (description !== undefined)  { fields.push(`description = $${i++}`);   values.push(description); }
    if (status !== undefined)       { fields.push(`status = $${i++}`);        values.push(status); }
    if (startDate !== undefined)    { fields.push(`start_date = $${i++}`);    values.push(startDate); }
    if (endDate !== undefined)      { fields.push(`end_date = $${i++}`);      values.push(endDate); }
    if (budget !== undefined)       { fields.push(`budget = $${i++}`);        values.push(budget); }
    if (list_id !== undefined)      { fields.push(`list_id = $${i++}`);       values.push(list_id); }
    if (subject_line !== undefined) { fields.push(`email_subject = $${i++}`); values.push(subject_line); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = now()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.marketing_campaigns SET ${fields.join(', ')}
       WHERE id = $${i} AND org_id = $${i + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const deleteCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM public.marketing_campaign_events WHERE campaign_id = $1', [id]);

    const result = await db.query(
      'DELETE FROM public.marketing_campaigns WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    next(err);
  }
};

// Lists
const getLists = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT ml.*, COALESCE(COUNT(mlm.id), 0)::int as member_count
       FROM public.marketing_lists ml
       LEFT JOIN public.marketing_list_members mlm ON mlm.list_id = ml.id
       WHERE ml.org_id = $1
       GROUP BY ml.id
       ORDER BY ml.created_at DESC`,
      [req.user.orgId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const createList = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const result = await db.query(
      `INSERT INTO public.marketing_lists (org_id, user_id, name, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.orgId, req.user.id, name, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const deleteList = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM public.marketing_list_members WHERE list_id = $1', [id]);

    const result = await db.query(
      'DELETE FROM public.marketing_lists WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }

    res.json({ message: 'List deleted' });
  } catch (err) {
    next(err);
  }
};

// Forms
const getForms = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT mf.*, COALESCE(COUNT(mfs.id), 0)::int as submission_count
       FROM public.marketing_forms mf
       LEFT JOIN public.marketing_form_submissions mfs ON mfs.form_id = mf.id
       WHERE mf.org_id = $1
       GROUP BY mf.id
       ORDER BY mf.created_at DESC`,
      [req.user.orgId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const createForm = async (req, res, next) => {
  try {
    const { name, description, fields, successMessage, redirectUrl } = req.body;

    const result = await db.query(
      `INSERT INTO public.marketing_forms (org_id, user_id, name, description, fields, success_message, redirect_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.orgId, req.user.id, name, description,
       JSON.stringify(fields || []), successMessage || null, redirectUrl || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const deleteForm = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM public.marketing_form_submissions WHERE form_id = $1', [id]);

    const result = await db.query(
      'DELETE FROM public.marketing_forms WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json({ message: 'Form deleted' });
  } catch (err) {
    next(err);
  }
};

// Sequences
const getSequences = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT *, 0 as enrollment_count FROM public.marketing_sequences WHERE org_id = $1 ORDER BY created_at DESC`,
      [req.user.orgId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const createSequence = async (req, res, next) => {
  try {
    const { name, description, trigger_type, steps } = req.body;

    const result = await db.query(
      `INSERT INTO public.marketing_sequences (org_id, created_by, name, description, status, trigger_type, steps)
       VALUES ($1, $2, $3, $4, 'draft', $5, $6)
       RETURNING *`,
      [req.user.orgId, req.user.id, name, description, trigger_type || 'manual', JSON.stringify(steps || [])]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const updateSequence = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active, status } = req.body;

    const fields = [];
    const values = [];
    let i = 1;

    if (is_active !== undefined) { fields.push(`is_active = $${i++}`); values.push(is_active); }
    if (status !== undefined)    { fields.push(`status = $${i++}`);    values.push(status); }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    fields.push(`updated_at = now()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.marketing_sequences SET ${fields.join(', ')}
       WHERE id = $${i} AND org_id = $${i + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Sequence not found' });

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const deleteSequence = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM public.marketing_sequences WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sequence not found' });
    }

    res.json({ message: 'Sequence deleted' });
  } catch (err) {
    next(err);
  }
};

// Analytics
const getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, entityType } = req.query;

    let query = `
      SELECT entity_type, entity_id, metric_name,
             SUM(metric_value) as total_value, date_recorded
      FROM public.marketing_analytics
      WHERE org_id = $1
    `;
    const params = [req.user.orgId];
    let i = 2;

    if (startDate)   { query += ` AND date_recorded >= $${i++}`; params.push(startDate); }
    if (endDate)     { query += ` AND date_recorded <= $${i++}`; params.push(endDate); }
    if (entityType)  { query += ` AND entity_type = $${i++}`;    params.push(entityType); }

    query += ` GROUP BY entity_type, entity_id, metric_name, date_recorded ORDER BY date_recorded DESC`;

    const result = await db.query(query, params);

    const summaryResult = await db.query(`
      SELECT
        SUM(CASE WHEN metric_name = 'opens' THEN metric_value ELSE 0 END) as total_opens,
        SUM(CASE WHEN metric_name = 'clicks' THEN metric_value ELSE 0 END) as total_clicks,
        SUM(CASE WHEN metric_name = 'conversions' THEN metric_value ELSE 0 END) as total_conversions
      FROM public.marketing_analytics
      WHERE org_id = $1
    `, [req.user.orgId]);

    res.json({ analytics: result.rows, summary: summaryResult.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCampaigns, createCampaign, updateCampaign, deleteCampaign,
  getLists, createList, deleteList,
  getForms, createForm, deleteForm,
  getSequences, createSequence, updateSequence, deleteSequence,
  getAnalytics,
};
