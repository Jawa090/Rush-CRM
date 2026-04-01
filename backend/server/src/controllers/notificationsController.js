const db = require('../config/database');

const getByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const result = await db.query(
      `SELECT * FROM project_notifications 
       WHERE project_id = $1 AND user_id = $2 AND org_id = $3 
       ORDER BY created_at DESC`,
      [projectId, req.user.id, req.user.orgId]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT pn.*, p.name as project_name
       FROM project_notifications pn
       LEFT JOIN projects p ON pn.project_id = p.id
       WHERE pn.user_id = $1 AND pn.org_id = $2 
       ORDER BY pn.created_at DESC
       LIMIT 50`,
      [req.user.id, req.user.orgId]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { user_id, title, message, type } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Notification title is required' });
    }

    const result = await db.query(
      `INSERT INTO project_notifications (org_id, project_id, user_id, title, message, type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.orgId, projectId, user_id || req.user.id, title.trim(), message || null, type || 'info']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE project_notifications SET is_read = true 
       WHERE id = $1 AND user_id = $2 AND org_id = $3 RETURNING *`,
      [id, req.user.id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    await db.query(
      `UPDATE project_notifications SET is_read = true 
       WHERE project_id = $1 AND user_id = $2 AND org_id = $3`,
      [projectId, req.user.id, req.user.orgId]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM project_notifications WHERE id = $1 AND user_id = $2 AND org_id = $3 RETURNING id',
      [id, req.user.id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getByProject,
  getAll,
  create,
  markAsRead,
  markAllAsRead,
  remove,
};