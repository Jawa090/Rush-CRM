const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const marketingController = require('../../controllers/crm/marketingController');

router.use(auth, requireOrg);

// Campaigns
router.get('/campaigns', marketingController.getCampaigns);
router.post('/campaigns', marketingController.createCampaign);
router.put('/campaigns/:id', marketingController.updateCampaign);
router.delete('/campaigns/:id', marketingController.deleteCampaign);

// Lists
router.get('/lists', marketingController.getLists);
router.post('/lists', marketingController.createList);
router.delete('/lists/:id', marketingController.deleteList);

// Forms
router.get('/forms', marketingController.getForms);
router.post('/forms', marketingController.createForm);
router.delete('/forms/:id', marketingController.deleteForm);

// Sequences
router.get('/sequences', marketingController.getSequences);
router.post('/sequences', marketingController.createSequence);
router.put('/sequences/:id', marketingController.updateSequence);
router.delete('/sequences/:id', marketingController.deleteSequence);

// Analytics
router.get('/analytics', marketingController.getAnalytics);

module.exports = router;
