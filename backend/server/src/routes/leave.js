const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../middleware/auth');
const leaveController = require('../controllers/leaveController');

router.use(auth, requireOrg);

// Leave Types
router.get('/types', leaveController.getLeaveTypes);
router.post('/types', leaveController.createLeaveType);
router.put('/types/:id', leaveController.updateLeaveType);

// Leave Balances
router.get('/balance/my', leaveController.getMyBalance);
router.get('/balance/:employeeId', leaveController.getEmployeeBalance);
router.post('/balance/:employeeId/initialize', leaveController.initializeEmployeeBalance);

// Leave Requests
router.get('/', leaveController.getLeaveRequests);
router.post('/', leaveController.createLeaveRequest);
router.patch('/:id', leaveController.updateLeaveRequest);

// Analytics
router.get('/analytics/stats', leaveController.getLeaveAnalytics);

// Calendar
router.get('/calendar/view', leaveController.getLeaveCalendar);

// Public Holidays
router.get('/holidays/list', leaveController.getPublicHolidays);
router.post('/holidays', leaveController.createPublicHoliday);

module.exports = router;