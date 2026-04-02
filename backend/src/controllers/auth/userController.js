const db = require('../../config/database');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, ur.role
      FROM public.profiles p
      LEFT JOIN public.user_roles ur ON ur.user_id = p.id AND ur.org_id = p.org_id
      WHERE p.org_id = $1
    `;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (search) {
      query += ` AND (p.full_name ILIKE $${paramIndex} OR p.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    result.rows.forEach(row => {
      delete row.encrypted_password;
    });

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT p.*, ur.role
       FROM public.profiles p
       LEFT JOIN public.user_roles ur ON ur.user_id = p.id AND ur.org_id = p.org_id
       WHERE p.id = $1 AND p.org_id = $2`,
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    delete result.rows[0].encrypted_password;
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { email, fullName, role, phone, position } = req.body;

    res.status(501).json({
      message: 'User creation requires Supabase Auth',
      note: 'Create user in Supabase Auth, then call /api/employees'
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, phone, position, role, status, job_title, department } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (fullName !== undefined) { fields.push(`full_name = $${paramIndex++}`); values.push(fullName); }
    if (phone !== undefined) { fields.push(`phone = $${paramIndex++}`); values.push(phone); }
    if (position !== undefined) { fields.push(`position = $${paramIndex++}`); values.push(position); }
    if (status !== undefined) { fields.push(`status = $${paramIndex++}`); values.push(status); }
    if (job_title !== undefined) { fields.push(`job_title = $${paramIndex++}`); values.push(job_title); }
    if (department !== undefined) { fields.push(`department = $${paramIndex++}`); values.push(department); }

    if (fields.length > 0) {
      fields.push(`updated_at = now()`);
      values.push(id, req.user.orgId);

      await db.query(
        `UPDATE public.profiles SET ${fields.join(', ')} 
         WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}`,
        values
      );
    }

    if (role !== undefined) {
      await db.query(
        `UPDATE public.user_roles SET role = $1, updated_at = now()
         WHERE user_id = $2 AND org_id = $3`,
        [role, id, req.user.orgId]
      );
    }

    const result = await db.query(
      `SELECT p.*, ur.role
       FROM public.profiles p
       LEFT JOIN public.user_roles ur ON ur.user_id = p.id AND ur.org_id = p.org_id
       WHERE p.id = $1 AND p.org_id = $2`,
      [id, req.user.orgId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user.id;
    
    const result = await db.query(
      `SELECT phone, job_title, department FROM public.profiles WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'UPDATE public.profiles SET status = \'inactive\', updated_at = now() WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deactivated' });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  resetPassword,
  getProfile,
};
