const db = require('../../config/database');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, category } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, 
             COALESCE(SUM(s.quantity), 0) as total_stock
      FROM public.products p
      LEFT JOIN public.stock s ON s.product_id = p.id
      WHERE p.org_id = $1
    `;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (category && category !== 'all') {
      query += ` AND p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM public.products WHERE org_id = $1`;
    const countParams = [req.user.orgId];
    let countParamIndex = 2;

    if (category && category !== 'all') {
      countQuery += ` AND category = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (name ILIKE $${countParamIndex} OR sku ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    const countResult = await db.query(countQuery, countParams);

    res.json({
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT category FROM public.products 
       WHERE org_id = $1 AND category IS NOT NULL 
       ORDER BY category`,
      [req.user.orgId]
    );

    res.json(result.rows.map(r => r.category));
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT p.*, 
              COALESCE(SUM(s.quantity), 0) as total_stock
       FROM public.products p
       LEFT JOIN public.stock s ON s.product_id = p.id
       WHERE p.id = $1 AND p.org_id = $2
       GROUP BY p.id`,
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, sku, description, category, price, cost, unit, min_stock_level, status, initial_stock } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    // Start transaction
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create product
      const productResult = await client.query(
        `INSERT INTO public.products (
          org_id, name, sku, description, category, price, cost, unit, min_stock_level, status, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [req.user.orgId, name, sku, description, category, price || 0, cost || 0, unit || 'piece', min_stock_level || 10, status || 'active', req.user.id]
      );

      const product = productResult.rows[0];

      // If initial stock is provided, update stock table
      if (initial_stock && initial_stock > 0) {
        // Get first warehouse for this org
        const warehouseResult = await client.query(
          'SELECT id FROM warehouses WHERE org_id = $1 LIMIT 1',
          [req.user.orgId]
        );

        if (warehouseResult.rows.length > 0) {
          const warehouseId = warehouseResult.rows[0].id;
          
          // Update stock quantity
          await client.query(
            `UPDATE stock 
             SET quantity = $1 
             WHERE product_id = $2 AND warehouse_id = $3 AND org_id = $4`,
            [initial_stock, product.id, warehouseId, req.user.orgId]
          );

          // Log stock movement
          await client.query(
            `INSERT INTO stock_movements (org_id, product_id, warehouse_id, movement_type, quantity, reason, created_by)
             VALUES ($1, $2, $3, 'stock_in', $4, 'Initial stock', $5)`,
            [req.user.orgId, product.id, warehouseId, initial_stock, req.user.id]
          );
        }
      }

      await client.query('COMMIT');
      res.status(201).json(product);
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

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, sku, description, category, price, cost, unit, min_stock_level, status } = req.body;

    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(name); }
    if (sku !== undefined) { fields.push(`sku = $${paramIndex++}`); values.push(sku); }
    if (description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(description); }
    if (category !== undefined) { fields.push(`category = $${paramIndex++}`); values.push(category); }
    if (price !== undefined) { fields.push(`price = $${paramIndex++}`); values.push(price); }
    if (cost !== undefined) { fields.push(`cost = $${paramIndex++}`); values.push(cost); }
    if (unit !== undefined) { fields.push(`unit = $${paramIndex++}`); values.push(unit); }
    if (min_stock_level !== undefined) { fields.push(`min_stock_level = $${paramIndex++}`); values.push(min_stock_level); }
    if (status !== undefined) { fields.push(`status = $${paramIndex++}`); values.push(status); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.products SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Start transaction
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if product exists
      const productCheck = await client.query(
        'SELECT id FROM public.products WHERE id = $1 AND org_id = $2',
        [id, req.user.orgId]
      );

      if (productCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Product not found' });
      }

      // Delete related stock entries first
      await client.query(
        'DELETE FROM public.stock WHERE product_id = $1 AND org_id = $2',
        [id, req.user.orgId]
      );

      // Delete related stock movements
      await client.query(
        'DELETE FROM public.stock_movements WHERE product_id = $1 AND org_id = $2',
        [id, req.user.orgId]
      );

      // Delete related purchase order items
      await client.query(
        'DELETE FROM public.purchase_order_items WHERE product_id = $1',
        [id]
      );

      // Finally delete the product
      const result = await client.query(
        'DELETE FROM public.products WHERE id = $1 AND org_id = $2 RETURNING id',
        [id, req.user.orgId]
      );

      await client.query('COMMIT');
      
      res.json({ message: 'Product and related data deleted successfully' });
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
  getAll,
  getCategories,
  getById,
  create,
  update,
  remove,
};
