const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const authController = require('../../controllers/auth/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.post('/logout', auth, authController.logout);
router.post('/change-password', auth, authController.changePassword);

module.exports = router;
