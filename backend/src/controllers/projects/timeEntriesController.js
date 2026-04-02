const db = require('../../config/database');

const getByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const result = await db.query(
      `SELECT te.*, u.full_name as user_name, t.title as task_title
       FROM time_entries te
       LEFT JOIN users u ON te.user_id = u.id
       LEFT JOIN tasks t ON te.task_id = t.id
       WHERE te.project_id = $1 AND te.org_id = $2 
       ORDER BY te.date DESC, te.created_at DESC`,
      [projectId, req.user.orgId]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { task_id, description, hours, date, billable, hourly_rate } = req.body;

    if (!hours || hours <= 0) {
      return res.status(400).json({ error: 'Valid hours amount is required' });
    }

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const result = await db.query(
      `INSERT INTO time_entries (org_id, project_id, task_id, user_id, description, hours, date, billable, hourly_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.user.orgId, projectId, task_id || null, req.user.id, description || null, hours, date, billable !== false, hourly_rate || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { task_id, description, hours, date, billable, hourly_rate } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (task_id !== undefined) { fields.push(`task_id = $${paramIndex++}`); values.push(task_id); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
    if (hours !== undefined) { fields.push(`hours = $${paramIndex++}`); values.push(hours); }
    if (date !== undefined) { fields.push(`date = $${paramIndex++}`); values.push(date); }
    if (billable !== undefined) { fields.push(`billable = $${paramIndex++}`); values.push(billable); }
    if (hourly_rate !== undefined) { fields.push(`hourly_rate = $${paramIndex++}`); values.push(hourly_rate); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = now()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE time_entries SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' });
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
      'DELETE FROM time_entries WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Time entry not found' });
    }

    res.json({ message: 'Time entry deleted' });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const result = await db.query(
      `SELECT 
        SUM(hours) as total_hours,
        SUM(CASE WHEN billable THEN hours ELSE 0 END) as billable_hours,
        SUM(CASE WHEN billable AND hourly_rate IS NOT NULL THEN hours * hourly_rate ELSE 0 END) as total_revenue,
        COUNT(DISTINCT user_id) as team_members
       FROM time_entries 
       WHERE project_id = $1 AND org_id = $2`,
      [projectId, req.user.orgId]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getByProject,
  create,
  update,
  remove,
  getStats,
};
