const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const activityController = require('../../controllers/crm/activityController');

router.use(auth, requireOrg);

router.get('/', activityController.getRecent);
router.get('/email/:emailId', activityController.getByEmailId);
router.get('/:entityType/:entityId', activityController.getByEntity);
router.post('/', activityController.post || activityController.create);

module.exports = router;
