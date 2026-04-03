const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const emailController = require('../../controllers/collaboration/emailController');

// Public OAuth routes (must be before authentication middleware)
router.post('/oauth-callback', emailController.handleOAuthCallback);
router.get('/oauth-callback', emailController.handleOAuthCallbackGet);

// All other routes require authentication
router.use(auth);
router.use(requireOrg);

// Mailbox Management
router.get('/mailboxes', emailController.getMailboxes);
router.post('/mailboxes', emailController.connectMailbox);
router.delete('/mailboxes/:id', emailController.disconnectMailbox);

// Message Management
router.get('/messages', emailController.getMessages);
router.patch('/messages/:id', emailController.updateMessage);
router.post('/messages/bulk', emailController.bulkUpdateMessages);
router.get('/counts', emailController.getMessageCounts);

// Sync and Utility
router.post('/sync', emailController.syncEmail);
router.post('/send', emailController.sendEmail);

// OAuth URL generation still needs auth
router.get('/oauth-url/:provider', emailController.getOAuthUrl);

// CRM Integration
router.get('/crm-links', emailController.getCRMLinks);
router.post('/crm-links', emailController.createCRMLink);
router.delete('/crm-links/:id', emailController.deleteCRMLink);

// Attachments
router.get('/attachments', emailController.getAttachments);

module.exports = router;
