const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const integrationsController = require('../../controllers/automation/integrationsController');

router.use(auth, requireOrg);

router.post('/google/exchange-code', integrationsController.googleExchangeCode);
router.post('/gmail/exchange-code', integrationsController.gmailExchangeCode);
router.post('/google-calendar/exchange-code', integrationsController.googleCalendarExchangeCode);
router.post('/microsoft/exchange-code', integrationsController.microsoftExchangeCode);
router.post('/outlook/exchange-code', integrationsController.outlookExchangeCode);
router.post('/onedrive/exchange-code', integrationsController.onedriveExchangeCode);
router.post('/instantly', integrationsController.instantly);

module.exports = router;
