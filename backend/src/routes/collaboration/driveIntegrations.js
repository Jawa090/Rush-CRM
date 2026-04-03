const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const driveIntegrationsController = require('../../controllers/collaboration/driveIntegrationsController');

router.use(auth, requireOrg);

router.get('/entity-files', driveIntegrationsController.getEntityFiles);
router.post('/entity-files', driveIntegrationsController.createEntityFile);
router.delete('/entity-files/:id', driveIntegrationsController.deleteEntityFile);
router.post('/onedrive/:action', driveIntegrationsController.onedriveAction);
router.post('/google-drive/:action', driveIntegrationsController.googleDriveAction);
router.post('/network-drive', driveIntegrationsController.networkDriveAction);

module.exports = router;
