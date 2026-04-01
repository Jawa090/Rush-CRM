const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  shareLeadWithWorkspace,
  getLeadSharedWorkspaces,
  removeWorkspaceAccess,
  getAvailableWorkspaces
} = require('../controllers/leadWorkspaceController');

// Get available workspaces for sharing
router.get('/:leadId/available-workspaces', auth, getAvailableWorkspaces);

// Get all workspaces a lead is shared with
router.get('/:leadId/shared-workspaces', auth, getLeadSharedWorkspaces);

// Share lead with workspace
router.post('/:leadId/share', auth, shareLeadWithWorkspace);

// Remove workspace access
router.delete('/:leadId/workspace/:workspaceId', auth, removeWorkspaceAccess);

module.exports = router;
