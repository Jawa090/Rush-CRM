const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get HRMS dashboard statistics
const getStats = async (req, res, next) => {
  try {
    const { period = 'today' } = req.query;
    let dateFilter = '';
    
    switch (period) {
      case 'today':
        dateFilter = "AND DATE(a.date) = CURRENT_DATE";
        break;
      case 'week':
        dateFilter = "AND a.date >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND a.date >= CURRENT_DATE - INTERVAL '30 days'";
        break;
    }

    // Get employee statistics
    const employeeStats = await db.query(`
      SELECT 
        COUNT(DISTINCT e.id) as total_employees,
        COUNT(DISTINCT CASE WHEN a.status = 'present' OR a.status = 'late' THEN e.id END) as present_today,
        COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN e.id END) as absent_today,
        COUNT(DISTINCT CASE WHEN a.status = 'late' THEN e.id END) as late_today,
        AVG(a.total_hours) as average_work_hours,
        SUM(a.total_hours) as total_hours_today
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.employee_id ${dateFilter}
      WHERE e.org_id = $1 AND e.status = 'active'
    `, [req.user.orgId]);

    // Get leave statistics
    const leaveStats = await db.query(`
      SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_leaves,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_leaves
      FROM leave_requests
      WHERE org_id = $1
    `, [req.user.orgId]);

    const stats = {
      totalEmployees: parseInt(employeeStats.rows[0].total_employees) || 0,
      presentToday: parseInt(employeeStats.rows[0].present_today) || 0,
      absentToday: parseInt(employeeStats.rows[0].absent_today) || 0,
      lateToday: parseInt(employeeStats.rows[0].late_today) || 0,
      pendingLeaves: parseInt(leaveStats.rows[0].pending_leaves) || 0,
      approvedLeaves: parseInt(leaveStats.rows[0].approved_leaves) || 0,
      totalHoursToday: parseFloat(employeeStats.rows[0].total_hours_today) || 0,
      averageWorkHours: parseFloat(employeeStats.rows[0].average_work_hours) || 0,
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
};

// Get recent HRMS activities
const getActivities = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const activities = await db.query(`
      SELECT 
        'clock_in' as type,
        COALESCE(e.name, e.first_name || ' ' || e.last_name, e.first_name, 'Unknown') as employee_name,
        'Clocked in at ' || TO_CHAR(a.clock_in, 'HH24:MI') as message,
        a.clock_in as timestamp,
        a.status
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.org_id = $1 AND a.clock_in IS NOT NULL
      AND a.clock_in >= CURRENT_DATE - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'clock_out' as type,
        COALESCE(e.name, e.first_name || ' ' || e.last_name, e.first_name, 'Unknown') as employee_name,
        'Clocked out at ' || TO_CHAR(a.clock_out, 'HH24:MI') as message,
        a.clock_out as timestamp,
        a.status
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.org_id = $1 AND a.clock_out IS NOT NULL
      AND a.clock_out >= CURRENT_DATE - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'leave_request' as type,
        COALESCE(e.name, e.first_name || ' ' || e.last_name, e.first_name, 'Unknown') as employee_name,
        'Requested ' || lt.name || ' from ' || TO_CHAR(lr.start_date, 'Mon DD') as message,
        lr.created_at as timestamp,
        lr.status
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      WHERE lr.org_id = $1
      AND lr.created_at >= CURRENT_DATE - INTERVAL '7 days'
      
      ORDER BY timestamp DESC
      LIMIT $2
    `, [req.user.orgId, limit]);

    res.json(activities.rows);
  } catch (err) {
    next(err);
  }
};

// Get attendance records
const getAttendance = async (req, res, next) => {
  try {
    const { date, search, employee_id, status } = req.query;
    let whereClause = 'WHERE a.org_id = $1';
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (date) {
      whereClause += ` AND DATE(a.date) = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (e.name ILIKE $${paramIndex} OR e.first_name ILIKE $${paramIndex} OR e.last_name ILIKE $${paramIndex} OR e.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (employee_id) {
      whereClause += ` AND a.employee_id = $${paramIndex}`;
      params.push(employee_id);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const query = `
      SELECT 
        a.*,
        COALESCE(e.name, e.first_name || ' ' || e.last_name, e.first_name, 'Unknown Employee') as employee_name,
        e.employee_id as emp_id,
        e.department,
        e.position
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      ${whereClause}
      ORDER BY a.date DESC, a.clock_in DESC
      LIMIT 100
    `;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Get today's attendance
const getTodayAttendance = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        a.*,
        COALESCE(e.name, e.first_name || ' ' || e.last_name, e.first_name, 'Unknown Employee') as employee_name,
        e.employee_id as emp_id,
        e.department,
        e.position
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.org_id = $1 AND DATE(a.date) = CURRENT_DATE
      ORDER BY a.clock_in DESC
    `;

    const result = await db.query(query, [req.user.orgId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Get current user's today attendance
const getMyTodayAttendance = async (req, res, next) => {
  try {
    // Get employee record
    const employeeResult = await db.query(
      'SELECT id FROM employees WHERE user_id = $1 AND org_id = $2',
      [req.user.id, req.user.orgId]
    );

    if (employeeResult.rows.length === 0) {
      return res.json(null);
    }

    const employeeId = employeeResult.rows[0].id;

    const query = `
      SELECT * FROM attendance 
      WHERE employee_id = $1 AND DATE(date) = CURRENT_DATE
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await db.query(query, [employeeId]);
    res.json(result.rows[0] || null);
  } catch (err) {
    next(err);
  }
};

// Clock in
const clockIn = async (req, res, next) => {
  try {
    const { notes, location } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Get or create employee record
    let employeeResult = await db.query(
      'SELECT id FROM employees WHERE user_id = $1 AND org_id = $2',
      [req.user.id, req.user.orgId]
    );

    let employeeId;
    if (employeeResult.rows.length === 0) {
      // Create employee record
      const userResult = await db.query(
        'SELECT email, full_name FROM users WHERE id = $1',
        [req.user.id]
      );
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = userResult.rows[0];
      const nameParts = (user.full_name || 'Employee').split(' ');
      
      const createEmployeeResult = await db.query(
        `INSERT INTO employees (
          org_id, user_id, first_name, last_name, email, status, hire_date, created_by, name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`,
        [
          req.user.orgId, 
          req.user.id, 
          nameParts[0] || 'Employee',
          nameParts.slice(1).join(' ') || '',
          user.email,
          'active',
          today,
          req.user.id,
          user.full_name || 'Employee'
        ]
      );
      
      employeeId = createEmployeeResult.rows[0].id;
    } else {
      employeeId = employeeResult.rows[0].id;
    }

    // Check if already clocked in today
    const existingRecord = await db.query(
      'SELECT id, clock_out FROM attendance WHERE employee_id = $1 AND DATE(date) = $2',
      [employeeId, today]
    );

    if (existingRecord.rows.length > 0 && !existingRecord.rows[0].clock_out) {
      return res.status(400).json({ error: 'Already clocked in today' });
    }

    // Determine status (late if after 9:30 AM)
    const clockInHour = now.getHours();
    const clockInMinute = now.getMinutes();
    const isLate = clockInHour > 9 || (clockInHour === 9 && clockInMinute > 30);
    const status = isLate ? 'late' : 'present';

    const result = await db.query(
      `INSERT INTO attendance (
        org_id, user_id, employee_id, date, clock_in, status, notes, 
        location_lat, location_lng, ip_address, device_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        req.user.orgId, 
        req.user.id, 
        employeeId, 
        today, 
        now, 
        status, 
        notes,
        location?.lat || null,
        location?.lng || null,
        req.ip,
        JSON.stringify({ userAgent: req.get('User-Agent') })
      ]
    );

    // Create notification
    await createHRMSNotification(
      req.user.orgId,
      req.user.id,
      employeeId,
      'clock_in',
      'Clocked In',
      `${req.user.full_name || req.user.email} clocked in at ${now.toLocaleTimeString()}`,
      { status, location }
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Clock out
const clockOut = async (req, res, next) => {
  try {
    const { notes, location } = req.body;
    const now = new Date();

    // Get employee record
    const employeeResult = await db.query(
      'SELECT id FROM employees WHERE user_id = $1 AND org_id = $2',
      [req.user.id, req.user.orgId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee record not found' });
    }

    const employeeId = employeeResult.rows[0].id;

    // Get today's attendance record
    const attendanceResult = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND DATE(date) = CURRENT_DATE AND clock_out IS NULL',
      [employeeId]
    );

    if (attendanceResult.rows.length === 0) {
      return res.status(400).json({ error: 'No active clock-in found for today' });
    }

    const attendance = attendanceResult.rows[0];
    const clockIn = new Date(attendance.clock_in);
    
    // Calculate total hours
    let totalHours = (now - clockIn) / (1000 * 60 * 60); // Convert to hours
    
    // Subtract break time if any
    if (attendance.break_start && attendance.break_end) {
      const breakStart = new Date(attendance.break_start);
      const breakEnd = new Date(attendance.break_end);
      const breakHours = (breakEnd - breakStart) / (1000 * 60 * 60);
      totalHours -= breakHours;
    }

    // Calculate overtime (over 8 hours)
    const overtimeHours = Math.max(0, totalHours - 8);

    const result = await db.query(
      `UPDATE attendance SET 
        clock_out = $1, 
        total_hours = $2, 
        overtime_hours = $3,
        notes = COALESCE(notes, '') || CASE WHEN notes IS NOT NULL THEN E'\n' ELSE '' END || $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *`,
      [now, totalHours.toFixed(2), overtimeHours.toFixed(2), notes || '', attendance.id]
    );

    // Create notification
    await createHRMSNotification(
      req.user.orgId,
      req.user.id,
      employeeId,
      'clock_out',
      'Clocked Out',
      `${req.user.full_name || req.user.email} clocked out at ${now.toLocaleTimeString()} (${totalHours.toFixed(1)}h worked)`,
      { totalHours: totalHours.toFixed(2), overtimeHours: overtimeHours.toFixed(2) }
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Start break
const startBreak = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const now = new Date();

    // Get employee record
    const employeeResult = await db.query(
      'SELECT id FROM employees WHERE user_id = $1 AND org_id = $2',
      [req.user.id, req.user.orgId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee record not found' });
    }

    const employeeId = employeeResult.rows[0].id;

    // Get today's attendance record
    const attendanceResult = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND DATE(date) = CURRENT_DATE AND clock_out IS NULL',
      [employeeId]
    );

    if (attendanceResult.rows.length === 0) {
      return res.status(400).json({ error: 'No active clock-in found for today' });
    }

    const attendance = attendanceResult.rows[0];

    if (attendance.break_start && !attendance.break_end) {
      return res.status(400).json({ error: 'Break already started' });
    }

    const result = await db.query(
      `UPDATE attendance SET 
        break_start = $1, 
        status = 'on_break',
        notes = COALESCE(notes, '') || CASE WHEN notes IS NOT NULL THEN E'\n' ELSE '' END || $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *`,
      [now, notes || 'Started break', attendance.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// End break
const endBreak = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const now = new Date();

    // Get employee record
    const employeeResult = await db.query(
      'SELECT id FROM employees WHERE user_id = $1 AND org_id = $2',
      [req.user.id, req.user.orgId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Employee record not found' });
    }

    const employeeId = employeeResult.rows[0].id;

    // Get today's attendance record
    const attendanceResult = await db.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND DATE(date) = CURRENT_DATE AND break_start IS NOT NULL AND break_end IS NULL',
      [employeeId]
    );

    if (attendanceResult.rows.length === 0) {
      return res.status(400).json({ error: 'No active break found' });
    }

    const attendance = attendanceResult.rows[0];

    const result = await db.query(
      `UPDATE attendance SET 
        break_end = $1, 
        status = 'present',
        notes = COALESCE(notes, '') || CASE WHEN notes IS NOT NULL THEN E'\n' ELSE '' END || $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *`,
      [now, notes || 'Ended break', attendance.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Helper function to create HRMS notifications
const createHRMSNotification = async (orgId, userId, employeeId, type, title, message, data = {}) => {
  try {
    const notificationId = uuidv4();
    await db.query(`
      INSERT INTO hrms_notifications (
        id, org_id, user_id, employee_id, notification_type, title, message, data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      notificationId,
      orgId,
      userId,
      employeeId,
      type,
      title,
      message,
      JSON.stringify(data)
    ]);
  } catch (err) {
    console.error('Error creating HRMS notification:', err);
  }
};

module.exports = {
  getStats,
  getActivities,
  getAttendance,
  getTodayAttendance,
  getMyTodayAttendance,
  clockIn,
  clockOut,
  startBreak,
  endBreak,
};