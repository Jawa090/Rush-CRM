const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const emailSyncController = require('../../controllers/collaboration/emailSyncController');

router.use(auth, requireOrg);

router.post('/sync', emailSyncController.sync);
router.get('/mailboxes', emailSyncController.getMailboxes);
router.post('/mailboxes', emailSyncController.createMailbox);
router.delete('/mailboxes/:id', emailSyncController.deleteMailbox);
router.get('/messages', emailSyncController.getMessages);
router.patch('/messages/:id', emailSyncController.updateMessage);
router.post('/messages/bulk', emailSyncController.bulkUpdateMessages);
router.get('/counts', emailSyncController.getCounts);
router.get('/attachments', emailSyncController.getAttachments);
router.get('/crm-links', emailSyncController.getCrmLinks);
router.post('/crm-links', emailSyncController.createCrmLink);
router.delete('/crm-links/:id', emailSyncController.deleteCrmLink);
router.post('/oauth-callback', emailSyncController.oauthCallback);
router.get('/oauth-callback', emailSyncController.oauthCallbackGet);
router.get('/oauth-url/:provider', emailSyncController.getOauthUrl);
router.post('/send', emailSyncController.sendEmail);

module.exports = router;
