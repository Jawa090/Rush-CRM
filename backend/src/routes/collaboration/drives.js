const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const db = require('../../config/database');

router.use(auth, requireOrg);

router.get('/', async (req, res, next) => {
  try {
    const { ownership } = req.query;
    let query = 'SELECT * FROM connected_drives WHERE org_id = $1 AND is_active = true';
    const params = [req.user.orgId];
    if (ownership) {
      query += ' AND ownership = $2';
      params.push(ownership);
    }
    query += ' ORDER BY created_at DESC';
    const { rows } = await db.query(query, params);
    res.json({ data: rows });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { org_id, ownership, drive_type, display_name, network_path, network_protocol, connected_by } = req.body;
    const { rows } = await db.query(
      'INSERT INTO connected_drives (org_id, ownership, drive_type, display_name, network_path, network_protocol, connected_by, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,true) RETURNING *',
      [org_id || req.user.orgId, ownership, drive_type, display_name, network_path, network_protocol, connected_by || req.user.id]
    );
    res.status(201).json({ data: rows[0] });
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const fields = [];
    const values = [];
    let i = 1;
    const updatable = ['display_name', 'network_path', 'network_protocol', 'ownership'];
    for (const key of updatable) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = $${i++}`);
        values.push(req.body[key]);
      }
    }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id, req.user.orgId);
    const { rows } = await db.query(
      `UPDATE connected_drives SET ${fields.join(', ')}, updated_at = now() WHERE id = $${i} AND org_id = $${i + 1} RETURNING *`,
      values
    );
    if (!rows.length) return res.status(404).json({ error: 'Drive not found' });
    res.json({ data: rows[0] });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('UPDATE connected_drives SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) { next(error); }
});

router.get('/:id/permissions', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM drive_permissions WHERE drive_id = $1 ORDER BY created_at DESC', [req.params.id]);
    res.json({ data: rows });
  } catch (error) { next(error); }
});

router.post('/:id/permissions', async (req, res, next) => {
  try {
    const { org_id, user_id, role, access_level } = req.body;
    const { rows } = await db.query(
      'INSERT INTO drive_permissions (drive_id, org_id, user_id, role, access_level) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.params.id, org_id, user_id, role, access_level]
    );
    res.status(201).json({ data: rows[0] });
  } catch (error) { next(error); }
});

router.post('/:id/permissions/bulk', async (req, res, next) => {
  try {
    const { permissions } = req.body;
    const inserted = [];
    for (const p of permissions) {
      const { rows } = await db.query(
        'INSERT INTO drive_permissions (drive_id, org_id, user_id, role, access_level) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [p.drive_id, p.org_id, p.user_id, p.role, p.access_level]
      );
      inserted.push(rows[0]);
    }
    res.status(201).json({ data: inserted });
  } catch (error) { next(error); }
});

router.delete('/:driveId/permissions/:permissionId', async (req, res, next) => {
  try {
    await db.query('DELETE FROM drive_permissions WHERE id = $1', [req.params.permissionId]);
    res.json({ success: true });
  } catch (error) { next(error); }
});

module.exports = router;
