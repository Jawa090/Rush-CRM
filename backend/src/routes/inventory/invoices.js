const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const invoicesController = require('../../controllers/inventory/invoicesController');

router.use(auth, requireOrg);

router.get('/project/:projectId', invoicesController.getByProject);
router.get('/project/:projectId/stats', invoicesController.getStats);
router.post('/project/:projectId', invoicesController.create);
router.put('/:id', invoicesController.update);
router.delete('/:id', invoicesController.remove);

module.exports = router;
