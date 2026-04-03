const db = require('../../config/database');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM public.projects WHERE org_id = $1`;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'on_hold') as on_hold,
        COUNT(*) as total
       FROM public.projects WHERE org_id = $1`,
      [req.user.orgId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM public.projects WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    console.log('Creating project with data:', req.body);
    const { name, description, startDate, endDate, color, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const result = await db.query(
      `INSERT INTO public.projects (
        org_id, owner_id, name, description, start_date, end_date, color, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.orgId, 
        req.user.id, 
        name.trim(), 
        description || null, 
        startDate || null, 
        endDate || null, 
        color || 'bg-primary', 
        status || 'active'
      ]
    );

    console.log('Project created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Project creation error:', err);
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, color, status } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
    if (startDate !== undefined) { fields.push(`start_date = $${paramIndex++}`); values.push(startDate); }
    if (endDate !== undefined) { fields.push(`end_date = $${paramIndex++}`); values.push(endDate); }
    if (color !== undefined) { fields.push(`color = $${paramIndex++}`); values.push(color); }
    if (status !== undefined) { fields.push(`status = $${paramIndex++}`); values.push(status); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = now()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.projects SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
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
      'DELETE FROM public.projects WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT pm.*, u.full_name, u.email, u.avatar_url
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1 AND pm.org_id = $2
       ORDER BY pm.created_at ASC`,
      [id, req.user.orgId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id, role } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await db.query(
      `INSERT INTO project_members (org_id, project_id, user_id, role)
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (project_id, user_id) DO UPDATE SET role = $4
       RETURNING *`,
      [req.user.orgId, id, user_id, role || 'member']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;

    const result = await db.query(
      'DELETE FROM project_members WHERE id = $1 AND project_id = $2 AND org_id = $3 RETURNING id',
      [memberId, id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getStats,
  getById,
  create,
  update,
  remove,
  getMembers,
  addMember,
  removeMember,
};


const getComments = async (req, res) => {
  try {
    const { entity_type, entity_id } = req.query;
    const tableCheck = await db.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_comments')`
    );
    if (!tableCheck.rows[0].exists) return res.json([]);
    const { rows } = await db.query(
      'SELECT * FROM project_comments WHERE entity_type = $1 AND entity_id = $2 AND org_id = $3 ORDER BY created_at ASC',
      [entity_type, entity_id, req.user.orgId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Project comments error:', err);
    res.json([]);
  }
};

const createComment = async (req, res) => {
  try {
    const { content, entity_type, entity_id } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    const tableCheck = await db.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_comments')`
    );
    if (!tableCheck.rows[0].exists) return res.status(501).json({ error: 'Comments feature not available' });
    const { rows } = await db.query(
      'INSERT INTO project_comments (content, entity_type, entity_id, org_id, user_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [content, entity_type, entity_id, req.user.orgId, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Project comments creation error:', err);
    res.status(500).json({ error: err.message });
  }
};

const getReport = async (req, res, next) => {
  try {
    const projectId = req.params.token;
    const { rows: projectRows } = await db.query('SELECT * FROM public.projects WHERE id = $1 AND org_id = $2', [projectId, req.user.orgId]);
    if (!projectRows.length) return res.status(404).json({ error: 'Project not found' });
    const project = projectRows[0];
    const { rows: taskRows } = await db.query('SELECT * FROM public.tasks WHERE project_id = $1 AND org_id = $2 ORDER BY sort_order ASC', [projectId, req.user.orgId]);
    res.json({ project, milestones: [], tasks: taskRows, permissions: { canEdit: true } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getStats,
  getById,
  create,
  update,
  remove,
  getMembers,
  addMember,
  removeMember,
  getComments,
  createComment,
  getReport,
};
