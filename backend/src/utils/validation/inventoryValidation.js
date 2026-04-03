const Joi = require('joi');

// Vendor Validation
const createVendorSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  postal_code: Joi.string().optional().allow(''),
  contact_person: Joi.string().optional().allow(''),
  payment_terms: Joi.string().optional().allow(''),
  notes: Joi.string().optional().allow(''),
});

const updateVendorSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  postal_code: Joi.string().optional().allow(''),
  contact_person: Joi.string().optional().allow(''),
  payment_terms: Joi.string().optional().allow(''),
  notes: Joi.string().optional().allow(''),
});

// Warehouse Validation
const createWarehouseSchema = Joi.object({
  name: Joi.string().required(),
  location: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  postal_code: Joi.string().optional().allow(''),
  capacity: Joi.number().optional(),
  manager_id: Joi.string().uuid().optional().allow(null),
  notes: Joi.string().optional().allow(''),
});

const updateWarehouseSchema = Joi.object({
  name: Joi.string().optional(),
  location: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  postal_code: Joi.string().optional().allow(''),
  capacity: Joi.number().optional(),
  manager_id: Joi.string().uuid().optional().allow(null),
  notes: Joi.string().optional().allow(''),
});

module.exports = {
  createVendorSchema,
  updateVendorSchema,
  createWarehouseSchema,
  updateWarehouseSchema,
};
