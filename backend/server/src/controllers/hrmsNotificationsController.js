const db = require('../config/database');
const Joi = require('joi');

// Get all HRMS notifications for the current user
const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, filter = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        n.*,
        COALESCE(e.name, e.first_name || ' ' || e.last_name, u.full_name) as employee_name
      FROM hrms_notifications n
      LEFT JOIN employees e ON n.employee_id = e.id
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.org_id = $1 AND n.user_id = $2
    `;
    const params = [req.user.orgId, req.user.id];
    let paramIndex = 3;

    if (filter === 'unread') {
      query += ` AND n.is_read = false`;
    } else if (filter === 'read') {
      query += ` AND n.is_read = true`;
    }

    query += ` ORDER BY n.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM hrms_notifications WHERE org_id = $1 AND user_id = $2`;
    const countParams = [req.user.orgId, req.user.id];
    
    if (filter === 'unread') {
      countQuery += ` AND is_read = false`;
    } else if (filter === 'read') {
      countQuery += ` AND is_read = true`;
    }

    const countResult = await db.query(countQuery, countParams);

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

// Get notification statistics
const getStats = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_read = false) as unread,
        COUNT(*) FILTER (WHERE is_read = true) as read,
        COUNT(*) FILTER (WHERE notification_type = 'attendance') as attendance,
        COUNT(*) FILTER (WHERE notification_type = 'leave') as leave,
        COUNT(*) FILTER (WHERE notification_type = 'system') as system
      FROM hrms_notifications 
      WHERE org_id = $1 AND user_id = $2
    `, [req.user.orgId, req.user.id]);

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Mark notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE hrms_notifications 
       SET is_read = true, read_at = NOW() 
       WHERE id = $1 AND org_id = $2 AND user_id = $3
       RETURNING *`,
      [id, req.user.orgId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE hrms_notifications 
       SET is_read = true, read_at = NOW() 
       WHERE org_id = $1 AND user_id = $2 AND is_read = false
       RETURNING COUNT(*)`,
      [req.user.orgId, req.user.id]
    );

    res.json({ 
      message: 'All notifications marked as read',
      updated: result.rowCount 
    });
  } catch (err) {
    next(err);
  }
};

// Delete notification
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM hrms_notifications WHERE id = $1 AND org_id = $2 AND user_id = $3 RETURNING id',
      [id, req.user.orgId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Create notification (for system use)
const create = async (req, res, next) => {
  try {
    const { 
      user_id, 
      employee_id, 
      notification_type, 
      title, 
      message, 
      data = {}, 
      priority = 'normal' 
    } = req.body;

    const result = await db.query(
      `INSERT INTO hrms_notifications (
        org_id, user_id, employee_id, notification_type, title, message, data, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        req.user.orgId,
        user_id,
        employee_id,
        notification_type,
        title,
        message,
        JSON.stringify(data),
        priority
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getStats,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  create,
};