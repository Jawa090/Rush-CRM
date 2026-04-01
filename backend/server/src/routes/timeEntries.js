const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../middleware/auth');
const timeEntriesController = require('../controllers/timeEntriesController');

router.use(auth, requireOrg);

router.get('/project/:projectId', timeEntriesController.getByProject);
router.get('/project/:projectId/stats', timeEntriesController.getStats);
router.post('/project/:projectId', timeEntriesController.create);
router.put('/:id', timeEntriesController.update);
router.delete('/:id', timeEntriesController.remove);

module.exports = router;