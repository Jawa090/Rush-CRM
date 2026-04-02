const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const dealController = require('../../controllers/crm/dealController');

router.use(auth, requireOrg);

router.get('/', dealController.getAll);
router.get('/stats', dealController.getStats);
router.post('/:id/contacts', dealController.addContact);
router.delete('/:id/contacts/:contactId', dealController.removeContact);
router.post('/:id/signing-parties', dealController.addSigningParty);
router.delete('/:id/signing-parties/:contactId', dealController.removeSigningParty);
router.post('/:id/convert-to-customer', dealController.convertToCustomer);
router.get('/:id', dealController.getById);
router.post('/', dealController.create);
router.put('/:id', dealController.update);
router.patch('/:id/stage', dealController.updateStage);
router.patch('/:id/status', dealController.updateStatus);
router.delete('/:id', dealController.remove);

module.exports = router;
