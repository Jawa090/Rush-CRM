const db = require('../../config/database');

const getByEntity = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT a.*, p.full_name as user_name, p.avatar_url as user_avatar
       FROM public.crm_activities a
       LEFT JOIN public.profiles p ON p.id = a.user_id
       WHERE a.entity_type = $1 AND a.entity_id = $2 AND a.org_id = $3
       ORDER BY a.created_at DESC
       LIMIT $4 OFFSET $5`,
      [entityType, entityId, req.user.orgId, limit, offset]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getRecent = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const result = await db.query(
      `SELECT a.*, p.full_name as user_name, p.avatar_url as user_avatar
       FROM public.crm_activities a
       LEFT JOIN public.profiles p ON p.id = a.user_id
       WHERE a.org_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2`,
      [req.user.orgId, limit]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getByEmailId = async (req, res, next) => {
  try {
    const { emailId } = req.params;
    const result = await db.query(
      `SELECT * FROM public.crm_activities WHERE entity_type = 'email' AND entity_id = $1 AND org_id = $2 ORDER BY created_at DESC LIMIT 10`,
      [emailId, req.user.orgId]
    ).catch(() => ({ rows: [] }));
    res.json(result.rows);
  } catch (err) { res.json([]); }
};

const create = async (req, res, next) => {
  try {
    const { entityType, entityId, activityType, title, description, metadata } = req.body;
    
    if (!entityType || !entityId || !activityType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.query(
      `INSERT INTO public.crm_activities 
       (org_id, user_id, entity_type, entity_id, activity_type, title, description, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.orgId,
        req.user.id,
        entityType,
        entityId,
        activityType,
        title,
        description,
        metadata ? JSON.stringify(metadata) : null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getByEntity,
  getRecent,
  getByEmailId,
  create,
};
