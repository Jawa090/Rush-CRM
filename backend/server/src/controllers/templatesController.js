const db = require('../config/database');

const getAll = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT pt.*, u.full_name as created_by_name
       FROM project_templates pt
       LEFT JOIN users u ON pt.created_by = u.id
       WHERE pt.org_id = $1 
       ORDER BY pt.created_at DESC`,
      [req.user.orgId]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT pt.*, u.full_name as created_by_name
       FROM project_templates pt
       LEFT JOIN users u ON pt.created_by = u.id
       WHERE pt.id = $1 AND pt.org_id = $2`,
      [id, req.user.orgId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, default_milestones, default_tasks, settings } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Template name is required' });
    }

    const result = await db.query(
      `INSERT INTO project_templates (org_id, name, description, default_milestones, default_tasks, settings, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        req.user.orgId, 
        name.trim(), 
        description || null, 
        JSON.stringify(default_milestones || []), 
        JSON.stringify(default_tasks || []), 
        JSON.stringify(settings || {}), 
        req.user.id
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
    const { name, description, default_milestones, default_tasks, settings } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
    if (default_milestones !== undefined) { fields.push(`default_milestones = $${paramIndex++}`); values.push(JSON.stringify(default_milestones)); }
    if (default_tasks !== undefined) { fields.push(`default_tasks = $${paramIndex++}`); values.push(JSON.stringify(default_tasks)); }
    if (settings !== undefined) { fields.push(`settings = $${paramIndex++}`); values.push(JSON.stringify(settings)); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = now()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE project_templates SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
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
      'DELETE FROM project_templates WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ message: 'Template deleted' });
  } catch (err) {
    next(err);
  }
};

const applyTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Get the template
    const templateResult = await db.query(
      'SELECT * FROM project_templates WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = templateResult.rows[0];
    const milestones = template.default_milestones || [];
    const tasks = template.default_tasks || [];

    // Create milestones
    const createdMilestones = [];
    for (const milestone of milestones) {
      const milestoneResult = await db.query(
        `INSERT INTO project_milestones (org_id, project_id, name, description, created_by)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.user.orgId, project_id, milestone.name, milestone.description || null, req.user.id]
      );
      createdMilestones.push(milestoneResult.rows[0]);
    }

    // Create tasks
    const createdTasks = [];
    for (const task of tasks) {
      const taskResult = await db.query(
        `INSERT INTO tasks (org_id, project_id, title, description, status, priority, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [req.user.orgId, project_id, task.title, task.description || null, task.status || 'todo', task.priority || 'medium', req.user.id]
      );
      createdTasks.push(taskResult.rows[0]);
    }

    res.json({
      message: 'Template applied successfully',
      milestones: createdMilestones,
      tasks: createdTasks
    });
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
  applyTemplate,
};