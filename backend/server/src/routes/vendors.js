const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../middleware/auth');
const vendorController = require('../controllers/vendorController');

router.use(auth, requireOrg);

router.get('/', vendorController.getAll);
router.get('/:id', vendorController.getById);
router.post('/', vendorController.create);
router.put('/:id', vendorController.update);
router.delete('/:id', vendorController.remove);

module.exports = router;
