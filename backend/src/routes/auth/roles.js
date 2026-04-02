const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const roleController = require('../../controllers/auth/roleController');

router.use(auth, requireOrg);

router.get('/', roleController.getAll);
router.get('/permissions', roleController.getAllPermissions);
router.get('/effective-permissions', roleController.getEffectivePermissions);
router.get('/audit-log', roleController.getAuditLog);
router.post('/permissions/toggle', roleController.togglePermission);
router.post('/permissions/module', roleController.setModulePermissions);
router.post('/audit-log', roleController.createAuditLog);
router.get('/:id', roleController.getById);
router.post('/', roleController.create);
router.put('/:id', roleController.update);
router.delete('/:id', roleController.remove);

module.exports = router;
