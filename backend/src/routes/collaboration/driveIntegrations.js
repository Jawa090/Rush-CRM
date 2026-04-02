const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const db = require('../../config/database');

// Use the shared auth middleware and org scoping
router.use(auth);
router.use(requireOrg);

router.get('/entity-files', async (req, res, next) => {
  try {
    const { entityType, entityId } = req.query;
    const { rows } = await db.query(
      'SELECT * FROM entity_drive_files WHERE entity_type = $1 AND entity_id = $2 AND org_id = $3 ORDER BY created_at DESC',
      [entityType, entityId, req.user.orgId]
    );
    res.json(rows);
  } catch (error) { next(error); }
});

router.post('/entity-files', async (req, res, next) => {
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
});

router.delete('/entity-files/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM entity_drive_files WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) { next(error); }
});

router.post('/onedrive/:action', async (req, res, next) => {
  try {
    const { action } = req.params;
    res.json({ success: true, action, message: 'OneDrive action acknowledged (connector placeholder)' });
  } catch (error) {
    next(error);
  }
});

router.post('/google-drive/:action', async (req, res, next) => {
  try {
    const { action } = req.params;
    res.json({ success: true, action, message: 'Google Drive action acknowledged (connector placeholder)' });
  } catch (error) {
    next(error);
  }
});

router.post('/network-drive', async (req, res, next) => {
  try {
    const { action } = req.body;
    res.json({ success: true, action: action || 'connect', message: 'Network drive action recorded' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
