
const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const driveIntegrationsController = require('../../controllers/collaboration/driveIntegrationsController');

// All routes require authentication
router.use(auth);
router.use(requireOrg);

// Entity-File Linking
router.get('/entity-files', driveIntegrationsController.getEntityFiles);
router.post('/entity-files', driveIntegrationsController.linkEntityFile);
router.delete('/entity-files/:id', driveIntegrationsController.unlinkEntityFile);

// Provider specific actions
router.post('/onedrive/:action', driveIntegrationsController.handleOneDriveAction);
router.post('/google-drive/:action', driveIntegrationsController.handleGoogleDriveAction);
router.post('/network-drive', driveIntegrationsController.handleNetworkDriveAction);

module.exports = router;

const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');

const db = require('../../config/database');

/**
 * Get linked drive files for an entity (Lead, Contact, etc.)
 */
const getEntityFiles = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.query;
    const { rows } = await db.query(
      'SELECT * FROM entity_drive_files WHERE entity_type = $1 AND entity_id = $2 AND org_id = $3 ORDER BY created_at DESC',
      [entityType, entityId, req.user.orgId]
    );
    res.json(rows);
  } catch (error) { next(error); }
};

/**
 * Link a drive file to an entity
 */
const linkEntityFile = async (req, res, next) => {
  try {
    const { entity_type, entity_id, provider, drive_connection_id, file_id, file_name, mime_type, file_size, web_view_link, thumbnail_link, folder_path, linked_by } = req.body;
    const { rows } = await db.query(
      'INSERT INTO entity_drive_files (org_id, entity_type, entity_id, provider, drive_connection_id, file_id, file_name, mime_type, file_size, web_view_link, thumbnail_link, folder_path, linked_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *',
      [req.user.orgId, entity_type, entity_id, provider, drive_connection_id, file_id, file_name, mime_type, file_size, web_view_link, thumbnail_link, folder_path, linked_by || req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Duplicate entry', message: 'This file is already linked' });
    next(error);
  }
};

/**
 * Unlink a drive file from an entity
 */
const unlinkEntityFile = async (req, res, next) => {
  try {
    await db.query('DELETE FROM entity_drive_files WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) { next(error); }
};

/**
 * Handle OneDrive actions
 */
const handleOneDriveAction = async (req, res, next) => {
  try {
    const { action } = req.params;
    res.json({ success: true, action, message: 'OneDrive action acknowledged (connector placeholder)' });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Google Drive actions
 */
const handleGoogleDriveAction = async (req, res, next) => {
  try {
    const { action } = req.params;
    res.json({ success: true, action, message: 'Google Drive action acknowledged (connector placeholder)' });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Network Drive actions
 */
const handleNetworkDriveAction = async (req, res, next) => {
  try {
    const { action } = req.body;
    res.json({ success: true, action: action || 'connect', message: 'Network drive action recorded' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEntityFiles,
  linkEntityFile,
  unlinkEntityFile,
  handleOneDriveAction,
  handleGoogleDriveAction,
  handleNetworkDriveAction
};
>>>>>>> origin/main
