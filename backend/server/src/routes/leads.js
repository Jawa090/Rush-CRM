const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../middleware/auth');
const leadController = require('../controllers/leadController');

router.use(auth, requireOrg);

router.get('/', leadController.getAll);
router.get('/stats', leadController.getStats);
router.get('/stages', leadController.getStages);
router.post('/stages', leadController.createStage);
router.get('/:id', leadController.getById);
router.post('/', leadController.create);
router.post('/:id/convert-to-deal', leadController.convertToDeal);
router.put('/:id', leadController.update);
router.patch('/:id/stage', leadController.updateStage);
router.delete('/:id', leadController.remove);

module.exports = router;
