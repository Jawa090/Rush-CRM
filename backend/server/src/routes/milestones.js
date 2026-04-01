const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../middleware/auth');
const milestonesController = require('../controllers/milestonesController');

router.use(auth, requireOrg);

router.get('/project/:projectId', milestonesController.getByProject);
router.post('/project/:projectId', milestonesController.create);
router.put('/:id', milestonesController.update);
router.delete('/:id', milestonesController.remove);

module.exports = router;