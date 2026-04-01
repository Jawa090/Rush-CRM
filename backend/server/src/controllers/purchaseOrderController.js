const db = require('../config/database');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, vendorId } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT po.*, v.name as vendor_name,
             COUNT(poi.id) as item_count
      FROM public.purchase_orders po
      LEFT JOIN public.vendors v ON v.id = po.vendor_id
      LEFT JOIN public.purchase_order_items poi ON poi.purchase_order_id = po.id
      WHERE po.org_id = $1
    `;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (status) {
      query += ` AND po.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (vendorId) {
      query += ` AND po.vendor_id = $${paramIndex}`;
      params.push(vendorId);
      paramIndex++;
    }

    query += ` GROUP BY po.id, v.name ORDER BY po.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const orderResult = await db.query(
      `SELECT po.*, v.name as vendor_name, v.email as vendor_email
       FROM public.purchase_orders po
       LEFT JOIN public.vendors v ON v.id = po.vendor_id
       WHERE po.id = $1 AND po.org_id = $2`,
      [id, req.user.orgId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    const itemsResult = await db.query(
      `SELECT poi.*, p.name as product_name, p.sku
       FROM public.purchase_order_items poi
       LEFT JOIN public.products p ON p.id = poi.product_id
       WHERE poi.purchase_order_id = $1`,
      [id]
    );

    res.json({
      ...orderResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { vendorId, items, notes, expectedDeliveryDate, status } = req.body;

    const totalAmount = items && items.length > 0
      ? items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      : req.body.totalAmount || 0;

    const validStatuses = ['pending', 'approved', 'ordered', 'received', 'cancelled'];
    const orderStatus = validStatuses.includes(status) ? status : 'pending';

    const orderResult = await db.query(
      `INSERT INTO public.purchase_orders (org_id, created_by, vendor_id, total_amount, notes, expected_delivery, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.orgId, req.user.id, vendorId, totalAmount, notes, expectedDeliveryDate || null, orderStatus]
    );

    const orderId = orderResult.rows[0].id;

    if (items && items.length > 0) {
      for (const item of items) {
        await db.query(
          `INSERT INTO public.purchase_order_items (purchase_order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)`,
          [orderId, item.productId, item.quantity, item.unitPrice]
        );
      }
    }

    res.status(201).json(orderResult.rows[0]);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, expectedDeliveryDate } = req.body;

    const result = await db.query(
      `UPDATE public.purchase_orders 
       SET notes = COALESCE($1, notes),
           expected_delivery = COALESCE($2, expected_delivery),
           updated_at = now()
       WHERE id = $3 AND org_id = $4
       RETURNING *`,
      [notes, expectedDeliveryDate, id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'ordered', 'received', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await db.query(
      `UPDATE public.purchase_orders 
       SET status = $1, updated_at = now()
       WHERE id = $2 AND org_id = $3
       RETURNING *`,
      [status, id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    if (status === 'received') {
      const items = await db.query(
        'SELECT * FROM public.purchase_order_items WHERE purchase_order_id = $1',
        [id]
      );

      for (const item of items.rows) {
        // Get warehouse for this org
        const warehouseResult = await db.query(
          'SELECT id FROM public.warehouses WHERE org_id = $1 LIMIT 1',
          [req.user.orgId]
        );

        if (warehouseResult.rows.length > 0) {
          const warehouseId = warehouseResult.rows[0].id;

          const existingStock = await db.query(
            `SELECT * FROM public.stock WHERE product_id = $1 AND warehouse_id = $2 AND org_id = $3`,
            [item.product_id, warehouseId, req.user.orgId]
          );

          if (existingStock.rows.length > 0) {
            // Update existing stock
            await db.query(
              `UPDATE public.stock 
               SET quantity = quantity + $1, updated_at = NOW()
               WHERE product_id = $2 AND warehouse_id = $3 AND org_id = $4`,
              [item.quantity, item.product_id, warehouseId, req.user.orgId]
            );
          } else {
            // Create new stock record
            await db.query(
              `INSERT INTO public.stock (org_id, product_id, warehouse_id, quantity, created_by)
               VALUES ($1, $2, $3, $4, $5)`,
              [req.user.orgId, item.product_id, warehouseId, item.quantity, req.user.id]
            );
          }

          // Record stock movement with correct column names
          await db.query(
            `INSERT INTO public.stock_movements (org_id, product_id, type, quantity, reference, notes, created_by)
             VALUES ($1, $2, 'purchase', $3, $4, 'PO Received', $5)`,
            [req.user.orgId, item.product_id, item.quantity, `PO-${id}`, req.user.id]
          );
        }
      }
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
      'DELETE FROM public.purchase_orders WHERE id = $1 AND org_id = $2 AND status = \'pending\' RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found or cannot be deleted' });
    }

    await db.query('DELETE FROM public.purchase_order_items WHERE purchase_order_id = $1', [id]);

    res.json({ message: 'Purchase order deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  updateStatus,
  remove,
};
