const db = require('../../config/database');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, productId, warehouseId } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, p.name as product_name, p.sku, w.name as warehouse_name
      FROM public.stock s
      LEFT JOIN public.products p ON p.id = s.product_id
      LEFT JOIN public.warehouses w ON w.id = s.warehouse_id
      WHERE s.org_id = $1
    `;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (productId) {
      query += ` AND s.product_id = $${paramIndex}`;
      params.push(productId);
      paramIndex++;
    }

    if (warehouseId) {
      query += ` AND s.warehouse_id = $${paramIndex}`;
      params.push(warehouseId);
      paramIndex++;
    }

    query += ` ORDER BY s.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getAlerts = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT p.id, p.name, p.sku, p.min_stock_level,
              COALESCE(SUM(s.quantity), 0) as current_stock
       FROM public.products p
       LEFT JOIN public.stock s ON s.product_id = p.id
       WHERE p.org_id = $1 AND p.min_stock_level > 0
       GROUP BY p.id
       HAVING COALESCE(SUM(s.quantity), 0) < p.min_stock_level`,
      [req.user.orgId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const adjust = async (req, res, next) => {
  try {
    const { productId, warehouseId, quantity, reason, type } = req.body;

    // First check if stock record exists for this product and warehouse
    const existingStock = await db.query(
      `SELECT * FROM public.stock WHERE product_id = $1 AND warehouse_id = $2 AND org_id = $3`,
      [productId, warehouseId, req.user.orgId]
    );

    let oldQuantity = 0;
    if (existingStock.rows.length > 0) {
      oldQuantity = existingStock.rows[0].quantity || 0;
      // Update existing stock
      const result = await db.query(
        `UPDATE public.stock 
         SET quantity = $1, updated_at = NOW()
         WHERE product_id = $2 AND warehouse_id = $3 AND org_id = $4
         RETURNING *`,
        [quantity, productId, warehouseId, req.user.orgId]
      );
      res.json(result.rows[0]);
    } else {
      // Create new stock record
      const result = await db.query(
        `INSERT INTO public.stock (org_id, product_id, warehouse_id, quantity, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [req.user.orgId, productId, warehouseId, quantity, req.user.id]
      );
      res.status(201).json(result.rows[0]);
    }

    // Record the stock movement with correct column names
    const movementQuantity = quantity - oldQuantity;
    await db.query(
      `INSERT INTO public.stock_movements (org_id, product_id, type, quantity, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user.orgId, productId, type || 'adjustment', movementQuantity, reason, req.user.id]
    );

  } catch (err) {
    next(err);
  }
};

const transfer = async (req, res, next) => {
  try {
    const { productId, fromWarehouseId, toWarehouseId, quantity } = req.body;

    await db.query('BEGIN');

    // Get current stock from source warehouse
    const fromStock = await db.query(
      `SELECT quantity FROM public.stock WHERE product_id = $1 AND warehouse_id = $2 AND org_id = $3`,
      [productId, fromWarehouseId, req.user.orgId]
    );

    if (fromStock.rows.length === 0 || fromStock.rows[0].quantity < quantity) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient stock for transfer' });
    }

    // Reduce stock from source warehouse
    await db.query(
      `UPDATE public.stock 
       SET quantity = quantity - $1, updated_at = NOW()
       WHERE product_id = $2 AND warehouse_id = $3 AND org_id = $4`,
      [quantity, productId, fromWarehouseId, req.user.orgId]
    );

    // Add stock to destination warehouse (or create if doesn't exist)
    const existingStock = await db.query(
      `SELECT * FROM public.stock WHERE product_id = $1 AND warehouse_id = $2 AND org_id = $3`,
      [productId, toWarehouseId, req.user.orgId]
    );

    if (existingStock.rows.length > 0) {
      await db.query(
        `UPDATE public.stock 
         SET quantity = quantity + $1, updated_at = NOW()
         WHERE product_id = $2 AND warehouse_id = $3 AND org_id = $4`,
        [quantity, productId, toWarehouseId, req.user.orgId]
      );
    } else {
      await db.query(
        `INSERT INTO public.stock (org_id, product_id, warehouse_id, quantity, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.user.orgId, productId, toWarehouseId, quantity, req.user.id]
      );
    }

    // Record stock movements with correct column names
    await db.query(
      `INSERT INTO public.stock_movements (org_id, product_id, type, quantity, notes, created_by)
       VALUES ($1, $2, 'transfer_out', $3, $4, $5)`,
      [req.user.orgId, productId, -quantity, `Transfer to warehouse ${toWarehouseId}`, req.user.id]
    );

    await db.query(
      `INSERT INTO public.stock_movements (org_id, product_id, type, quantity, notes, created_by)
       VALUES ($1, $2, 'transfer_in', $3, $4, $5)`,
      [req.user.orgId, productId, quantity, `Transfer from warehouse ${fromWarehouseId}`, req.user.id]
    );

    await db.query('COMMIT');

    res.json({ message: 'Transfer completed successfully' });
  } catch (err) {
    await db.query('ROLLBACK');
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { limit = 50 } = req.query;

    const result = await db.query(
      `SELECT sm.*, u.full_name as created_by_name
       FROM public.stock_movements sm
       LEFT JOIN public.users u ON u.id = sm.created_by
       WHERE sm.product_id = $1 AND sm.org_id = $2
       ORDER BY sm.created_at DESC
       LIMIT $3`,
      [productId, req.user.orgId, limit]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getAlerts,
  adjust,
  transfer,
  getHistory,
};
