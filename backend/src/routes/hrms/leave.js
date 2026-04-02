const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const leaveController = require('../../controllers/hrms/leaveController');

router.use(auth, requireOrg);

router.get('/', leaveController.getAll);
router.get('/balance', leaveController.getBalance);
router.get('/types', leaveController.getLeaveTypes);
router.post('/types', leaveController.createLeaveType);
router.get('/:id', leaveController.getById);
router.post('/', leaveController.create);
router.put('/:id', leaveController.update);
router.patch('/:id', leaveController.update);
router.delete('/:id', leaveController.remove);

module.exports = router;
