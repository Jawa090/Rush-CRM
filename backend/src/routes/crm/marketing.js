const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const marketingController = require('../../controllers/crm/marketingController');

router.use(auth, requireOrg);

// Dashboard
router.get('/dashboard', marketingController.getDashboardStats);

// Campaigns
router.get('/campaigns', marketingController.getCampaigns);
router.post('/campaigns', marketingController.createCampaign);
router.put('/campaigns/:id', marketingController.updateCampaign);
router.delete('/campaigns/:id', marketingController.deleteCampaign);

// Lists
router.get('/lists', marketingController.getLists);
router.post('/lists', marketingController.createList);
router.delete('/lists/:id', marketingController.deleteList);
router.get('/lists/:listId/members', marketingController.getListMembers);
router.post('/lists/:listId/members', marketingController.addListMembers);
router.get('/lists/:listId/export', marketingController.exportListMembers);

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

// Email Sending
router.post('/campaigns/:id/send', marketingController.sendCampaign);
router.post('/campaigns/test-email', marketingController.sendTestEmail);
router.post('/campaigns/track-event', marketingController.trackEmailEvent);
router.get('/email/verify-config', marketingController.verifyEmailConfig);

module.exports = router;
