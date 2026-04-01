const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../middleware/auth');
const notificationsController = require('../controllers/notificationsController');

router.use(auth, requireOrg);

router.get('/', notificationsController.getAll);
router.get('/project/:projectId', notificationsController.getByProject);
router.post('/project/:projectId', notificationsController.create);
router.put('/:id/read', notificationsController.markAsRead);
router.put('/project/:projectId/read-all', notificationsController.markAllAsRead);
router.delete('/:id', notificationsController.remove);

module.exports = router;