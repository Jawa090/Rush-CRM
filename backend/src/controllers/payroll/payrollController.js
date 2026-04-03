const db = require('../../config/database');

// ==================== SALARY SLIPS ====================
const getSalarySlips = async (req, res, next) => {
  try {
    const { month, year, employee_id } = req.query;

    let query = `
      SELECT 
        ss.*,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        e.employee_id as emp_code,
        e.department,
        e.position as designation
      FROM salary_slips ss
      JOIN employees e ON ss.employee_id = e.id
      WHERE ss.org_id = $1
    `;

    const params = [req.user.orgId];
    let paramIndex = 2;

    if (month) {
      query += ` AND ss.month = $${paramIndex}`;
      params.push(month);
      paramIndex++;
    }

    if (year) {
      query += ` AND ss.year = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }

    if (employee_id) {
      query += ` AND ss.employee_id = $${paramIndex}`;
      params.push(employee_id);
      paramIndex++;
    }

    query += ' ORDER BY ss.year DESC, ss.month DESC, ss.generated_at DESC';

    const result = await db.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
};

const getSalarySlipById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const slipResult = await db.query(
      `SELECT 
        ss.*,
        e.first_name,
        e.last_name,
        e.employee_id as emp_code,
        e.department,
        e.position as designation,
        e.email,
        e.phone
      FROM salary_slips ss
      JOIN employees e ON ss.employee_id = e.id
      WHERE ss.id = $1 AND ss.org_id = $2`,
      [id, req.user.orgId]
    );

    if (slipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Salary slip not found' });
    }

    const slip = slipResult.rows[0];

    // Get line items
    const itemsResult = await db.query(
      `SELECT * FROM salary_slip_items WHERE salary_slip_id = $1 ORDER BY component_type, component_name`,
      [id]
    );

    slip.items = itemsResult.rows;

    res.json({ data: slip });
  } catch (err) {
    next(err);
  }
};


const generateSalarySlip = async (req, res, next) => {
  try {
    const { employee_id, month, year, basic_salary, earnings, deductions } = req.body;

    // Check if slip already exists
    const existingSlip = await db.query(
      'SELECT id FROM salary_slips WHERE org_id = $1 AND employee_id = $2 AND month = $3 AND year = $4',
      [req.user.orgId, employee_id, month, year]
    );

    if (existingSlip.rows.length > 0) {
      return res.status(400).json({ error: 'Salary slip already exists for this month' });
    }

    // Calculate totals
    const totalEarnings = earnings.reduce((sum, item) => sum + parseFloat(item.amount), parseFloat(basic_salary));
    const totalDeductions = deductions.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const netSalary = totalEarnings - totalDeductions;

    // Start transaction
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create salary slip
      const slipResult = await client.query(
        `INSERT INTO salary_slips (
          org_id, employee_id, month, year, basic_salary,
          total_earnings, total_deductions, net_salary, status, generated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'generated', $9)
        RETURNING *`,
        [req.user.orgId, employee_id, month, year, basic_salary, totalEarnings, totalDeductions, netSalary, req.user.id]
      );

      const slipId = slipResult.rows[0].id;

      // Add basic salary as earning
      await client.query(
        `INSERT INTO salary_slip_items (salary_slip_id, component_name, component_type, amount)
         VALUES ($1, 'Basic Salary', 'earning', $2)`,
        [slipId, basic_salary]
      );

      // Add earnings
      for (const earning of earnings) {
        await client.query(
          `INSERT INTO salary_slip_items (salary_slip_id, component_name, component_type, amount)
           VALUES ($1, $2, 'earning', $3)`,
          [slipId, earning.name, earning.amount]
        );
      }

      // Add deductions
      for (const deduction of deductions) {
        await client.query(
          `INSERT INTO salary_slip_items (salary_slip_id, component_name, component_type, amount)
           VALUES ($1, $2, 'deduction', $3)`,
          [slipId, deduction.name, deduction.amount]
        );
      }

      await client.query('COMMIT');
      res.status(201).json({ data: slipResult.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

const deleteSalarySlip = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      await client.query('DELETE FROM salary_slip_items WHERE salary_slip_id = $1', [id]);
      await client.query('DELETE FROM salary_slips WHERE id = $1 AND org_id = $2', [id, req.user.orgId]);

      await client.query('COMMIT');
      res.json({ message: 'Salary slip deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSalarySlips,
  getSalarySlipById,
  generateSalarySlip,
  deleteSalarySlip,
};
