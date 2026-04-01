const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../middleware/auth');
const workflowController = require('../controllers/workflowController');

router.use(auth, requireOrg);

router.get('/', workflowController.getAll);
router.get('/:id', workflowController.getById);
router.get('/:id/executions', workflowController.getWorkflowExecutions);
router.post('/', workflowController.create);
router.put('/:id', workflowController.update);
router.post('/:id/trigger', workflowController.trigger);
router.delete('/:id', workflowController.remove);

// Workflow Actions
router.post('/actions', workflowController.createAction);
router.put('/actions/:id', workflowController.updateAction);
router.delete('/actions/:id', workflowController.deleteAction);

module.exports = router;
