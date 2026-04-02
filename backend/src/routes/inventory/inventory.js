const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const inventoryController = require('../../controllers/inventory/inventoryController');

router.use(auth, requireOrg);

// Dashboard stats
router.get('/dashboard', inventoryController.getDashboardStats);

// Employee assignments
router.get('/assignments', inventoryController.getEmployeeAssignments);
router.post('/assignments', inventoryController.assignProductToEmployee);
router.delete('/assignments/:id', inventoryController.removeAssignment);

module.exports = router;
