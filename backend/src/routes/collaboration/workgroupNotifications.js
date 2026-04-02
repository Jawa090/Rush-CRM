const express = require('express');
const router = express.Router();
const {
  getWorkgroupNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} = require('../../controllers/collaboration/workgroupNotificationsController');
const { auth } = require('../../middleware/auth');

// Apply authentication to all routes
router.use(auth);

// Notification routes
router.get('/:workgroupId/notifications', getWorkgroupNotifications);
router.put('/:workgroupId/notifications/:notificationId/read', markNotificationAsRead);
router.put('/:workgroupId/notifications/read-all', markAllNotificationsAsRead);
router.delete('/:workgroupId/notifications/:notificationId', deleteNotification);

module.exports = router;
