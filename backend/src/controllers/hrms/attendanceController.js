const db = require('../../config/database');
const Joi = require('joi');

const createAttendanceSchema = Joi.object({
  employee_id: Joi.string().uuid().required(),
  date: Joi.date().required(),
  clock_in: Joi.date().optional(),
  clock_out: Joi.date().optional(),
  status: Joi.string().valid('present', 'absent', 'late', 'leave').default('present'),
  notes: Joi.string().optional().allow(''),
});

const updateAttendanceSchema = Joi.object({
  clock_in: Joi.date().optional(),
  clock_out: Joi.date().optional(),
  status: Joi.string().valid('present', 'absent', 'late', 'leave').optional(),
  notes: Joi.string().optional().allow(''),
}).min(1);

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, date, employee_id, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        a.*,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        e.employee_id as emp_id
      FROM public.attendance a
      LEFT JOIN public.employees e ON a.employee_id = e.id
      WHERE a.org_id = $1
    `;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (date) {
      query += ` AND DATE(a.date) = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    }

    if (employee_id) {
      query += ` AND a.employee_id = $${paramIndex}`;
      params.push(employee_id);
      paramIndex++;
    }

    if (status && status !== 'all') {
      query += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY a.date DESC, a.clock_in DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM public.attendance WHERE org_id = $1`;
    const countParams = [req.user.orgId];
    let countParamIndex = 2;

    if (date) {
      countQuery += ` AND DATE(date) = $${countParamIndex}`;
      countParams.push(date);
      countParamIndex++;
    }

    if (employee_id) {
      countQuery += ` AND employee_id = $${countParamIndex}`;
      countParams.push(employee_id);
      countParamIndex++;
    }

    if (status && status !== 'all') {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
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
        a.*,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        e.employee_id as emp_id
      FROM public.attendance a
      LEFT JOIN public.employees e ON a.employee_id = e.id
      WHERE a.id = $1 AND a.org_id = $2`,
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { error, value } = createAttendanceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { employee_id, date, clock_in, clock_out, status, notes } = value;

    // Check if attendance record already exists for this employee and date
    const existingRecord = await db.query(
      'SELECT id FROM public.attendance WHERE employee_id = $1 AND DATE(date) = DATE($2) AND org_id = $3',
      [employee_id, date, req.user.orgId]
    );

    if (existingRecord.rows.length > 0) {
      return res.status(400).json({ error: 'Attendance record already exists for this date' });
    }

    const result = await db.query(
      `INSERT INTO public.attendance (
        org_id, user_id, employee_id, date, clock_in, clock_out, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [req.user.orgId, req.user.id, employee_id, date, clock_in, clock_out, status, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateAttendanceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(value).forEach(([key, val]) => {
      fields.push(`${key} = $${paramIndex++}`);
      values.push(val);
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.attendance SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
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
      'DELETE FROM public.attendance WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const clockIn = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Get current user's employee record or create one if it doesn't exist
    let employeeResult = await db.query(
      'SELECT id FROM public.employees WHERE user_id = $1 AND org_id = $2',
      [req.user.id, req.user.orgId]
    );

    let employeeId;
    if (employeeResult.rows.length === 0) {
      // Create a basic employee record for the user
      const userResult = await db.query(
        'SELECT email, full_name FROM public.users WHERE id = $1',
        [req.user.id]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = userResult.rows[0];
      const nameParts = (user.full_name || 'Employee').split(' ');
      const firstName = nameParts[0] || 'Employee';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const createEmployeeResult = await db.query(
        `INSERT INTO public.employees (
          org_id, user_id, first_name, last_name, email, status, hire_date, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [
          req.user.orgId, 
          req.user.id, 
          firstName,
          lastName,
          user.email,
          'active',
          today,
          req.user.id
        ]
      );
      
      employeeId = createEmployeeResult.rows[0].id;
    } else {
      employeeId = employeeResult.rows[0].id;
    }

    // Check if already clocked in today
    const existingRecord = await db.query(
      'SELECT id, clock_out FROM public.attendance WHERE employee_id = $1 AND DATE(date) = $2 AND org_id = $3',
      [employeeId, today, req.user.orgId]
    );

    if (existingRecord.rows.length > 0 && !existingRecord.rows[0].clock_out) {
      return res.status(400).json({ error: 'Already clocked in today' });
    }

    // Determine status based on time (late if after 9 AM)
    const clockInHour = now.getHours();
    const status = clockInHour >= 9 ? 'late' : 'present';

    const result = await db.query(
      `INSERT INTO public.attendance (
        org_id, user_id, employee_id, date, clock_in, status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [req.user.orgId, req.user.id, employeeId, today, now, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const clockOut = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Get current user's employee record
    const employeeResult = await db.query(
      'SELECT id FROM public.employees WHERE user_id = $1 AND org_id = $2',
      [req.user.id, req.user.orgId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee record not found' });
    }

    const employeeId = employeeResult.rows[0].id;

    // Find today's attendance record
    const attendanceResult = await db.query(
      'SELECT id, clock_in, clock_out FROM public.attendance WHERE employee_id = $1 AND DATE(date) = $2 AND org_id = $3',
      [employeeId, today, req.user.orgId]
    );

    if (attendanceResult.rows.length === 0) {
      return res.status(404).json({ error: 'No clock-in record found for today' });
    }

    const record = attendanceResult.rows[0];
    if (record.clock_out) {
      return res.status(400).json({ error: 'Already clocked out today' });
    }

    const result = await db.query(
      'UPDATE public.attendance SET clock_out = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [now, record.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;

    const result = await db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'present') as present,
        COUNT(*) FILTER (WHERE status = 'late') as late,
        COUNT(*) FILTER (WHERE status = 'absent') as absent,
        COUNT(*) FILTER (WHERE status = 'leave') as on_leave
      FROM public.attendance 
      WHERE org_id = $1 AND DATE(date) = $2`,
      [req.user.orgId, date]
    );

    res.json(result.rows[0]);
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
  clockIn,
  clockOut,
  getStats,
};
