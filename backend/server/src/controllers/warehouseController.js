const db = require('../config/database');
const Joi = require('joi');

const createWarehouseSchema = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  postal_code: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  manager_name: Joi.string().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  status: Joi.string().valid('active', 'inactive').default('active'),
});

const updateWarehouseSchema = Joi.object({
  name: Joi.string().optional(),
  code: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  postal_code: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  manager_name: Joi.string().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  status: Joi.string().valid('active', 'inactive').optional(),
}).min(1);

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT w.*, 
        (SELECT COUNT(*) FROM stock s WHERE s.warehouse_id = w.id) as product_count
      FROM public.warehouses w
      WHERE w.org_id = $1
    `;
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (search) {
      query += ` AND (w.name ILIKE $${paramIndex} OR w.code ILIKE $${paramIndex} OR w.city ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status && status !== 'all') {
      query += ` AND w.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY w.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM public.warehouses WHERE org_id = $1`;
    const countParams = [req.user.orgId];
    let countParamIndex = 2;

    if (search) {
      countQuery += ` AND (name ILIKE $${countParamIndex} OR code ILIKE $${countParamIndex} OR city ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
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
      `SELECT w.*, 
        (SELECT COUNT(*) FROM stock s WHERE s.warehouse_id = w.id) as product_count,
        (SELECT SUM(s.quantity) FROM stock s WHERE s.warehouse_id = w.id) as total_stock
      FROM public.warehouses w
      WHERE w.id = $1 AND w.org_id = $2`,
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { error, value } = createWarehouseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { 
      name, code, address, city, state, postal_code, country, 
      manager_name, phone, email, status 
    } = value;

    // Check if code already exists (if provided)
    if (code) {
      const existingWarehouse = await db.query(
        'SELECT id FROM public.warehouses WHERE code = $1 AND org_id = $2',
        [code, req.user.orgId]
      );

      if (existingWarehouse.rows.length > 0) {
        return res.status(400).json({ error: 'Warehouse with this code already exists' });
      }
    }

    const result = await db.query(
      `INSERT INTO public.warehouses (
        org_id, name, code, address, city, state, postal_code, country,
        manager_name, phone, email, status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        req.user.orgId, name, code, address, city, state, postal_code, country,
        manager_name, phone, email, status || 'active', req.user.id
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
    const { error, value } = updateWarehouseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if code already exists (if being updated)
    if (value.code) {
      const existingWarehouse = await db.query(
        'SELECT id FROM public.warehouses WHERE code = $1 AND org_id = $2 AND id != $3',
        [value.code, req.user.orgId, id]
      );

      if (existingWarehouse.rows.length > 0) {
        return res.status(400).json({ error: 'Warehouse with this code already exists' });
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
    values.push(id, req.user.orgId);

    const result = await db.query(
      `UPDATE public.warehouses SET ${fields.join(', ')} 
       WHERE id = $${paramIndex} AND org_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if warehouse has stock
    const stockCheck = await db.query(
      'SELECT COUNT(*) FROM public.stock WHERE warehouse_id = $1',
      [id]
    );

    if (parseInt(stockCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete warehouse with existing stock. Please transfer stock first.' 
      });
    }

    const result = await db.query(
      'DELETE FROM public.warehouses WHERE id = $1 AND org_id = $2 RETURNING id',
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    res.json({ message: 'Warehouse deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'inactive') as inactive,
        COALESCE(SUM((SELECT COUNT(*) FROM stock s WHERE s.warehouse_id = w.id)), 0) as total_products,
        COALESCE(SUM((SELECT SUM(s.quantity) FROM stock s WHERE s.warehouse_id = w.id)), 0) as total_stock
      FROM public.warehouses w
      WHERE w.org_id = $1`,
      [req.user.orgId]
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
  getStats,
};