const express = require('express');
const router = express.Router();
const {
  getWorkgroupFiles,
  uploadWorkgroupFile,
  deleteWorkgroupFile,
  downloadWorkgroupFile
} = require('../controllers/workgroupFilesController');
const { auth } = require('../middleware/auth');

// Apply authentication to all routes
router.use(auth);

// File routes
router.get('/:workgroupId/files', getWorkgroupFiles);
router.post('/:workgroupId/files', uploadWorkgroupFile);
router.get('/:workgroupId/files/:fileId/download', downloadWorkgroupFile);
router.delete('/:workgroupId/files/:fileId', deleteWorkgroupFile);

module.exports = router;