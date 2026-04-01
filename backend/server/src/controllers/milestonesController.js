const db = require('../config/database');

const getByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const result = await db.query(
      `SELECT * FROM project_milestones 
       WHERE project_id = $1 AND org_id = $2 
       ORDER BY due_date ASC, created_at ASC`,
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
    const { name, description, due_date, status } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Milestone name is required' });
    }

    const result = await db.query(
      `INSERT INTO project_milestones (org_id, project_id, name, description, due_date, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.orgId, projectId, name.trim(), description || null, due_date || null, status || 'pending', req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, due_date, status, progress } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
    if (due_date !== undefined) { fields.push(`due_date = $${paramIndex++}`); values.push(due_date); }
    if (status !== undefined) { fields.push(`status = $${paramIndex++}`); values.push(status); }
    if (progress !== undefined) { fields.push(`progress = $${paramIndex++}`); values.push(progress); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = now()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE project_milestones SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' });
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
      'DELETE FROM project_milestones WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.json({ message: 'Milestone deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getByProject,
  create,
  update,
  remove,
};