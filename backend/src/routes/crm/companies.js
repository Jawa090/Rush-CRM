const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const companyController = require('../../controllers/crm/companyController');

router.use(auth, requireOrg);

router.get('/', companyController.getAll);
router.get('/:id', companyController.getById);
router.post('/', companyController.create);
router.put('/:id', companyController.update);
router.delete('/:id', companyController.remove);

module.exports = router;
