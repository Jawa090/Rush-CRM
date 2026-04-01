const express = require('express');
const router = express.Router();
const { auth, requireOrg } = require('../middleware/auth');
const projectController = require('../controllers/projectController');

router.use(auth, requireOrg);

router.get('/', projectController.getAll);
router.get('/stats', projectController.getStats);

// Comments routes — must be BEFORE /:id to avoid route conflict
router.get('/comments', async (req, res) => {
  const db = require('../config/database');
  try {
    const { entity_type, entity_id } = req.query;
    const tableCheck = await db.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_comments')`
    );
    if (!tableCheck.rows[0].exists) return res.json([]);
    const { rows } = await db.query(
      'SELECT * FROM project_comments WHERE entity_type = $1 AND entity_id = $2 AND org_id = $3 ORDER BY created_at ASC',
      [entity_type, entity_id, req.user.orgId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Project comments error:', err);
    res.json([]);
  }
});

router.post('/comments', async (req, res) => {
  const db = require('../config/database');
  try {
    const { content, entity_type, entity_id } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    const tableCheck = await db.query(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_comments')`
    );
    if (!tableCheck.rows[0].exists) return res.status(501).json({ error: 'Comments feature not available' });
    const { rows } = await db.query(
      'INSERT INTO project_comments (content, entity_type, entity_id, org_id, user_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [content, entity_type, entity_id, req.user.orgId, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Project comments creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', projectController.getById);
router.post('/', projectController.create);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.remove);

router.get('/:id/members', projectController.getMembers);
router.post('/:id/members', projectController.addMember);
router.delete('/:id/members/:memberId', projectController.removeMember);

module.exports = router;
