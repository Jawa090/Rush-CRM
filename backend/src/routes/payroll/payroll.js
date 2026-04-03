const express = require('express');
const router = express.Router();
const payrollController = require('../../controllers/payroll/payrollController');
const { auth, requireOrg } = require('../../middleware/auth');

router.use(auth, requireOrg);

// Get all salary slips
router.get('/slips', payrollController.getSalarySlips);

// Get single salary slip
router.get('/slips/:id', payrollController.getSalarySlipById);

// Generate salary slip
router.post('/slips', payrollController.generateSalarySlip);

// Delete salary slip
router.delete('/slips/:id', payrollController.deleteSalarySlip);

module.exports = router;
