const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../middleware/auth');
const inventoryController = require('../controllers/inventoryController');

router.use(auth, requireOrg);

// Dashboard
router.get('/stats', inventoryController.getDashboardStats);

// Employee Assignments
router.get('/assignments', inventoryController.getEmployeeAssignments);
router.post('/assignments', inventoryController.createEmployeeAssignment);
router.patch('/assignments/:id/return', inventoryController.returnEmployeeAssignment);

// Stock Adjustments
router.get('/adjustments', inventoryController.getStockAdjustments);
router.post('/adjustments', inventoryController.createStockAdjustment);

module.exports = router;
