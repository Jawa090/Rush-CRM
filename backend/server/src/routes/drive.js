const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../middleware/auth');
const driveController = require('../controllers/driveController');

router.use(auth, requireOrg);

// Folders
router.get('/folders', driveController.getFolders);
router.post('/folders', driveController.createFolder);
router.delete('/folders/:id', driveController.deleteFolder);

// Files
router.get('/files', driveController.getFiles);
router.post('/files/upload', driveController.uploadFile);
router.delete('/files/:id', driveController.deleteFile);

// Activities
router.get('/activities', driveController.getRecentActivities);

// Search
router.get('/search', driveController.search);

module.exports = router;