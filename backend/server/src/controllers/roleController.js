const db = require('../config/database');

const getAll = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM public.roles WHERE org_id = $1 ORDER BY created_at DESC`,
      [req.user.orgId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const roleResult = await db.query(
      'SELECT * FROM public.roles WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );

    if (roleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const permissionsResult = await db.query(
      'SELECT * FROM public.role_permissions WHERE role_id = $1',
      [id]
    );

    res.json({
      ...roleResult.rows[0],
      permissions: permissionsResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body;

    const result = await db.query(
      `INSERT INTO public.roles (org_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.orgId, name, description]
    );

    const roleId = result.rows[0].id;

    if (permissions && permissions.length > 0) {
      const permValues = permissions.map((p, i) => `($1, ${roleId}, $${i + 2}, $${i + 3}, $${i + 4}, $${i + 5}, $${i + 6})`).join(', ');
      const permParams = [req.user.orgId, ...permissions.flatMap(p => [p.module, p.canCreate, p.canRead, p.canUpdate, p.canDelete])];
      
      await db.query(
        `INSERT INTO public.role_permissions (org_id, role_id, module_name, can_create, can_read, can_update, can_delete)
         VALUES ${permValues}`,
        permParams
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const result = await db.query(
      `UPDATE public.roles SET name = COALESCE($1, name), description = COALESCE($2, description)
       WHERE id = $3 AND org_id = $4
       RETURNING *`,
      [name, description, id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM public.role_permissions WHERE role_id = $1', [id]);
    
    const result = await db.query(
      'DELETE FROM public.roles WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json({ message: 'Role deleted' });
  } catch (err) {
    next(err);
  }
};

const getAllPermissions = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM role_permissions WHERE org_id = $1 ORDER BY role_id, module, action',
      [req.user.orgId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

const getEffectivePermissions = async (req, res, next) => {
  try {
    const { role_id } = req.query;
    if (!role_id) return res.json([]);
    const result = await db.query(
      'SELECT module, action, is_granted, false as is_inherited FROM role_permissions WHERE role_id = $1 AND is_granted = true',
      [role_id]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

const getAuditLog = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM permission_audit_log WHERE org_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.orgId]
    ).catch(() => ({ rows: [] }));
    res.json(result.rows);
  } catch (err) { res.json([]); }
};

const createAuditLog = async (req, res, next) => {
  try {
    const { action, entityType, entityId, oldValue, newValue } = req.body;
    await db.query(
      `INSERT INTO permission_audit_log (org_id, user_id, action, entity_type, entity_id, old_value, new_value) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [req.user.orgId, req.user.id, action, entityType, entityId, JSON.stringify(oldValue), JSON.stringify(newValue)]
    ).catch(() => {});
    res.json({ success: true });
  } catch (err) { res.json({ success: true }); }
};

const togglePermission = async (req, res, next) => {
  try {
    const { roleId, module, action, isGranted } = req.body;
    await db.query(
      `INSERT INTO role_permissions (role_id, org_id, module, action, is_granted)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (role_id, module, action) DO UPDATE SET is_granted = $5`,
      [roleId, req.user.orgId, module, action, isGranted]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
};

const setModulePermissions = async (req, res, next) => {
  try {
    const { roleId, module, actions } = req.body;
    await db.query('DELETE FROM role_permissions WHERE role_id = $1 AND module = $2', [roleId, module]);
    for (const action of (actions || [])) {
      await db.query(
        `INSERT INTO role_permissions (role_id, org_id, module, action, is_granted) VALUES ($1,$2,$3,$4,true)`,
        [roleId, req.user.orgId, module, action]
      );
    }
    res.json({ success: true });
  } catch (err) { next(err); }
};

module.exports = {
  getAll, getById, create, update, remove,
  getAllPermissions, getEffectivePermissions, getAuditLog, createAuditLog,
  togglePermission, setModulePermissions,
};
