const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const templatesController = require('../../controllers/automation/templatesController');

router.use(auth, requireOrg);

router.get('/', templatesController.getAll);
router.get('/:id', templatesController.getById);
router.post('/', templatesController.create);
router.put('/:id', templatesController.update);
router.delete('/:id', templatesController.remove);
router.post('/:id/apply', templatesController.applyTemplate);

module.exports = router;
