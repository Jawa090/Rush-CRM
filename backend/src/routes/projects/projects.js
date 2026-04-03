const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../../middleware/auth');
const projectController = require('../../controllers/projects/projectController');

// All routes require authentication
router.use(auth);
router.use(requireOrg);

// Basic CRUD
router.get('/', projectController.getAll);
router.get('/stats', projectController.getStats);
router.get('/:id', projectController.getById);
router.post('/', projectController.create);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.remove);

// Comments
router.get('/comments', projectController.getComments);
router.post('/comments', projectController.createComment);

// Reports
router.get('/report/:token', projectController.getProjectReport);

// Members
router.get('/:id/members', projectController.getMembers);
router.post('/:id/members', projectController.addMember);
router.delete('/:id/members/:memberId', projectController.removeMember);

module.exports = router;
