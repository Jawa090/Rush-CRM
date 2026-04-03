const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const calendarController = require('../../controllers/collaboration/calendarController');

// These routes require authentication
router.get('/', auth, requireOrg, calendarController.getEvents);
router.get('/connections', auth, requireOrg, calendarController.getConnections);
router.get('/auth/google', auth, requireOrg, calendarController.googleAuth);

router.post('/disconnect-provider', auth, requireOrg, calendarController.disconnectByProvider);
router.post('/sync-provider', auth, requireOrg, calendarController.syncProvider);
router.get('/:id', auth, requireOrg, calendarController.getById);
router.post('/', auth, requireOrg, calendarController.create);
router.put('/:id', auth, requireOrg, calendarController.update);
router.delete('/:id', auth, requireOrg, calendarController.remove);

// This route MUST be accessible without auth (Google redirect callback)
router.get('/auth/google/callback', calendarController.googleAuthCallback);



module.exports = router;
