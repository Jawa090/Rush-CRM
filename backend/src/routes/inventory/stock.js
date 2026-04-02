const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const stockController = require('../../controllers/inventory/stockController');

router.use(auth, requireOrg);

router.get('/', stockController.getAll);
router.get('/alerts', stockController.getAlerts);
router.get('/movements', stockController.getMovements);
router.post('/adjust', stockController.adjust);
router.post('/transfer', stockController.transfer);
router.get('/history/:productId', stockController.getHistory);

module.exports = router;
