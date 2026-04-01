const express = require('express');
const router = express.Router();
const {
  getWorkgroupWikiPages,
  getWorkgroupWikiPage,
  createWorkgroupWikiPage,
  updateWorkgroupWikiPage,
  deleteWorkgroupWikiPage
} = require('../controllers/workgroupWikiController');
const { auth } = require('../middleware/auth');

// Apply authentication to all routes
router.use(auth);

// Wiki routes
router.get('/:workgroupId/wiki', getWorkgroupWikiPages);
router.post('/:workgroupId/wiki', createWorkgroupWikiPage);
router.get('/:workgroupId/wiki/:pageId', getWorkgroupWikiPage);
router.put('/:workgroupId/wiki/:pageId', updateWorkgroupWikiPage);
router.delete('/:workgroupId/wiki/:pageId', deleteWorkgroupWikiPage);

module.exports = router;