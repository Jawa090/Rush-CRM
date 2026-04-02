const db = require('../../config/database');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, projectId, status, assignedTo } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM public.tasks WHERE org_id = $1`;
    const params = [req.user.orgId];
    let paramIndex = 2;

    // Only add filters if they have actual values (not undefined or 'undefined' strings)
    if (projectId && projectId !== 'undefined') {
      query += ` AND project_id = $${paramIndex}`;
      params.push(projectId);
      paramIndex++;
    }

    if (status && status !== 'undefined') {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (assignedTo && assignedTo !== 'undefined') {
      query += ` AND assigned_to = $${paramIndex}`;
      params.push(assignedTo);
      paramIndex++;
    }

    query += ` ORDER BY sort_order ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    console.log('Task query:', query);
    console.log('Task params:', params);

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Task getAll error:', err);
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM public.tasks WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    console.log('Creating task with data:', req.body);
    const { title, description, projectId, assignedTo, dueDate, priority, status, parentTaskId } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    // Get the next sort order
    const maxOrder = await db.query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM public.tasks WHERE org_id = $1',
      [req.user.orgId]
    );

    const result = await db.query(
      `INSERT INTO public.tasks (
        org_id, project_id, title, description, assigned_to, due_date, 
        priority, status, parent_task_id, sort_order, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        req.user.orgId, 
        projectId || null, 
        title.trim(), 
        description || null, 
        assignedTo || null, 
        dueDate || null, 
        priority || 'medium', 
        status || 'todo', 
        parentTaskId || null, 
        maxOrder.rows[0].next_order, 
        req.user.id
      ]
    );

    console.log('Task created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Task creation error:', err);
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, assignedTo, dueDate, priority, status } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(title); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
    if (assignedTo !== undefined) { fields.push(`assigned_to = $${paramIndex++}`); values.push(assignedTo); }
    if (dueDate !== undefined) { fields.push(`due_date = $${paramIndex++}`); values.push(dueDate); }
    if (priority !== undefined) { fields.push(`priority = $${paramIndex++}`); values.push(priority); }
    if (status !== undefined) { 
      fields.push(`status = $${paramIndex++}`); values.push(status);
      if (status === 'done') {
        fields.push(`completed_at = now()`);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = now()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.tasks SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const fields = [`status = $1`, `updated_at = now()`];
    const values = [status];

    if (status === 'done') {
      fields.push(`completed_at = now()`);
    }

    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.tasks SET ${fields.join(', ')} 
       WHERE id = $2 AND org_id = $3
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
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
      'DELETE FROM public.tasks WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

const reorder = async (req, res, next) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Tasks array required' });
    }

    for (const task of tasks) {
      await db.query(
        'UPDATE public.tasks SET sort_order = $1, updated_at = now() WHERE id = $2 AND org_id = $3',
        [task.sortOrder, task.id, req.user.orgId]
      );
    }

    res.json({ message: 'Tasks reordered' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  updateStatus,
  remove,
  reorder,
};
