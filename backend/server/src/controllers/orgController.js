const db = require('../config/database');

const getCurrent = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM public.organizations WHERE id = $1',
      [req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { name, domain, logoUrl, settings } = req.body;

    const result = await db.query(
      `UPDATE public.organizations 
       SET name = COALESCE($1, name),
           domain = COALESCE($2, domain),
           logo_url = COALESCE($3, logo_url),
           settings = COALESCE($4, settings),
           updated_at = now()
       WHERE id = $5
       RETURNING *`,
      [name, domain, logoUrl, settings, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const getInvites = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT oi.*, p.full_name as inviter_name
       FROM public.organization_invites oi
       LEFT JOIN public.profiles p ON p.id = oi.invited_by
       WHERE oi.org_id = $1
       ORDER BY oi.created_at DESC`,
      [req.user.orgId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const createInvite = async (req, res, next) => {
  try {
    const { email, role } = req.body;

    const result = await db.query(
      `INSERT INTO public.organization_invites (org_id, email, role, invited_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.orgId, email, role || 'employee', req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const deleteInvite = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM public.organization_invites WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    res.json({ message: 'Invite deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCurrent,
  update,
  getInvites,
  createInvite,
  deleteInvite,
};
