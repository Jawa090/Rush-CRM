const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const taskController = require('../../controllers/projects/taskController');

router.use(auth, requireOrg);

router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.post('/', taskController.create);
router.put('/:id', taskController.update);
router.patch('/:id/status', taskController.updateStatus);
router.delete('/:id', taskController.remove);
router.post('/reorder', taskController.reorder);

module.exports = router;
