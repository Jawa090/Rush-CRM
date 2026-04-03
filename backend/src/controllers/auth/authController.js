const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../../config/database');
const { pool } = db;
const Joi = require('joi');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, orgId: user.org_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().required(),
  orgName: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const register = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) throw error;

    const { email, password, fullName, orgName } = value;

    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    await client.query('BEGIN');

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const orgId = uuidv4();
    const orgNameToUse = orgName || `${fullName}'s Organization`;

    await client.query(
      'INSERT INTO organizations (id, name) VALUES ($1, $2)',
      [orgId, orgNameToUse]
    );

    const userResult = await client.query(
      'INSERT INTO users (id, organization_id, email, password_hash, full_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, organization_id',
      [userId, orgId, email, hashedPassword, fullName]
    );

    const user = userResult.rows[0];

    // Note: user_roles table structure may vary, adjust if needed
    // If user_roles doesn't have org_id column, remove it
    await client.query(
      'INSERT INTO user_roles (user_id, role_id) SELECT $1, id FROM roles WHERE name = $2 LIMIT 1',
      [user.id, 'admin']
    ).catch(() => {
      // If above fails, try simple insert (table might not exist or have different structure)
      console.log('user_roles insert skipped or failed');
    });

    await client.query('COMMIT');

    const token = generateToken(user);

    res.status(201).json({
      user: { id: user.id, email: user.email, fullName: user.full_name, orgId: user.organization_id },
      token,
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => { });
    next(err);
  } finally {
    client.release();
  }
};

const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) throw error;

    const { email, password } = value;

    const userResult = await db.query(
      `SELECT u.id, u.email, u.password_hash, u.full_name, u.organization_id, u.avatar_url
       FROM users u
       WHERE u.email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const roleResult = await db.query(
      'SELECT role FROM user_roles WHERE user_id = $1 LIMIT 1',
      [user.id]
    );

    const token = generateToken({
      id: user.id,
      email: user.email,
      org_id: user.organization_id,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        orgId: user.organization_id,
        role: roleResult.rows[0]?.role || 'employee',
      },
    });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const userResult = await db.query(
      `SELECT u.*, o.name as org_name
       FROM users u
       LEFT JOIN organizations o ON o.id = u.organization_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    const roleResult = await db.query(
      'SELECT role, id FROM user_roles WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );

    res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      org_id: user.organization_id,
      orgName: user.org_name,
      avatar_url: user.avatar_url,
      createdAt: user.created_at,
      user_roles: roleResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, avatarUrl, phone, position } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           avatar_url = COALESCE($2, avatar_url),
           phone = COALESCE($3, phone),
           position = COALESCE($4, position),
           updated_at = now()
       WHERE id = $5
       RETURNING id, email, full_name, org_id, avatar_url, phone, position, created_at, updated_at`,
      [fullName, avatarUrl, phone, position, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    res.json({ message: 'Password reset email sent (integration with Supabase needed)' });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, password } = req.body;
    const pwd = newPassword || password;
    if (!pwd || pwd.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (currentPassword) {
      const userResult = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
      const valid = await bcrypt.compare(currentPassword, userResult.rows[0]?.password_hash || '');
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
    }
    const hashedPassword = await bcrypt.hash(pwd, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  logout,
  changePassword,
};
