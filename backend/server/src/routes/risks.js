const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../middleware/auth');
const risksController = require('../controllers/risksController');

router.use(auth, requireOrg);

router.get('/project/:projectId', risksController.getByProject);
router.post('/project/:projectId', risksController.create);
router.put('/:id', risksController.update);
router.delete('/:id', risksController.remove);

module.exports = router;