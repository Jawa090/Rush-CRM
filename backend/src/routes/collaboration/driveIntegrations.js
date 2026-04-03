const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const driveIntegrationsController = require('../../controllers/collaboration/driveIntegrationsController');

// All routes require authentication
router.use(auth);
router.use(requireOrg);

// Entity-File Linking
router.get('/entity-files', driveIntegrationsController.getEntityFiles);
router.post('/entity-files', driveIntegrationsController.linkEntityFile);
router.delete('/entity-files/:id', driveIntegrationsController.unlinkEntityFile);

// Provider specific actions
router.post('/onedrive/:action', driveIntegrationsController.handleOneDriveAction);
router.post('/google-drive/:action', driveIntegrationsController.handleGoogleDriveAction);
router.post('/network-drive', driveIntegrationsController.handleNetworkDriveAction);

module.exports = router;
