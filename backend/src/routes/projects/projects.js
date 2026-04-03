const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const projectController = require('../../controllers/projects/projectController');

router.use(auth, requireOrg);

router.get('/', projectController.getAll);
router.get('/stats', projectController.getStats);
router.get('/comments', projectController.getComments);
router.post('/comments', projectController.createComment);
router.get('/report/:token', projectController.getReport);
router.get('/:id', projectController.getById);
router.post('/', projectController.create);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.remove);
router.get('/:id/members', projectController.getMembers);
router.post('/:id/members', projectController.addMember);
router.delete('/:id/members/:memberId', projectController.removeMember);

module.exports = router;

module.exports = router;
