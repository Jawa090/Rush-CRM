const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const {
  getAll,
  getStats,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  create,
} = require('../../controllers/hrms/hrmsNotificationsController');

// Apply auth middleware to all routes
router.use(auth);
router.use(requireOrg);

// Get all notifications
router.get('/', getAll);

// Get notification statistics
router.get('/stats', getStats);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Create notification (for system use)
router.post('/', create);

module.exports = router;
