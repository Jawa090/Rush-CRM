const db = require('../config/database');
const Joi = require('joi');

const createLeaveSchema = Joi.object({
  leave_type_id: Joi.string().uuid().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  reason: Joi.string().optional().allow(''),
  days_requested: Joi.number().integer().min(1).optional(),
});

const updateLeaveSchema = Joi.object({
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  reason: Joi.string().optional().allow(''),
  status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
  rejection_reason: Joi.string().optional().allow(''),
}).min(1);

const createLeaveTypeSchema = Joi.object({
  name: Joi.string().required(),
  days_allowed: Joi.number().integer().min(0).required(),
});

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, employee_id, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        l.*,
        COALESCE(e.name, e.first_name || ' ' || e.last_name, u.full_name) as employee_name,
        lt.name as leave_type_name,
        lt.days_allowed
      FROM public.leave_requests l
      LEFT JOIN public.users u ON l.user_id = u.id
      LEFT JOIN public.employees e ON l.employee_id = e.id
      LEFT JOIN public.leave_types lt ON l.leave_type_id = lt.id
      WHERE l.org_id = $1
    `;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (status && status !== 'all') {
      query += ` AND l.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (employee_id) {
      query += ` AND (l.user_id = $${paramIndex} OR l.employee_id = $${paramIndex})`;
      params.push(employee_id);
      paramIndex++;
    }

    if (search) {
      query += ` AND (COALESCE(e.name, e.first_name || ' ' || e.last_name, u.full_name) ILIKE $${paramIndex} OR l.reason ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY l.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM public.leave_requests l WHERE l.org_id = $1`;
    const countParams = [req.user.orgId];
    let countParamIndex = 2;

    if (status && status !== 'all') {
      countQuery += ` AND l.status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (employee_id) {
      countQuery += ` AND (l.user_id = $${countParamIndex} OR l.employee_id = $${countParamIndex})`;
      countParams.push(employee_id);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (l.reason ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    const countResult = await db.query(countQuery, countParams);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT 
        l.*,
        COALESCE(e.name, e.first_name || ' ' || e.last_name, u.full_name) as employee_name,
        lt.name as leave_type_name,
        lt.days_allowed
      FROM public.leave_requests l
      LEFT JOIN public.users u ON l.user_id = u.id
      LEFT JOIN public.employees e ON l.employee_id = e.id
      LEFT JOIN public.leave_types lt ON l.leave_type_id = lt.id
      WHERE l.id = $1 AND l.org_id = $2`,
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { error, value } = createLeaveSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { leave_type_id, start_date, end_date, reason, days_requested } = value;

    // Calculate days requested if not provided
    let calculatedDays = days_requested;
    if (!calculatedDays) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      calculatedDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    }

    // Get employee record for current user
    const employeeResult = await db.query(
      'SELECT id FROM employees WHERE user_id = $1 AND org_id = $2',
      [req.user.id, req.user.orgId]
    );

    const result = await db.query(
      `INSERT INTO public.leave_requests (
        org_id, user_id, employee_id, leave_type_id, start_date, end_date, reason, days_requested, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        req.user.orgId, 
        req.user.id, 
        employeeResult.rows[0]?.id || null,
        leave_type_id, 
        start_date, 
        end_date, 
        reason, 
        calculatedDays,
        'pending'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateLeaveSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    // Handle each field update
    Object.entries(value).forEach(([key, val]) => {
      if (val !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(val);
      }
    });

    // Recalculate days if dates are being updated
    if (value.start_date || value.end_date) {
      const currentRecord = await db.query(
        'SELECT start_date, end_date FROM public.leave_requests WHERE id = $1 AND org_id = $2',
        [id, req.user.orgId]
      );

      if (currentRecord.rows.length > 0) {
        const startDate = new Date(value.start_date || currentRecord.rows[0].start_date);
        const endDate = new Date(value.end_date || currentRecord.rows[0].end_date);
        const daysRequested = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        fields.push(`days_requested = $${paramIndex++}`);
        values.push(daysRequested);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Add approval fields if status is being changed to approved/rejected
    if (value.status === 'approved' || value.status === 'rejected') {
      fields.push(`approved_by = $${paramIndex++}`);
      fields.push(`approved_at = NOW()`);
      values.push(req.user.id);
    }

    fields.push(`updated_at = NOW()`);
    
    // Add id and org_id for WHERE clause
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.leave_requests SET ${fields.join(', ')} 
       WHERE id = $${paramIndex++} AND org_id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
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
      'DELETE FROM public.leave_requests WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    res.json({ message: 'Leave request deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const getLeaveTypes = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT * FROM public.leave_types WHERE org_id = $1 ORDER BY name',
      [req.user.orgId]
    );

    res.json({
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
};

const createLeaveType = async (req, res, next) => {
  try {
    const { error, value } = createLeaveTypeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, days_allowed } = value;

    const result = await db.query(
      `INSERT INTO public.leave_types (org_id, name, days_allowed)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.orgId, name, days_allowed]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const getBalance = async (req, res, next) => {
  try {
    const { user_id } = req.query;
    const targetUserId = user_id || req.user.id;

    const result = await db.query(`
      SELECT 
        lt.*,
        COALESCE(SUM(CASE WHEN lr.status = 'approved' THEN lr.days_requested ELSE 0 END), 0) as days_used,
        (lt.days_allowed - COALESCE(SUM(CASE WHEN lr.status = 'approved' THEN lr.days_requested ELSE 0 END), 0)) as remaining_days
      FROM public.leave_types lt
      LEFT JOIN public.leave_requests lr ON lt.id = lr.leave_type_id 
        AND lr.org_id = $1
        AND lr.user_id = $2
        AND EXTRACT(YEAR FROM lr.start_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      WHERE lt.org_id = $1
      GROUP BY lt.id, lt.name, lt.days_allowed
      ORDER BY lt.name
    `, [req.user.orgId, targetUserId]);

    res.json({
      data: result.rows,
    });
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
  getLeaveTypes,
  createLeaveType,
  getBalance,
};