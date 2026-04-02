const db = require('../../config/database');

// ==================== DASHBOARD ====================
const getDashboardStats = async (req, res, next) => {
  try {
    const orgId = req.user.orgId;

    // Total campaigns
    const campaignsResult = await db.query(
      `SELECT 
        COUNT(*) as total_campaigns,
        COUNT(*) FILTER (WHERE status = 'sent') as sent_campaigns,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_campaigns,
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_campaigns
      FROM marketing_campaigns WHERE org_id = $1`,
      [orgId]
    );

    // Total lists and contacts
    const listsResult = await db.query(
      'SELECT COUNT(*) as total_lists FROM marketing_lists WHERE org_id = $1',
      [orgId]
    );

    const contactsResult = await db.query(
      'SELECT COUNT(DISTINCT contact_id) as total_contacts FROM marketing_list_members WHERE org_id = $1',
      [orgId]
    );

    // Email metrics
    const metricsResult = await db.query(
      `SELECT 
        COUNT(*) as total_sent,
        COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as total_opened,
        COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as total_clicked
      FROM marketing_campaign_events 
      WHERE campaign_id IN (SELECT id FROM marketing_campaigns WHERE org_id = $1)`,
      [orgId]
    );

    const totalSent = parseInt(metricsResult.rows[0].total_sent) || 1;
    const totalOpened = parseInt(metricsResult.rows[0].total_opened) || 0;
    const totalClicked = parseInt(metricsResult.rows[0].total_clicked) || 0;

    // Forms and sequences
    const formsResult = await db.query(
      'SELECT COUNT(*) as total_forms FROM marketing_forms WHERE org_id = $1',
      [orgId]
    );

    const sequencesResult = await db.query(
      `SELECT 
        COUNT(*) as total_sequences,
        COUNT(*) FILTER (WHERE is_active = true) as active_sequences
      FROM marketing_sequences WHERE org_id = $1`,
      [orgId]
    );

    // Recent campaigns
    const recentCampaigns = await db.query(
      `SELECT id, name, status, sent_count, opened_count, clicked_count, created_at
       FROM marketing_campaigns 
       WHERE org_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [orgId]
    );

    res.json({
      data: {
        campaigns: {
          total: parseInt(campaignsResult.rows[0].total_campaigns),
          sent: parseInt(campaignsResult.rows[0].sent_campaigns),
          draft: parseInt(campaignsResult.rows[0].draft_campaigns),
          scheduled: parseInt(campaignsResult.rows[0].scheduled_campaigns),
        },
        lists: {
          total: parseInt(listsResult.rows[0].total_lists),
        },
        contacts: {
          total: parseInt(contactsResult.rows[0].total_contacts),
        },
        metrics: {
          openRate: ((totalOpened / totalSent) * 100).toFixed(1),
          clickRate: ((totalClicked / totalSent) * 100).toFixed(1),
          totalSent,
          totalOpened,
          totalClicked,
        },
        forms: {
          total: parseInt(formsResult.rows[0].total_forms),
        },
        sequences: {
          total: parseInt(sequencesResult.rows[0].total_sequences),
          active: parseInt(sequencesResult.rows[0].active_sequences),
        },
        recentCampaigns: recentCampaigns.rows,
      }
    });
  } catch (err) {
    next(err);
  }
};


// ==================== CAMPAIGNS ====================
const getCampaigns = async (req, res, next) => {
  try {
    const { status, type } = req.query;

    let query = 'SELECT * FROM marketing_campaigns WHERE org_id = $1';
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
};

const createCampaign = async (req, res, next) => {
  try {
    const { name, description, type, subject, content, list_id, segment_id, scheduled_at } = req.body;

    const result = await db.query(
      `INSERT INTO marketing_campaigns (
        org_id, name, description, type, subject, content, 
        list_id, segment_id, scheduled_at, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft', $10)
      RETURNING *`,
      [req.user.orgId, name, description, type || 'email', subject, content, list_id, segment_id, scheduled_at, req.user.id]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, subject, content, list_id, segment_id, scheduled_at, status } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
    if (subject !== undefined) { fields.push(`subject = $${paramIndex++}`); values.push(subject); }
    if (content !== undefined) { fields.push(`content = $${paramIndex++}`); values.push(content); }
    if (list_id !== undefined) { fields.push(`list_id = $${paramIndex++}`); values.push(list_id); }
    if (segment_id !== undefined) { fields.push(`segment_id = $${paramIndex++}`); values.push(segment_id); }
    if (scheduled_at !== undefined) { fields.push(`scheduled_at = $${paramIndex++}`); values.push(scheduled_at); }
    if (status !== undefined) { fields.push(`status = $${paramIndex++}`); values.push(status); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE marketing_campaigns SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM marketing_campaigns WHERE id = $1 AND org_id = $2', [id, req.user.orgId]);
    res.json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    next(err);
  }
};


// ==================== LISTS ====================
const getLists = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT l.*, 
        (SELECT COUNT(*) FROM marketing_list_members WHERE list_id = l.id) as member_count
       FROM marketing_lists l
       WHERE l.org_id = $1
       ORDER BY l.created_at DESC`,
      [req.user.orgId]
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
};

const createList = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const result = await db.query(
      `INSERT INTO marketing_lists (org_id, name, description, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.orgId, name, description, req.user.id]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteList = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM marketing_list_members WHERE list_id = $1', [id]);
    await db.query('DELETE FROM marketing_lists WHERE id = $1 AND org_id = $2', [id, req.user.orgId]);

    res.json({ message: 'List deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ==================== FORMS ====================
const getForms = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM marketing_forms WHERE org_id = $1 ORDER BY created_at DESC',
      [req.user.orgId]
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
};

const createForm = async (req, res, next) => {
  try {
    const { name, description, fields, success_message, redirect_url, auto_add_to_list } = req.body;

    const result = await db.query(
      `INSERT INTO marketing_forms (
        org_id, name, description, fields, success_message, 
        redirect_url, auto_add_to_list, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [req.user.orgId, name, description, JSON.stringify(fields), success_message, redirect_url, auto_add_to_list, req.user.id]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteForm = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM marketing_forms WHERE id = $1 AND org_id = $2', [id, req.user.orgId]);
    res.json({ message: 'Form deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ==================== SEQUENCES ====================
const getSequences = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT s.*, 
        (SELECT COUNT(*) FROM marketing_sequence_enrollments WHERE sequence_id = s.id) as enrollment_count
       FROM marketing_sequences s
       WHERE s.org_id = $1
       ORDER BY s.created_at DESC`,
      [req.user.orgId]
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
};

const createSequence = async (req, res, next) => {
  try {
    const { name, description, trigger_type, trigger_conditions, steps, is_active } = req.body;

    const result = await db.query(
      `INSERT INTO marketing_sequences (
        org_id, name, description, trigger_type, trigger_conditions, 
        steps, is_active, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [req.user.orgId, name, description, trigger_type || 'manual', JSON.stringify(trigger_conditions), JSON.stringify(steps), is_active || false, req.user.id]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateSequence = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, trigger_type, trigger_conditions, steps, is_active } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
    if (trigger_type !== undefined) { fields.push(`trigger_type = $${paramIndex++}`); values.push(trigger_type); }
    if (trigger_conditions !== undefined) { fields.push(`trigger_conditions = $${paramIndex++}`); values.push(JSON.stringify(trigger_conditions)); }
    if (steps !== undefined) { fields.push(`steps = $${paramIndex++}`); values.push(JSON.stringify(steps)); }
    if (is_active !== undefined) { fields.push(`is_active = $${paramIndex++}`); values.push(is_active); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE marketing_sequences SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sequence not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteSequence = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM marketing_sequence_enrollments WHERE sequence_id = $1', [id]);
    await db.query('DELETE FROM marketing_sequences WHERE id = $1 AND org_id = $2', [id, req.user.orgId]);

    res.json({ message: 'Sequence deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ==================== ANALYTICS ====================
const getAnalytics = async (req, res, next) => {
  try {
    const orgId = req.user.orgId;
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [orgId];
    let paramIndex = 2;

    if (startDate && endDate) {
      dateFilter = ` AND created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    // Campaign performance
    const campaignStats = await db.query(
      `SELECT 
        COUNT(*) as total_campaigns,
        SUM(sent_count) as total_sent,
        SUM(opened_count) as total_opened,
        SUM(clicked_count) as total_clicked,
        AVG(CASE WHEN sent_count > 0 THEN (opened_count::float / sent_count) * 100 ELSE 0 END) as avg_open_rate,
        AVG(CASE WHEN sent_count > 0 THEN (clicked_count::float / sent_count) * 100 ELSE 0 END) as avg_click_rate
      FROM marketing_campaigns 
      WHERE org_id = $1 AND status = 'sent'${dateFilter}`,
      params
    );

    // Top performing campaigns
    const topCampaigns = await db.query(
      `SELECT id, name, sent_count, opened_count, clicked_count,
        CASE WHEN sent_count > 0 THEN (opened_count::float / sent_count) * 100 ELSE 0 END as open_rate,
        CASE WHEN sent_count > 0 THEN (clicked_count::float / sent_count) * 100 ELSE 0 END as click_rate
      FROM marketing_campaigns 
      WHERE org_id = $1 AND status = 'sent'${dateFilter}
      ORDER BY opened_count DESC
      LIMIT 10`,
      params
    );

    // List growth
    const listGrowth = await db.query(
      `SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as new_contacts
      FROM marketing_list_members
      WHERE org_id = $1${dateFilter.replace('created_at', 'marketing_list_members.created_at')}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date DESC
      LIMIT 30`,
      params
    );

    // Sequence performance
    const sequenceStats = await db.query(
      `SELECT 
        s.id, s.name, s.enrollment_count,
        COUNT(se.id) as active_enrollments,
        COUNT(se.id) FILTER (WHERE se.status = 'completed') as completed_enrollments
      FROM marketing_sequences s
      LEFT JOIN marketing_sequence_enrollments se ON s.id = se.sequence_id
      WHERE s.org_id = $1
      GROUP BY s.id, s.name, s.enrollment_count
      ORDER BY s.enrollment_count DESC
      LIMIT 10`,
      [orgId]
    );

    res.json({
      data: {
        campaignStats: campaignStats.rows[0],
        topCampaigns: topCampaigns.rows,
        listGrowth: listGrowth.rows,
        sequenceStats: sequenceStats.rows,
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getLists,
  createList,
  deleteList,
  getForms,
  createForm,
  deleteForm,
  getSequences,
  createSequence,
  updateSequence,
  deleteSequence,
  getAnalytics,
};
