const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const integrationsController = require('../../controllers/automation/integrationsController');

// All routes require authentication
router.use(auth);
router.use(requireOrg);

// Google
router.post('/google/exchange-code', integrationsController.exchangeGoogleCode);
router.post('/gmail/exchange-code', integrationsController.exchangeGmailCode);
router.post('/google-calendar/exchange-code', integrationsController.exchangeGoogleCalendarCode);

// Microsoft
router.post('/microsoft/exchange-code', integrationsController.exchangeMicrosoftCode);
router.post('/outlook/exchange-code', integrationsController.exchangeOutlookCode);
router.post('/onedrive/exchange-code', integrationsController.exchangeOneDriveCode);

// Others
router.post('/instantly', integrationsController.handleInstantly);

module.exports = router;
