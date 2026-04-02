const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const signingPartyController = require('../../controllers/crm/signingPartyController');

router.use(auth, requireOrg);

router.get('/', signingPartyController.getAll);
router.get('/:id', signingPartyController.getById);
router.post('/', signingPartyController.create);
router.put('/:id', signingPartyController.update);
router.delete('/:id', signingPartyController.remove);

module.exports = router;
