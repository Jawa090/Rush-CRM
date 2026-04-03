const Joi = require('joi');

// Lead Validation
const createLeadSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  company: Joi.string().optional().allow(''),
  title: Joi.string().optional().allow(''),
  source: Joi.string().optional().allow(''),
  status: Joi.string().optional().allow(''),
  stage: Joi.string().optional().allow(''),
  value: Joi.number().optional(),
  notes: Joi.string().optional().allow(''),
  assigned_to: Joi.string().uuid().optional().allow(null),
  workspace_id: Joi.string().uuid().optional().allow(null),
  campaign_id: Joi.string().uuid().optional().allow(null),
  utm_source: Joi.string().optional().allow(''),
  utm_medium: Joi.string().optional().allow(''),
  utm_campaign: Joi.string().optional().allow(''),
});

const updateLeadSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  company: Joi.string().optional().allow(''),
  title: Joi.string().optional().allow(''),
  source: Joi.string().optional().allow(''),
  status: Joi.string().optional().allow(''),
  stage: Joi.string().optional().allow(''),
  value: Joi.number().optional(),
  notes: Joi.string().optional().allow(''),
  assigned_to: Joi.string().uuid().optional().allow(null),
  workspace_id: Joi.string().uuid().optional().allow(null),
  campaign_id: Joi.string().uuid().optional().allow(null),
});

// Deal Validation
const createDealSchema = Joi.object({
  title: Joi.string().required(),
  value: Joi.number().required(),
  stage: Joi.string().optional().allow(''),
  status: Joi.string().optional().allow(''),
  customer_id: Joi.string().uuid().optional().allow(null),
  contact_id: Joi.string().uuid().optional().allow(null),
  assigned_to: Joi.string().uuid().optional().allow(null),
  expected_close_date: Joi.date().optional(),
  probability: Joi.number().min(0).max(100).optional(),
  notes: Joi.string().optional().allow(''),
  campaign_id: Joi.string().uuid().optional().allow(null),
});

const updateDealSchema = Joi.object({
  title: Joi.string().optional(),
  value: Joi.number().optional(),
  stage: Joi.string().optional().allow(''),
  status: Joi.string().optional().allow(''),
  customer_id: Joi.string().uuid().optional().allow(null),
  contact_id: Joi.string().uuid().optional().allow(null),
  assigned_to: Joi.string().uuid().optional().allow(null),
  expected_close_date: Joi.date().optional(),
  probability: Joi.number().min(0).max(100).optional(),
  notes: Joi.string().optional().allow(''),
});

// Contact Validation
const createContactSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  company_id: Joi.string().uuid().optional().allow(null),
  title: Joi.string().optional().allow(''),
  department: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  postal_code: Joi.string().optional().allow(''),
  notes: Joi.string().optional().allow(''),
});

const updateContactSchema = Joi.object({
  first_name: Joi.string().optional(),
  last_name: Joi.string().optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  company_id: Joi.string().uuid().optional().allow(null),
  title: Joi.string().optional().allow(''),
  department: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  postal_code: Joi.string().optional().allow(''),
  notes: Joi.string().optional().allow(''),
});

// Company Validation
const createCompanySchema = Joi.object({
  name: Joi.string().required(),
  industry: Joi.string().optional().allow(''),
  website: Joi.string().uri().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  postal_code: Joi.string().optional().allow(''),
  notes: Joi.string().optional().allow(''),
});

const updateCompanySchema = Joi.object({
  name: Joi.string().optional(),
  industry: Joi.string().optional().allow(''),
  website: Joi.string().uri().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  postal_code: Joi.string().optional().allow(''),
  notes: Joi.string().optional().allow(''),
});

// Customer Validation
const createCustomerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  company: Joi.string().optional().allow(''),
  industry: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  postal_code: Joi.string().optional().allow(''),
  notes: Joi.string().optional().allow(''),
});

const updateCustomerSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  company: Joi.string().optional().allow(''),
  industry: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  state: Joi.string().optional().allow(''),
  country: Joi.string().optional().allow(''),
  postal_code: Joi.string().optional().allow(''),
  notes: Joi.string().optional().allow(''),
});

// Signing Party Validation
const createSigningPartySchema = Joi.object({
  deal_id: Joi.string().uuid().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().optional().allow(''),
  company: Joi.string().optional().allow(''),
  title: Joi.string().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  signing_order: Joi.number().optional(),
  status: Joi.string().valid('pending', 'signed', 'declined').default('pending'),
});

const updateSigningPartySchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().optional().allow(''),
  company: Joi.string().optional().allow(''),
  title: Joi.string().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  signing_order: Joi.number().optional(),
  status: Joi.string().valid('pending', 'signed', 'declined').optional(),
});

module.exports = {
  createLeadSchema,
  updateLeadSchema,
  createDealSchema,
  updateDealSchema,
  createContactSchema,
  updateContactSchema,
  createCompanySchema,
  updateCompanySchema,
  createCustomerSchema,
  updateCustomerSchema,
  createSigningPartySchema,
  updateSigningPartySchema,
};
