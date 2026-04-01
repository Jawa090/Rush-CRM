const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../middleware/auth');
const permissionController = require('../controllers/permissionController');

router.use(auth, requireOrg);

router.get('/', permissionController.getAll);
router.get('/user/:userId', permissionController.getUserPermissions);
router.put('/', permissionController.update);

module.exports = router;
