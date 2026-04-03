// Central export for all validation schemas
const authValidation = require('./authValidation');
const employeeValidation = require('./employeeValidation');
const crmValidation = require('./crmValidation');
const inventoryValidation = require('./inventoryValidation');
const hrmsValidation = require('./hrmsValidation');
const projectValidation = require('./projectValidation');

module.exports = {
  ...authValidation,
  ...employeeValidation,
  ...crmValidation,
  ...inventoryValidation,
  ...hrmsValidation,
  ...projectValidation,
};
