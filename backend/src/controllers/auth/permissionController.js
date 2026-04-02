const db = require('../../config/database');

const getAll = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM public.permissions WHERE org_id = $1 ORDER BY role, module_name',
      [req.user.orgId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getUserPermissions = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const roleResult = await db.query(
      'SELECT role FROM public.user_roles WHERE user_id = $1 AND org_id = $2',
      [userId, req.user.orgId]
    );

    if (roleResult.rows.length === 0) {
      return res.status(404).json({ error: 'User role not found' });
    }

    const result = await db.query(
      'SELECT * FROM public.permissions WHERE org_id = $1 AND role = $2',
      [req.user.orgId, roleResult.rows[0].role]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Permissions array required' });
    }

    for (const perm of permissions) {
      await db.query(
        `UPDATE public.permissions 
         SET can_create = $1, can_read = $2, can_update = $3, can_delete = $4
         WHERE org_id = $5 AND role = $6 AND module_name = $7`,
        [perm.canCreate, perm.canRead, perm.canUpdate, perm.canDelete, req.user.orgId, perm.role, perm.module]
      );
    }

    res.json({ message: 'Permissions updated' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getUserPermissions,
  update,
};
