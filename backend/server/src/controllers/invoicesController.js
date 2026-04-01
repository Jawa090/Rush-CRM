const db = require('../config/database');

const getByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const result = await db.query(
      `SELECT pi.*, u.full_name as created_by_name
       FROM project_invoices pi
       LEFT JOIN users u ON pi.created_by = u.id
       WHERE pi.project_id = $1 AND pi.org_id = $2 
       ORDER BY pi.issue_date DESC, pi.created_at DESC`,
      [projectId, req.user.orgId]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { amount, currency, issue_date, due_date, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const result = await db.query(
      `INSERT INTO project_invoices (org_id, project_id, invoice_number, amount, currency, issue_date, due_date, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        req.user.orgId, 
        projectId, 
        invoiceNumber, 
        amount, 
        currency || 'USD', 
        issue_date || new Date().toISOString().split('T')[0], 
        due_date || null, 
        description || null, 
        req.user.id
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
    const { amount, currency, status, issue_date, due_date, paid_date, description } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (amount !== undefined) { fields.push(`amount = $${paramIndex++}`); values.push(amount); }
    if (currency !== undefined) { fields.push(`currency = $${paramIndex++}`); values.push(currency); }
    if (status !== undefined) { fields.push(`status = $${paramIndex++}`); values.push(status); }
    if (issue_date !== undefined) { fields.push(`issue_date = $${paramIndex++}`); values.push(issue_date); }
    if (due_date !== undefined) { fields.push(`due_date = $${paramIndex++}`); values.push(due_date); }
    if (paid_date !== undefined) { fields.push(`paid_date = $${paramIndex++}`); values.push(paid_date); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = now()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE project_invoices SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
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
      'DELETE FROM project_invoices WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    
    const result = await db.query(
      `SELECT 
        SUM(amount) as total_invoiced,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'draft' THEN amount ELSE 0 END) as draft_amount,
        SUM(CASE WHEN status = 'sent' THEN amount ELSE 0 END) as pending_amount,
        COUNT(*) as total_invoices
       FROM project_invoices 
       WHERE project_id = $1 AND org_id = $2`,
      [projectId, req.user.orgId]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getByProject,
  create,
  update,
  remove,
  getStats,
};