const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get workgroup notifications for user
const getWorkgroupNotifications = async (req, res, next) => {
  try {
    const { workgroupId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // Check if user is member
    const memberQuery = `
      SELECT id FROM workgroup_members 
      WHERE workgroup_id = $1 AND user_id = $2
    `;
    const memberResult = await db.query(memberQuery, [workgroupId, req.user.id]);
    
    if (memberResult.rows.length === 0) {
      return res.status(403).json({ error: 'You must be a member to view notifications' });
    }
    
    const query = `
      SELECT *
      FROM workgroup_notifications
      WHERE workgroup_id = $1 AND user_id = $2
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4
    `;
    
    const result = await db.query(query, [workgroupId, req.user.id, parseInt(limit), parseInt(offset)]);
    
    // Also get unread count
    const unreadQuery = `
      SELECT COUNT(*) as unread_count
      FROM workgroup_notifications
      WHERE workgroup_id = $1 AND user_id = $2 AND is_read = FALSE
    `;
    const unreadResult = await db.query(unreadQuery, [workgroupId, req.user.id]);
    
    res.json({
      notifications: result.rows,
      unread_count: parseInt(unreadResult.rows[0].unread_count),
      total: result.rows.length
    });
  } catch (err) {
    next(err);
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res, next) => {
  try {
    const { workgroupId, notificationId } = req.params;
    
    const query = `
      UPDATE workgroup_notifications 
      SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND workgroup_id = $2 AND user_id = $3
      RETURNING *
    `;
    
    const result = await db.query(query, [notificationId, workgroupId, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const { workgroupId } = req.params;
    
    const query = `
      UPDATE workgroup_notifications 
      SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE workgroup_id = $1 AND user_id = $2 AND is_read = FALSE
      RETURNING COUNT(*) as updated_count
    `;
    
    const result = await db.query(query, [workgroupId, req.user.id]);
    
    res.json({ 
      message: 'All notifications marked as read',
      updated_count: result.rowCount
    });
  } catch (err) {
    next(err);
  }
};

// Create notification (internal function)
const createNotification = async (workgroupId, excludeUserId, type, title, message, data = {}) => {
  try {
    // Get all workgroup members except the user who performed the action
    const membersQuery = `
      SELECT wm.user_id, u.org_id
      FROM workgroup_members wm
      JOIN users u ON wm.user_id = u.id
      WHERE wm.workgroup_id = $1 AND wm.user_id != $2
    `;
    const membersResult = await db.query(membersQuery, [workgroupId, excludeUserId]);
    
    // Create notification for each member
    const notifications = [];
    for (const member of membersResult.rows) {
      const notificationId = uuidv4();
      const insertQuery = `
        INSERT INTO workgroup_notifications (
          id, workgroup_id, user_id, org_id, notification_type, title, message, data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const result = await db.query(insertQuery, [
        notificationId,
        workgroupId,
        member.user_id,
        member.org_id,
        type,
        title,
        message,
        JSON.stringify(data)
      ]);
      
      notifications.push(result.rows[0]);
    }
    
    return notifications;
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
};

// Delete notification
const deleteNotification = async (req, res, next) => {
  try {
    const { workgroupId, notificationId } = req.params;
    
    const query = `
      DELETE FROM workgroup_notifications 
      WHERE id = $1 AND workgroup_id = $2 AND user_id = $3
      RETURNING *
    `;
    
    const result = await db.query(query, [notificationId, workgroupId, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWorkgroupNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification
};