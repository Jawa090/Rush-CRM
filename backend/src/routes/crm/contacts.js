const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const contactController = require('../../controllers/crm/contactController');

router.use(auth, requireOrg);

router.get('/', contactController.getAll);
router.get('/:id', contactController.getById);
router.post('/', contactController.create);
router.put('/:id', contactController.update);
router.delete('/:id', contactController.remove);

module.exports = router;
