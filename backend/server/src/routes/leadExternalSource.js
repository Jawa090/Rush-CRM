const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createExternalSource,
  getAllExternalSources,
  updateExternalSource,
  deleteExternalSource,
  regenerateApiKey,
  receiveExternalLead
} = require('../controllers/leadExternalSourceController');

// Protected routes (require authentication)
router.post('/', auth, createExternalSource);
router.get('/', auth, getAllExternalSources);
router.put('/:id', auth, updateExternalSource);
router.delete('/:id', auth, deleteExternalSource);
router.post('/:id/regenerate-key', auth, regenerateApiKey);

// Public route for receiving leads (API key authentication)
router.post('/receive', receiveExternalLead);

module.exports = router;
