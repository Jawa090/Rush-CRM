const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../middleware/auth');
const documentsController = require('../controllers/documentsController');

router.use(auth, requireOrg);

router.get('/', documentsController.getAll);
router.get('/vault', documentsController.getVault);
router.get('/:id', documentsController.getById);
router.post('/', documentsController.create);
router.put('/:id', documentsController.update);
router.delete('/:id', documentsController.remove);

module.exports = router;