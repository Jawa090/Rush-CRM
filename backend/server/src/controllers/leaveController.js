const db = require('../config/database');
const Joi = require('joi');

// ==================== LEAVE TYPES ====================

const getLeaveTypes = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM leave_types 
       WHERE org_id = $1 AND is_active = true
       ORDER BY name`,
      [req.user.orgId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
};

const createLeaveType = async (req, res, next) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      code: Joi.string().required(),
      description: Joi.string().allow(''),
      color: Joi.string().default('#3B82F6'),
      days_allowed: Joi.number().required(),
      max_consecutive_days: Joi.number().optional(),
      min_days_notice: Joi.number().default(0),
      is_paid: Joi.boolean().default(true),
      requires_approval: Joi.boolean().default(true),
      can_carry_forward: Joi.boolean().default(false),
      max_carry_forward_days: Joi.number().default(0),
      expires_after_months: Joi.number().optional(),
      applicable_to: Joi.string().valid('all', 'male', 'female').default('all'),
      min_service_months: Joi.number().default(0),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await db.query(
      `INSERT INTO leave_types (
        org_id, name, code, description, color, days_allowed,
        max_consecutive_days, min_days_notice, is_paid, requires_approval,
        can_carry_forward, max_carry_forward_days, expires_after_months,
        applicable_to, min_service_months
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        req.user.orgId, value.name, value.code, value.description, value.color,
        value.days_allowed, value.max_consecutive_days, value.min_days_notice,
        value.is_paid, value.requires_approval, value.can_carry_forward,
        value.max_carry_forward_days, value.expires_after_months,
        value.applicable_to, value.min_service_months
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Leave type code already exists' });
    }
    next(err);
  }
};

const updateLeaveType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [req.user.orgId, id];
    let paramIndex = 3;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push('updated_at = NOW()');

    const result = await db.query(
      `UPDATE leave_types SET ${fields.join(', ')}
       WHERE org_id = $1 AND id = $2
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leave type not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// ==================== LEAVE BALANCES ====================

const getEmployeeBalance = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = req.query.year || new Date().getFullYear();

    const result = await db.query(
      `SELECT 
        lb.id,
        lb.employee_id,
        lb.leave_type_id,
        lb.org_id,
        lb.year,
        lb.total_allocated,
        lb.used,
        lb.pending,
        lb.available,
        lb.carried_forward,
        lt.name as leave_type_name,
        lt.code as leave_type_code,
        lt.color as leave_type_color,
        lt.can_carry_forward
      FROM employee_leave_balances lb
      JOIN leave_types lt ON lb.leave_type_id = lt.id
      WHERE lb.employee_id = $1 AND lb.org_id = $2 AND lb.year = $3
      ORDER BY lt.name`,
      [employeeId, req.user.orgId, year]
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
};

const getMyBalance = async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    // Get current user's employee record
    const empResult = await db.query(
      'SELECT id FROM employees WHERE email = $1 AND org_id = $2',
      [req.user.email, req.user.orgId]
    );

    if (empResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee record not found' });
    }

    const employeeId = empResult.rows[0].id;

    const result = await db.query(
      `SELECT 
        lb.id,
        lb.employee_id,
        lb.leave_type_id,
        lb.org_id,
        lb.year,
        lb.total_allocated,
        lb.used,
        lb.pending,
        lb.available,
        lb.carried_forward,
        lt.name as leave_type_name,
        lt.code as leave_type_code,
        lt.color as leave_type_color,
        lt.can_carry_forward
      FROM employee_leave_balances lb
      JOIN leave_types lt ON lb.leave_type_id = lt.id
      WHERE lb.employee_id = $1 AND lb.org_id = $2 AND lb.year = $3
      ORDER BY lt.name`,
      [employeeId, req.user.orgId, year]
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
};

const initializeEmployeeBalance = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const year = req.body.year || new Date().getFullYear();

    // Get all active leave types
    const leaveTypes = await db.query(
      'SELECT * FROM leave_types WHERE org_id = $1 AND is_active = true',
      [req.user.orgId]
    );

    // Create balance entries for each leave type
    const insertPromises = leaveTypes.rows.map(lt => 
      db.query(
        `INSERT INTO employee_leave_balances (
          employee_id, leave_type_id, org_id, year, total_allocated
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING
        RETURNING *`,
        [employeeId, lt.id, req.user.orgId, year, lt.days_allowed]
      )
    );

    await Promise.all(insertPromises);

    // Return updated balances
    const result = await db.query(
      `SELECT 
        lb.*,
        lt.name as leave_type_name,
        lt.code as leave_type_code
      FROM employee_leave_balances lb
      JOIN leave_types lt ON lb.leave_type_id = lt.id
      WHERE lb.employee_id = $1 AND lb.org_id = $2 AND lb.year = $3`,
      [employeeId, req.user.orgId, year]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// ==================== LEAVE REQUESTS ====================

const getLeaveRequests = async (req, res, next) => {
  try {
    const { status, employeeId, startDate, endDate } = req.query;

    // If no employeeId provided, get current user's employee ID
    let targetEmployeeId = employeeId;
    if (!targetEmployeeId) {
      const empResult = await db.query(
        'SELECT id FROM employees WHERE email = $1 AND org_id = $2',
        [req.user.email, req.user.orgId]
      );
      if (empResult.rows.length > 0) {
        targetEmployeeId = empResult.rows[0].id;
      }
    }

    let query = `
      SELECT 
        lr.*,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        e.department,
        lt.name as leave_type_name,
        lt.code as leave_type_code,
        lt.color as leave_type_color,
        u.full_name as approver_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      LEFT JOIN users u ON lr.approver_id = u.id
      WHERE lr.org_id = $1
    `;

    const params = [req.user.orgId];
    let paramIndex = 2;

    if (status && status !== 'all') {
      query += ` AND lr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (targetEmployeeId) {
      query += ` AND lr.employee_id = $${paramIndex}`;
      params.push(targetEmployeeId);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND lr.end_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND lr.start_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ' ORDER BY lr.created_at DESC';

    const result = await db.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
};

const createLeaveRequest = async (req, res, next) => {
  try {
    const schema = Joi.object({
      leave_type_id: Joi.string().uuid().required(),
      start_date: Joi.date().required(),
      end_date: Joi.date().required(),
      days_requested: Joi.number().required(),
      half_day: Joi.boolean().default(false),
      reason: Joi.string().required(),
      emergency: Joi.boolean().default(false),
      contact_during_leave: Joi.string().allow(''),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Get current user's employee record
    const empResult = await db.query(
      'SELECT id FROM employees WHERE email = $1 AND org_id = $2',
      [req.user.email, req.user.orgId]
    );

    if (empResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee record not found' });
    }

    const employeeId = empResult.rows[0].id;

    // Check if employee has sufficient balance
    const year = new Date(value.start_date).getFullYear();
    const balance = await db.query(
      `SELECT * FROM employee_leave_balances
       WHERE employee_id = $1 AND leave_type_id = $2 AND year = $3`,
      [employeeId, value.leave_type_id, year]
    );

    if (balance.rows.length === 0) {
      return res.status(400).json({ error: 'Leave balance not initialized for this year' });
    }

    const available = parseFloat(balance.rows[0].available);
    if (available < value.days_requested) {
      return res.status(400).json({ 
        error: `Insufficient leave balance. Available: ${available} days, Requested: ${value.days_requested} days` 
      });
    }

    // Create leave request
    const result = await db.query(
      `INSERT INTO leave_requests (
        employee_id, leave_type_id, org_id, start_date, end_date,
        days_requested, half_day, reason, emergency, contact_during_leave, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
      RETURNING *`,
      [
        employeeId, value.leave_type_id, req.user.orgId,
        value.start_date, value.end_date, value.days_requested,
        value.half_day, value.reason, value.emergency, value.contact_during_leave
      ]
    );

    // Update pending balance
    await db.query(
      `UPDATE employee_leave_balances
       SET pending = pending + $1, updated_at = NOW()
       WHERE employee_id = $2 AND leave_type_id = $3 AND year = $4`,
      [value.days_requested, employeeId, value.leave_type_id, year]
    );

    // Add comment
    await db.query(
      `INSERT INTO leave_request_comments (leave_request_id, user_id, comment, action)
       VALUES ($1, $2, $3, 'submitted')`,
      [result.rows[0].id, req.user.id, 'Leave request submitted']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const updateLeaveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get leave request
    const leaveReq = await db.query(
      'SELECT * FROM leave_requests WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );

    if (leaveReq.rows.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const leave = leaveReq.rows[0];
    const year = new Date(leave.start_date).getFullYear();

    // Update leave request
    const result = await db.query(
      `UPDATE leave_requests
       SET status = $1, approver_id = $2, approved_at = NOW(),
           rejection_reason = $3, updated_at = NOW()
       WHERE id = $4 AND org_id = $5
       RETURNING *`,
      [status, req.user.id, rejection_reason, id, req.user.orgId]
    );

    // Update balance based on status
    if (status === 'approved') {
      await db.query(
        `UPDATE employee_leave_balances
         SET pending = pending - $1, used = used + $1, updated_at = NOW()
         WHERE employee_id = $2 AND leave_type_id = $3 AND year = $4`,
        [leave.days_requested, leave.employee_id, leave.leave_type_id, year]
      );
    } else if (status === 'rejected' || status === 'cancelled') {
      await db.query(
        `UPDATE employee_leave_balances
         SET pending = pending - $1, updated_at = NOW()
         WHERE employee_id = $2 AND leave_type_id = $3 AND year = $4`,
        [leave.days_requested, leave.employee_id, leave.leave_type_id, year]
      );
    }

    // Add comment
    const comment = status === 'rejected' 
      ? `Leave request rejected${rejection_reason ? ': ' + rejection_reason : ''}`
      : `Leave request ${status}`;
    
    await db.query(
      `INSERT INTO leave_request_comments (leave_request_id, user_id, comment, action)
       VALUES ($1, $2, $3, $4)`,
      [id, req.user.id, comment, status]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// ==================== ANALYTICS ====================

const getLeaveAnalytics = async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    // Overall stats
    const stats = await db.query(
      `SELECT 
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COALESCE(SUM(days_requested) FILTER (WHERE status = 'approved'), 0) as total_days_taken
      FROM leave_requests
      WHERE org_id = $1 AND EXTRACT(YEAR FROM start_date) = $2`,
      [req.user.orgId, year]
    );

    // By leave type
    const byType = await db.query(
      `SELECT 
        lt.name,
        lt.color,
        COUNT(lr.id) as request_count,
        COALESCE(SUM(lr.days_requested) FILTER (WHERE lr.status = 'approved'), 0) as days_taken
      FROM leave_types lt
      LEFT JOIN leave_requests lr ON lt.id = lr.leave_type_id 
        AND lr.org_id = $1 
        AND EXTRACT(YEAR FROM lr.start_date) = $2
      WHERE lt.org_id = $1
      GROUP BY lt.id, lt.name, lt.color
      ORDER BY days_taken DESC NULLS LAST`,
      [req.user.orgId, year]
    );

    // By month
    const byMonth = await db.query(
      `SELECT 
        TO_CHAR(start_date, 'Mon') as month,
        EXTRACT(MONTH FROM start_date) as month_num,
        COUNT(*) as request_count,
        COALESCE(SUM(days_requested) FILTER (WHERE status = 'approved'), 0) as days_taken
      FROM leave_requests
      WHERE org_id = $1 AND EXTRACT(YEAR FROM start_date) = $2
      GROUP BY month, month_num
      ORDER BY month_num`,
      [req.user.orgId, year]
    );

    // Top employees by leave taken
    const topEmployees = await db.query(
      `SELECT 
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        e.department,
        COUNT(lr.id) as request_count,
        COALESCE(SUM(lr.days_requested) FILTER (WHERE lr.status = 'approved'), 0) as days_taken
      FROM employees e
      LEFT JOIN leave_requests lr ON e.id = lr.employee_id 
        AND lr.org_id = $1 
        AND EXTRACT(YEAR FROM lr.start_date) = $2
      WHERE e.org_id = $1
      GROUP BY e.id, e.first_name, e.last_name, e.department
      HAVING SUM(lr.days_requested) FILTER (WHERE lr.status = 'approved') > 0
      ORDER BY days_taken DESC
      LIMIT 10`,
      [req.user.orgId, year]
    );

    res.json({
      data: {
        stats: stats.rows[0],
        byType: byType.rows,
        byMonth: byMonth.rows,
        topEmployees: topEmployees.rows,
      }
    });
  } catch (err) {
    next(err);
  }
};

// ==================== CALENDAR ====================

const getLeaveCalendar = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate required' });
    }

    const result = await db.query(
      `SELECT 
        lr.id,
        lr.start_date,
        lr.end_date,
        lr.days_requested,
        lr.status,
        lr.half_day,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        e.department,
        lt.name as leave_type_name,
        lt.color as leave_type_color
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      WHERE lr.org_id = $1 
        AND lr.status = 'approved'
        AND lr.start_date <= $3
        AND lr.end_date >= $2
      ORDER BY lr.start_date`,
      [req.user.orgId, startDate, endDate]
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
};

// ==================== PUBLIC HOLIDAYS ====================

const getPublicHolidays = async (req, res, next) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    const result = await db.query(
      `SELECT * FROM public_holidays
       WHERE org_id = $1 AND EXTRACT(YEAR FROM date) = $2
       ORDER BY date`,
      [req.user.orgId, year]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const createPublicHoliday = async (req, res, next) => {
  try {
    const { name, date, is_optional, description } = req.body;

    const result = await db.query(
      `INSERT INTO public_holidays (org_id, name, date, is_optional, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.orgId, name, date, is_optional || false, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Holiday already exists for this date' });
    }
    next(err);
  }
};

module.exports = {
  // Leave Types
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  
  // Balances
  getEmployeeBalance,
  getMyBalance,
  initializeEmployeeBalance,
  
  // Requests
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  
  // Analytics
  getLeaveAnalytics,
  
  // Calendar
  getLeaveCalendar,
  
  // Holidays
  getPublicHolidays,
  createPublicHoliday,
};
