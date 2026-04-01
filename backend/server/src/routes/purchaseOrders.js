const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../middleware/auth');
const purchaseOrderController = require('../controllers/purchaseOrderController');

router.use(auth, requireOrg);

router.get('/', purchaseOrderController.getAll);
router.get('/:id', purchaseOrderController.getById);
router.post('/', purchaseOrderController.create);
router.put('/:id', purchaseOrderController.update);
router.patch('/:id/status', purchaseOrderController.updateStatus);
router.delete('/:id', purchaseOrderController.remove);

module.exports = router;
