const Joi = require('joi');

// Document Validation
const createDocumentSchema = Joi.object({
  project_id: Joi.string().uuid().required(),
  name: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  file_path: Joi.string().optional().allow(''),
  file_url: Joi.string().uri().optional().allow(''),
  file_size: Joi.number().optional(),
  file_type: Joi.string().optional().allow(''),
  version: Joi.string().optional().allow(''),
  uploaded_by: Joi.string().uuid().optional(),
});

const updateDocumentSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional().allow(''),
  file_path: Joi.string().optional().allow(''),
  file_url: Joi.string().uri().optional().allow(''),
  file_size: Joi.number().optional(),
  file_type: Joi.string().optional().allow(''),
  version: Joi.string().optional().allow(''),
});

module.exports = {
  createDocumentSchema,
  updateDocumentSchema,
};
