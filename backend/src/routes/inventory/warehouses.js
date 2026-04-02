const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const warehouseController = require('../../controllers/inventory/warehouseController');

router.use(auth, requireOrg);

router.get('/', warehouseController.getAll);
router.get('/stats', warehouseController.getStats);
router.get('/:id', warehouseController.getById);
router.post('/', warehouseController.create);
router.put('/:id', warehouseController.update);
router.delete('/:id', warehouseController.remove);

module.exports = router;
