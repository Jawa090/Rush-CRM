const db = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

// Get workgroup wiki pages
const getWorkgroupWikiPages = async (req, res, next) => {
  try {
    const { workgroupId } = req.params;
    
    // Check if user has access to workgroup
    const accessQuery = `
      SELECT w.is_private, wm.user_id
      FROM workgroups w
      LEFT JOIN workgroup_members wm ON w.id = wm.workgroup_id AND wm.user_id = $1
      WHERE w.id = $2 AND w.org_id = $3
    `;
    const accessResult = await db.query(accessQuery, [req.user.id, workgroupId, req.user.orgId]);
    
    if (accessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workgroup not found' });
    }
    
    if (accessResult.rows[0].is_private && !accessResult.rows[0].user_id) {
      return res.status(403).json({ error: 'Access denied to private workgroup' });
    }
    
    const query = `
      SELECT 
        wp.*,
        u1.full_name as created_by_name,
        u1.email as created_by_email,
        u2.full_name as last_modified_by_name,
        u2.email as last_modified_by_email
      FROM workgroup_wiki_pages wp
      JOIN users u1 ON wp.created_by = u1.id
      LEFT JOIN users u2 ON wp.last_modified_by = u2.id
      WHERE wp.workgroup_id = $1 AND wp.is_deleted = FALSE AND wp.is_published = TRUE
      ORDER BY wp.updated_at DESC
    `;
    
    const result = await db.query(query, [workgroupId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Get single wiki page
const getWorkgroupWikiPage = async (req, res, next) => {
  try {
    const { workgroupId, pageId } = req.params;
    
    // Check if user has access to workgroup
    const accessQuery = `
      SELECT w.is_private, wm.user_id
      FROM workgroups w
      LEFT JOIN workgroup_members wm ON w.id = wm.workgroup_id AND wm.user_id = $1
      WHERE w.id = $2 AND w.org_id = $3
    `;
    const accessResult = await db.query(accessQuery, [req.user.id, workgroupId, req.user.orgId]);
    
    if (accessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workgroup not found' });
    }
    
    if (accessResult.rows[0].is_private && !accessResult.rows[0].user_id) {
      return res.status(403).json({ error: 'Access denied to private workgroup' });
    }
    
    const query = `
      SELECT 
        wp.*,
        u1.full_name as created_by_name,
        u1.email as created_by_email,
        u2.full_name as last_modified_by_name,
        u2.email as last_modified_by_email
      FROM workgroup_wiki_pages wp
      JOIN users u1 ON wp.created_by = u1.id
      LEFT JOIN users u2 ON wp.last_modified_by = u2.id
      WHERE wp.id = $1 AND wp.workgroup_id = $2 AND wp.is_deleted = FALSE
    `;
    
    const result = await db.query(query, [pageId, workgroupId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wiki page not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Create wiki page
const createWorkgroupWikiPage = async (req, res, next) => {
  try {
    const { workgroupId } = req.params;
    const { title, content } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Page title is required' });
    }
    
    // Check if user is member
    const memberQuery = `
      SELECT id FROM workgroup_members 
      WHERE workgroup_id = $1 AND user_id = $2
    `;
    const memberResult = await db.query(memberQuery, [workgroupId, req.user.id]);
    
    if (memberResult.rows.length === 0) {
      return res.status(403).json({ error: 'You must be a member to create wiki pages' });
    }
    
    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // Check if slug already exists
    const existingQuery = `
      SELECT id FROM workgroup_wiki_pages 
      WHERE workgroup_id = $1 AND slug = $2 AND is_deleted = FALSE
    `;
    const existingResult = await db.query(existingQuery, [workgroupId, slug]);
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'A page with this title already exists' });
    }
    
    const pageId = uuidv4();
    const insertQuery = `
      INSERT INTO workgroup_wiki_pages (
        id, workgroup_id, user_id, org_id, title, content, slug, created_by, last_modified_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const result = await db.query(insertQuery, [
      pageId,
      workgroupId,
      req.user.id,
      req.user.orgId,
      title.trim(),
      content || '',
      slug,
      req.user.id,
      req.user.id
    ]);
    
    // Create notification
    await createNotification(workgroupId, req.user.id, 'wiki_created', 
      `${req.user.full_name || req.user.email} created a wiki page: ${title}`,
      { page_id: pageId, page_title: title }
    );
    
    // Get page with user info
    const pageQuery = `
      SELECT 
        wp.*,
        u1.full_name as created_by_name,
        u1.email as created_by_email,
        u2.full_name as last_modified_by_name,
        u2.email as last_modified_by_email
      FROM workgroup_wiki_pages wp
      JOIN users u1 ON wp.created_by = u1.id
      LEFT JOIN users u2 ON wp.last_modified_by = u2.id
      WHERE wp.id = $1
    `;
    const pageResult = await db.query(pageQuery, [pageId]);
    
    res.status(201).json(pageResult.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Update wiki page
const updateWorkgroupWikiPage = async (req, res, next) => {
  try {
    const { workgroupId, pageId } = req.params;
    const { title, content } = req.body;
    
    // Check if user is member
    const memberQuery = `
      SELECT id FROM workgroup_members 
      WHERE workgroup_id = $1 AND user_id = $2
    `;
    const memberResult = await db.query(memberQuery, [workgroupId, req.user.id]);
    
    if (memberResult.rows.length === 0) {
      return res.status(403).json({ error: 'You must be a member to edit wiki pages' });
    }
    
    // Check if page exists
    const pageQuery = `
      SELECT * FROM workgroup_wiki_pages 
      WHERE id = $1 AND workgroup_id = $2 AND is_deleted = FALSE
    `;
    const pageResult = await db.query(pageQuery, [pageId, workgroupId]);
    
    if (pageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wiki page not found' });
    }
    
    let updateFields = [];
    let updateValues = [];
    let paramIndex = 1;
    
    if (title && title.trim()) {
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      updateFields.push(`title = $${paramIndex++}`, `slug = $${paramIndex++}`);
      updateValues.push(title.trim(), slug);
    }
    
    if (content !== undefined) {
      updateFields.push(`content = $${paramIndex++}`);
      updateValues.push(content);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updateFields.push(`last_modified_by = $${paramIndex++}`, `updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(req.user.id);
    
    const updateQuery = `
      UPDATE workgroup_wiki_pages 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex++} AND workgroup_id = $${paramIndex++}
      RETURNING *
    `;
    updateValues.push(pageId, workgroupId);
    
    const result = await db.query(updateQuery, updateValues);
    
    // Get updated page with user info
    const updatedPageQuery = `
      SELECT 
        wp.*,
        u1.full_name as created_by_name,
        u1.email as created_by_email,
        u2.full_name as last_modified_by_name,
        u2.email as last_modified_by_email
      FROM workgroup_wiki_pages wp
      JOIN users u1 ON wp.created_by = u1.id
      LEFT JOIN users u2 ON wp.last_modified_by = u2.id
      WHERE wp.id = $1
    `;
    const updatedPageResult = await db.query(updatedPageQuery, [pageId]);
    
    res.json(updatedPageResult.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Delete wiki page
const deleteWorkgroupWikiPage = async (req, res, next) => {
  try {
    const { workgroupId, pageId } = req.params;
    
    // Check if user owns the page or is admin
    const pageQuery = `
      SELECT wp.*, wm.role
      FROM workgroup_wiki_pages wp
      LEFT JOIN workgroup_members wm ON wp.workgroup_id = wm.workgroup_id AND wm.user_id = $1
      WHERE wp.id = $2 AND wp.workgroup_id = $3
    `;
    const pageResult = await db.query(pageQuery, [req.user.id, pageId, workgroupId]);
    
    if (pageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wiki page not found' });
    }
    
    const page = pageResult.rows[0];
    
    if (page.created_by !== req.user.id && !['owner', 'admin'].includes(page.role)) {
      return res.status(403).json({ error: 'You can only delete your own pages or be an admin' });
    }
    
    // Soft delete
    const deleteQuery = `
      UPDATE workgroup_wiki_pages 
      SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await db.query(deleteQuery, [pageId]);
    
    res.json({ message: 'Wiki page deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Helper function to create notifications
const createNotification = async (workgroupId, userId, type, message, data = {}) => {
  try {
    // Get all workgroup members except the user who performed the action
    const membersQuery = `
      SELECT wm.user_id, u.org_id
      FROM workgroup_members wm
      JOIN users u ON wm.user_id = u.id
      WHERE wm.workgroup_id = $1 AND wm.user_id != $2
    `;
    const membersResult = await db.query(membersQuery, [workgroupId, userId]);
    
    // Create notification for each member
    for (const member of membersResult.rows) {
      const notificationId = uuidv4();
      await db.query(`
        INSERT INTO workgroup_notifications (
          id, workgroup_id, user_id, org_id, notification_type, title, message, data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        notificationId,
        workgroupId,
        member.user_id,
        member.org_id,
        type,
        message.split(':')[0] || message,
        message,
        JSON.stringify(data)
      ]);
    }
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};

module.exports = {
  getWorkgroupWikiPages,
  getWorkgroupWikiPage,
  createWorkgroupWikiPage,
  updateWorkgroupWikiPage,
  deleteWorkgroupWikiPage
};
