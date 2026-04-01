const express = require('express');
const router = express.Router();
const {
  getWorkgroups,
  getWorkgroup,
  createWorkgroup,
  updateWorkgroup,
  deleteWorkgroup,
  getWorkgroupMembers,
  addWorkgroupMember,
  removeWorkgroupMember,
  getWorkgroupPosts,
  createWorkgroupPost,
  deleteWorkgroupPost,
  togglePinWorkgroupPost,
  getWorkgroupActivities
} = require('../controllers/workgroupController');
const { auth } = require('../middleware/auth');

// Apply authentication to all routes
router.use(auth);

// Workgroup routes
router.get('/', getWorkgroups);
router.post('/', createWorkgroup);
router.get('/:id', getWorkgroup);
router.put('/:id', updateWorkgroup);
router.delete('/:id', deleteWorkgroup);

// Member routes
router.get('/:id/members', getWorkgroupMembers);
router.post('/:id/members', addWorkgroupMember);
router.delete('/:id/members/:memberId', removeWorkgroupMember);

// Posts/Messages routes
router.get('/:id/posts', getWorkgroupPosts);
router.post('/:id/posts', createWorkgroupPost);
router.delete('/:id/posts/:postId', deleteWorkgroupPost);
router.put('/:id/posts/:postId/pin', togglePinWorkgroupPost);

// Activity routes
router.get('/:id/activities', getWorkgroupActivities);

module.exports = router;