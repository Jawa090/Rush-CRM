const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const calendarController = require('../../controllers/collaboration/calendarController');

router.use(auth, requireOrg);

router.get('/', calendarController.getEvents);
router.get('/:id', calendarController.getById);
router.post('/', calendarController.create);
router.put('/:id', calendarController.update);
router.delete('/:id', calendarController.remove);

module.exports = router;
