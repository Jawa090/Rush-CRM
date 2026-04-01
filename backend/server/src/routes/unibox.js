const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../middleware/auth');
const uniboxController = require('../controllers/uniboxController');

router.use(auth, requireOrg);

// Email management
router.get('/emails', uniboxController.getEmails);
router.patch('/emails/:id/status', uniboxController.updateEmailStatus);
router.patch('/emails/:id/starred', uniboxController.toggleStarred);
router.patch('/emails/:id/read', uniboxController.markAsRead);
router.patch('/emails/:id/archive', uniboxController.toggleArchive);
router.post('/emails/:id/convert-to-lead', uniboxController.convertToLead);
router.post('/emails/sample', uniboxController.createSampleEmail);

// Statistics and templates
router.get('/stats', uniboxController.getStats);
router.get('/templates', uniboxController.getTemplates);

// Permissions
router.get('/permission', uniboxController.checkPermission);

module.exports = router;