const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const userController = require('../../controllers/auth/userController');

router.use(auth, requireOrg);

router.get('/', userController.getAll);
router.get('/:id/profile', userController.getProfile);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.remove);
router.post('/:id/reset-password', userController.resetPassword);

module.exports = router;
