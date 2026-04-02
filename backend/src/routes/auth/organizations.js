const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const orgController = require('../../controllers/auth/orgController');

router.use(auth, requireOrg);

router.get('/', orgController.getCurrent);
router.put('/', orgController.update);
router.put('/:id', orgController.update);
router.get('/invites', orgController.getInvites);
router.post('/invites', orgController.createInvite);
router.delete('/invites/:id', orgController.deleteInvite);

module.exports = router;
