const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const employeeController = require('../../controllers/hrms/employeeController');

router.use(auth, requireOrg);

router.get('/', employeeController.getAll);
router.get('/stats', employeeController.getStats);
router.get('/:id', employeeController.getById);
router.post('/', employeeController.create);
router.put('/:id', employeeController.update);
router.delete('/:id', employeeController.remove);

module.exports = router;
