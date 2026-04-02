const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const attendanceController = require('../../controllers/hrms/attendanceController');

router.use(auth, requireOrg);

router.get('/', attendanceController.getAll);
router.get('/stats', attendanceController.getStats);
router.post('/clock-in', attendanceController.clockIn);
router.post('/clock-out', attendanceController.clockOut);
router.get('/:id', attendanceController.getById);
router.post('/', attendanceController.create);
router.put('/:id', attendanceController.update);
router.delete('/:id', attendanceController.remove);

module.exports = router;
