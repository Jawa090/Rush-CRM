const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  upload,
  detectFields,
  importLeads,
  getImportHistory
} = require('../controllers/leadImportController');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Import routes working!' });
});

// Upload file and detect fields
router.post('/detect-fields', auth, upload.single('file'), detectFields);

// Import leads with field mapping
router.post('/', auth, importLeads);

// Get import history
router.get('/history', auth, getImportHistory);

module.exports = router;
