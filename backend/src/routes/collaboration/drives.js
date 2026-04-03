const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const drivesController = require('../../controllers/collaboration/drivesController');

router.use(auth, requireOrg);

router.get('/', drivesController.getAll);
router.post('/', drivesController.create);
router.put('/:id', drivesController.update);
router.delete('/:id', drivesController.remove);
router.get('/:id/permissions', drivesController.getPermissions);
router.post('/:id/permissions', drivesController.createPermission);
router.post('/:id/permissions/bulk', drivesController.bulkCreatePermissions);
router.delete('/:driveId/permissions/:permissionId', drivesController.deletePermission);

module.exports = router;
