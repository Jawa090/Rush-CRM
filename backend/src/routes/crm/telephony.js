const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const telephonyController = require('../../controllers/crm/telephonyController');

router.use(auth, requireOrg);

router.get('/providers', telephonyController.getProviders);
router.patch('/providers/:id', telephonyController.updateProvider);

module.exports = router;
