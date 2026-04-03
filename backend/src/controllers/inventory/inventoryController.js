const db = require('../../config/database');

// ==================== DASHBOARD STATS ====================
const getDashboardStats = async (req, res, next) => {
  try {
    const orgId = req.user.orgId;

    // Total products
    const productsResult = await db.query(
      `SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE status = 'active') as active_products
      FROM products WHERE org_id = $1`,
      [orgId]
    );

    // Stock value - just count total stock for now
    const stockValueResult = await db.query(
      `SELECT 
        COALESCE(SUM(s.quantity), 0) as total_stock_value
      FROM stock s
      WHERE s.org_id = $1`,
      [orgId]
    );

    // Low stock products - simplified without reorder_level
    const lowStockResult = await db.query(
      `SELECT COUNT(*) as low_stock_products
      FROM (
        SELECT p.id, SUM(s.quantity) as total_stock
        FROM products p
        LEFT JOIN stock s ON p.id = s.product_id
        WHERE p.org_id = $1 AND p.status = 'active'
        GROUP BY p.id
        HAVING SUM(s.quantity) <= 10
      ) as low_stock`,
      [orgId]
    );

    // Warehouses and vendors
    const warehousesResult = await db.query(
      'SELECT COUNT(*) as total_warehouses FROM warehouses WHERE org_id = $1',
      [orgId]
    );

    const vendorsResult = await db.query(
      'SELECT COUNT(*) as total_vendors FROM vendors WHERE org_id = $1',
      [orgId]
    );

    // Purchase orders stats
    const poStatsResult = await db.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_pos,
        COUNT(*) FILTER (WHERE status = 'approved') as in_transit_pos,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_pos
      FROM purchase_orders WHERE org_id = $1`,
      [orgId]
    );

    // Employee assignments
    const assignmentsResult = await db.query(
      `SELECT COUNT(*) as assigned_to_employees
      FROM employee_product_assignments
      WHERE org_id = $1 AND status = 'assigned'`,
      [orgId]
    );

    res.json({
      data: {
        totalProducts: parseInt(productsResult.rows[0].total_products),
        activeProducts: parseInt(productsResult.rows[0].active_products),
        totalStockValue: parseFloat(stockValueResult.rows[0].total_stock_value),
        stockValueChange: 0, // TODO: Calculate vs last month
        lowStockProducts: parseInt(lowStockResult.rows[0].low_stock_products),
        totalWarehouses: parseInt(warehousesResult.rows[0].total_warehouses),
        totalVendors: parseInt(vendorsResult.rows[0].total_vendors),
        pendingPOs: parseInt(poStatsResult.rows[0].pending_pos),
        inTransitPOs: parseInt(poStatsResult.rows[0].in_transit_pos),
        completedPOs: parseInt(poStatsResult.rows[0].completed_pos),
        assignedToEmployees: parseInt(assignmentsResult.rows[0].assigned_to_employees),
      }
    });
  } catch (err) {
    next(err);
  }
};

// ==================== EMPLOYEE ASSIGNMENTS ====================
const getEmployeeAssignments = async (req, res, next) => {
  try {
    const { employeeId, status } = req.query;

    let query = `
      SELECT 
        epa.*,
        p.name as product_name,
        p.sku,
        p.category,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        e.department,
        u1.full_name as assigned_by_name,
        u2.full_name as returned_by_name
      FROM employee_product_assignments epa
      JOIN products p ON epa.product_id = p.id
      JOIN employees e ON epa.employee_id = e.id
      LEFT JOIN users u1 ON epa.assigned_by = u1.id
      LEFT JOIN users u2 ON epa.returned_by = u2.id
      WHERE epa.org_id = $1
    `;

    const params = [req.user.orgId];
    let paramIndex = 2;

    if (employeeId) {
      query += ` AND epa.employee_id = $${paramIndex}`;
      params.push(employeeId);
      paramIndex++;
    }

    if (status) {
      query += ` AND epa.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY epa.assigned_date DESC';

    const result = await db.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
};

const createEmployeeAssignment = async (req, res, next) => {
  try {
    const { employee_id, product_id, quantity, condition_at_assignment, notes } = req.body;

    // Check if product has enough stock
    const stockCheck = await db.query(
      'SELECT COALESCE(SUM(quantity), 0) as total_stock FROM stock WHERE product_id = $1 AND org_id = $2',
      [product_id, req.user.orgId]
    );

    const availableStock = parseInt(stockCheck.rows[0]?.total_stock || 0);
    
    console.log(`Stock check for product ${product_id}: Available=${availableStock}, Requested=${quantity}`);
    
    if (availableStock < quantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock available',
        available: availableStock,
        requested: quantity
      });
    }

    const result = await db.query(
      `INSERT INTO employee_product_assignments (
        org_id, employee_id, product_id, quantity, 
        condition_at_assignment, notes, assigned_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [req.user.orgId, employee_id, product_id, quantity, condition_at_assignment, notes, req.user.id]
    );

    // Reduce stock (from warehouse with most stock)
    await db.query(
      `UPDATE stock 
       SET quantity = quantity - $1
       WHERE id = (
         SELECT id FROM stock 
         WHERE product_id = $2 AND org_id = $3 AND quantity >= $1
         ORDER BY quantity DESC
         LIMIT 1
       )`,
      [quantity, product_id, req.user.orgId]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const returnEmployeeAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { condition_at_return, notes, warehouse_id } = req.body;

    // Get assignment details
    const assignment = await db.query(
      'SELECT * FROM employee_product_assignments WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );

    if (assignment.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const assignmentData = assignment.rows[0];

    // Update assignment
    const result = await db.query(
      `UPDATE employee_product_assignments 
       SET status = 'returned', 
           return_date = CURRENT_DATE,
           condition_at_return = $1,
           notes = COALESCE($2, notes),
           returned_by = $3
       WHERE id = $4 AND org_id = $5
       RETURNING *`,
      [condition_at_return, notes, req.user.id, id, req.user.orgId]
    );

    // Add stock back
    await db.query(
      `UPDATE stock 
       SET quantity = quantity + $1
       WHERE product_id = $2 AND warehouse_id = $3 AND org_id = $4`,
      [assignmentData.quantity, assignmentData.product_id, warehouse_id, req.user.orgId]
    );

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ==================== STOCK ADJUSTMENTS ====================
const getStockAdjustments = async (req, res, next) => {
  try {
    const { product_id, warehouse_id } = req.query;

    let query = `
      SELECT 
        sa.*,
        p.name as product_name,
        p.sku,
        w.name as warehouse_name,
        u.full_name as adjusted_by_name
      FROM stock_adjustments sa
      JOIN products p ON sa.product_id = p.id
      JOIN warehouses w ON sa.warehouse_id = w.id
      LEFT JOIN users u ON sa.adjusted_by = u.id
      WHERE sa.org_id = $1
    `;

    const params = [req.user.orgId];
    let paramIndex = 2;

    if (product_id) {
      query += ` AND sa.product_id = $${paramIndex}`;
      params.push(product_id);
      paramIndex++;
    }

    if (warehouse_id) {
      query += ` AND sa.warehouse_id = $${paramIndex}`;
      params.push(warehouse_id);
      paramIndex++;
    }

    query += ' ORDER BY sa.created_at DESC LIMIT 100';

    const result = await db.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
};

const createStockAdjustment = async (req, res, next) => {
  try {
    const { product_id, warehouse_id, adjustment_type, quantity_adjusted, reason, reference_number } = req.body;

    // Get current stock
    const stockResult = await db.query(
      'SELECT quantity FROM stock WHERE product_id = $1 AND warehouse_id = $2 AND org_id = $3',
      [product_id, warehouse_id, req.user.orgId]
    );

    if (stockResult.rows.length === 0) {
      return res.status(404).json({ error: 'Stock record not found' });
    }

    const quantityBefore = stockResult.rows[0].quantity;
    const quantityAfter = adjustment_type === 'increase' 
      ? quantityBefore + quantity_adjusted 
      : quantityBefore - quantity_adjusted;

    if (quantityAfter < 0) {
      return res.status(400).json({ error: 'Adjustment would result in negative stock' });
    }

    // Create adjustment record
    const result = await db.query(
      `INSERT INTO stock_adjustments (
        org_id, product_id, warehouse_id, adjustment_type,
        quantity_before, quantity_adjusted, quantity_after,
        reason, reference_number, adjusted_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        req.user.orgId, product_id, warehouse_id, adjustment_type,
        quantityBefore, quantity_adjusted, quantityAfter,
        reason, reference_number, req.user.id
      ]
    );

    // Update stock
    await db.query(
      'UPDATE stock SET quantity = $1 WHERE product_id = $2 AND warehouse_id = $3 AND org_id = $4',
      [quantityAfter, product_id, warehouse_id, req.user.orgId]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getEmployeeAssignments,
  createEmployeeAssignment,
  returnEmployeeAssignment,
  getStockAdjustments,
  createStockAdjustment,
};

module.exports = {
  getDashboardStats,
  getEmployeeAssignments,
  assignProductToEmployee: createEmployeeAssignment,
  removeAssignment: returnEmployeeAssignment,
  getStockAdjustments,
  createStockAdjustment,
};
