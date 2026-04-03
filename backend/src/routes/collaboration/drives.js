const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const connectedDrivesController = require('../../controllers/collaboration/connectedDrivesController');

// All routes require authentication
router.use(auth);
router.use(requireOrg);

// Drive Management
router.get('/', connectedDrivesController.getDrives);
router.post('/', connectedDrivesController.connectDrive);
router.put('/:id', connectedDrivesController.updateDrive);
router.delete('/:id', connectedDrivesController.disconnectDrive);

// Permissions
router.get('/:id/permissions', connectedDrivesController.getDrivePermissions);
router.post('/:id/permissions', connectedDrivesController.assignDrivePermission);
router.post('/:id/permissions/bulk', connectedDrivesController.assignBulkDrivePermissions);
router.delete('/:driveId/permissions/:permissionId', connectedDrivesController.removeDrivePermission);

module.exports = router;
