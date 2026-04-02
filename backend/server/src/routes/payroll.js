const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/slips', payrollController.getSalarySlips);
router.get('/slips/:id', payrollController.getSalarySlipById);
router.post('/slips', payrollController.generateSalarySlip);
router.delete('/slips/:id', payrollController.deleteSalarySlip);

module.exports = router;
