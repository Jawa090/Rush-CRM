const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const productController = require('../../controllers/inventory/productController');

router.use(auth, requireOrg);

router.get('/', productController.getAll);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getById);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.remove);

module.exports = router;
