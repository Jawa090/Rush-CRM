const db = require('../../config/database');
const Joi = require('joi');

const createEmployeeSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional().allow(''),
  department: Joi.string().optional().allow(''),
  position: Joi.string().optional().allow(''),
  job_title: Joi.string().optional().allow(''),
  status: Joi.string().valid('active', 'on_leave', 'remote', 'inactive').default('active'),
  hire_date: Joi.date().optional(),
  salary: Joi.number().optional(),
  employee_id: Joi.string().optional().allow(''),
  manager_id: Joi.string().uuid().optional().allow(null),
  address: Joi.string().optional().allow(''),
  
  // New comprehensive fields
  cnic: Joi.string().optional().allow(''),
  cnic_picture: Joi.string().optional().allow(''),
  profile_picture: Joi.string().optional().allow(''),
  date_of_birth: Joi.date().optional(),
  secondary_phone: Joi.string().optional().allow(''),
  official_email: Joi.string().email().optional().allow(''),
  personal_email: Joi.string().email().optional().allow(''),
  religion: Joi.string().optional().allow(''),
  probation_status: Joi.string().valid('on_probation', 'completed', 'extended').optional(),
  probation_end_date: Joi.date().optional(),
  commission_rate: Joi.number().min(0).max(100).optional(),
  base_salary: Joi.number().optional(),
  emergency_contact_name: Joi.string().optional().allow(''),
  emergency_contact_phone: Joi.string().optional().allow(''),
  emergency_contact_relation: Joi.string().optional().allow(''),
  blood_group: Joi.string().optional().allow(''),
  marital_status: Joi.string().optional().allow(''),
  gender: Joi.string().optional().allow(''),
  nationality: Joi.string().optional().allow(''),
  permanent_address: Joi.string().optional().allow(''),
  current_address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  postal_code: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  bank_name: Joi.string().optional().allow(''),
  bank_account_number: Joi.string().optional().allow(''),
  bank_account_title: Joi.string().optional().allow(''),
  tax_id: Joi.string().optional().allow(''),
  education_level: Joi.string().optional().allow(''),
  university: Joi.string().optional().allow(''),
  degree: Joi.string().optional().allow(''),
  graduation_year: Joi.number().optional(),
  previous_company: Joi.string().optional().allow(''),
  previous_position: Joi.string().optional().allow(''),
  years_of_experience: Joi.number().optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  certifications: Joi.array().items(Joi.string()).optional(),
  languages: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().optional().allow(''),
});

const updateEmployeeSchema = Joi.object({
  first_name: Joi.string().optional(),
  last_name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional().allow(''),
  department: Joi.string().optional().allow(''),
  position: Joi.string().optional().allow(''),
  job_title: Joi.string().optional().allow(''),
  status: Joi.string().valid('active', 'on_leave', 'remote', 'inactive').optional(),
  hire_date: Joi.date().optional(),
  salary: Joi.number().optional(),
  employee_id: Joi.string().optional().allow(''),
  manager_id: Joi.string().uuid().optional().allow(null),
  address: Joi.string().optional().allow(''),
  
  // New comprehensive fields
  cnic: Joi.string().optional().allow(''),
  cnic_picture: Joi.string().optional().allow(''),
  profile_picture: Joi.string().optional().allow(''),
  date_of_birth: Joi.date().optional(),
  secondary_phone: Joi.string().optional().allow(''),
  official_email: Joi.string().email().optional().allow(''),
  personal_email: Joi.string().email().optional().allow(''),
  religion: Joi.string().optional().allow(''),
  probation_status: Joi.string().valid('on_probation', 'completed', 'extended').optional(),
  probation_end_date: Joi.date().optional(),
  commission_rate: Joi.number().min(0).max(100).optional(),
  base_salary: Joi.number().optional(),
  emergency_contact_name: Joi.string().optional().allow(''),
  emergency_contact_phone: Joi.string().optional().allow(''),
  emergency_contact_relation: Joi.string().optional().allow(''),
  blood_group: Joi.string().optional().allow(''),
  marital_status: Joi.string().optional().allow(''),
  gender: Joi.string().optional().allow(''),
  nationality: Joi.string().optional().allow(''),
  permanent_address: Joi.string().optional().allow(''),
  current_address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  postal_code: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  bank_name: Joi.string().optional().allow(''),
  bank_account_number: Joi.string().optional().allow(''),
  bank_account_title: Joi.string().optional().allow(''),
  tax_id: Joi.string().optional().allow(''),
  education_level: Joi.string().optional().allow(''),
  university: Joi.string().optional().allow(''),
  degree: Joi.string().optional().allow(''),
  graduation_year: Joi.number().optional(),
  previous_company: Joi.string().optional().allow(''),
  previous_position: Joi.string().optional().allow(''),
  years_of_experience: Joi.number().optional(),
  skills: Joi.array().items(Joi.string()).optional(),
  certifications: Joi.array().items(Joi.string()).optional(),
  languages: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().optional().allow(''),
  is_active: Joi.boolean().optional(),
  termination_date: Joi.date().optional(),
  termination_reason: Joi.string().optional().allow(''),
}).min(1);

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, department, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        e.*,
        CONCAT(e.first_name, ' ', e.last_name) as name,
        CONCAT(m.first_name, ' ', m.last_name) as manager_name
      FROM public.employees e
      LEFT JOIN public.employees m ON e.manager_id = m.id
      WHERE e.org_id = $1
    `;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (search) {
      query += ` AND (CONCAT(e.first_name, ' ', e.last_name) ILIKE $${paramIndex} OR e.email ILIKE $${paramIndex} OR e.department ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (department && department !== 'all') {
      query += ` AND e.department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    if (status && status !== 'all') {
      query += ` AND e.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY e.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM public.employees WHERE org_id = $1`;
    const countParams = [req.user.orgId];
    let countParamIndex = 2;

    if (search) {
      countQuery += ` AND (CONCAT(first_name, ' ', last_name) ILIKE $${countParamIndex} OR email ILIKE $${countParamIndex} OR department ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (department && department !== 'all') {
      countQuery += ` AND department = $${countParamIndex}`;
      countParams.push(department);
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
        e.*,
        CONCAT(e.first_name, ' ', e.last_name) as name,
        CONCAT(m.first_name, ' ', m.last_name) as manager_name
      FROM public.employees e
      LEFT JOIN public.employees m ON e.manager_id = m.id
      WHERE e.id = $1 AND e.org_id = $2`,
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { error, value } = createEmployeeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if email already exists
    const existingEmployee = await db.query(
      'SELECT id FROM public.employees WHERE email = $1 AND org_id = $2',
      [value.email, req.user.orgId]
    );

    if (existingEmployee.rows.length > 0) {
      return res.status(400).json({ error: 'Employee with this email already exists' });
    }

    // Build dynamic INSERT query
    const fields = ['org_id', 'created_by'];
    const values = [req.user.orgId, req.user.id];
    let paramIndex = 3;

    Object.entries(value).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        fields.push(key);
        values.push(val);
        paramIndex++;
      }
    });

    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await db.query(
      `INSERT INTO public.employees (${fields.join(', ')})
       VALUES (${placeholders})
       RETURNING *, CONCAT(first_name, ' ', last_name) as name`,
      values
    );

    const newEmployee = result.rows[0];

    // Initialize leave balances for the new employee
    try {
      const currentYear = new Date().getFullYear();
      
      // Get all active leave types for this organization
      const leaveTypes = await db.query(
        'SELECT id, days_allowed FROM leave_types WHERE org_id = $1 AND is_active = true',
        [req.user.orgId]
      );

      // Create balance entries for each leave type
      if (leaveTypes.rows.length > 0) {
        const balanceInserts = leaveTypes.rows.map(lt => 
          db.query(
            `INSERT INTO employee_leave_balances (
              employee_id, leave_type_id, org_id, year, 
              total_allocated, used, pending, available
            ) VALUES ($1, $2, $3, $4, $5, 0, 0, $5)
            ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING`,
            [newEmployee.id, lt.id, req.user.orgId, currentYear, lt.days_allowed]
          )
        );
        
        await Promise.all(balanceInserts);
        console.log(`✅ Initialized ${leaveTypes.rows.length} leave balances for employee ${newEmployee.id}`);
      }
    } catch (balanceError) {
      console.error('⚠️ Failed to initialize leave balances:', balanceError);
      // Don't fail employee creation if balance initialization fails
    }

    res.status(201).json(newEmployee);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateEmployeeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if email already exists (if email is being updated)
    if (value.email) {
      const existingEmployee = await db.query(
        'SELECT id FROM public.employees WHERE email = $1 AND org_id = $2 AND id != $3',
        [value.email, req.user.orgId, id]
      );

      if (existingEmployee.rows.length > 0) {
        return res.status(400).json({ error: 'Employee with this email already exists' });
      }
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
    
    // Add id and org_id for WHERE clause
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.employees SET ${fields.join(', ')} 
       WHERE id = $${paramIndex++} AND org_id = $${paramIndex}
       RETURNING *, CONCAT(first_name, ' ', last_name) as name`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if employee exists
    const employeeCheck = await db.query(
      'SELECT id, first_name, last_name FROM public.employees WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );

    if (employeeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check for related records that would prevent deletion
    const attendanceCount = await db.query(
      'SELECT COUNT(*) FROM attendance WHERE employee_id = $1',
      [id]
    );

    const leaveCount = await db.query(
      'SELECT COUNT(*) FROM leave_requests WHERE employee_id = $1',
      [id]
    );

    if (parseInt(attendanceCount.rows[0].count) > 0 || parseInt(leaveCount.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete employee with existing attendance or leave records. Please archive the employee instead.' 
      });
    }

    // If no related records, proceed with deletion
    const result = await db.query(
      'DELETE FROM public.employees WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    // Handle foreign key constraint errors
    if (err.code === '23503') {
      return res.status(400).json({ 
        error: 'Cannot delete employee due to existing related records. Please archive the employee instead.' 
      });
    }
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'on_leave') as on_leave,
        COUNT(*) FILTER (WHERE status = 'remote') as remote,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive
      FROM public.employees 
      WHERE org_id = $1`,
      [req.user.orgId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const getDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;

    // First verify employee belongs to org
    const empCheck = await db.query(
      'SELECT id FROM public.employees WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );

    if (empCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Fetch documents - simple query without JOIN since we simplified the table
    const result = await db.query(
      `SELECT * FROM employee_documents
       WHERE employee_id = $1 AND org_id = $2
       ORDER BY uploaded_at DESC`,
      [id, req.user.orgId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const uploadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { document_type, document_name, notes } = req.body;

    // Verify employee belongs to org
    const empCheck = await db.query(
      'SELECT id FROM public.employees WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );

    if (empCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const filePath = `/uploads/employees/${file.filename}`;

    // Insert document record
    const result = await db.query(
      `INSERT INTO employee_documents (
        employee_id, org_id, document_type, document_name, 
        file_path, file_size, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        id,
        req.user.orgId,
        document_type || 'other',
        document_name || file.originalname,
        filePath,
        file.size,
        req.user.id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id, docId } = req.params;

    // Verify document belongs to employee and org
    const result = await db.query(
      `DELETE FROM employee_documents 
       WHERE id = $1 AND employee_id = $2 AND org_id = $3
       RETURNING file_path`,
      [docId, id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // TODO: Delete physical file from disk
    // const fs = require('fs');
    // const path = require('path');
    // fs.unlinkSync(path.join(__dirname, '../../', result.rows[0].file_path));

    res.json({ message: 'Document deleted successfully' });
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
  getStats,
  getDocuments,
  uploadDocument,
  deleteDocument,
};
