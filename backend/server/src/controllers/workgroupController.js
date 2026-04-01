const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Get all workgroups for organization
const getWorkgroups = async (req, res, next) => {
  try {
    const { type, search } = req.query;
    
    let query = `
      SELECT 
        w.*,
        u.full_name as created_by_name,
        COUNT(DISTINCT wm.user_id) as member_count,
        COUNT(DISTINCT wp.id) as message_count,
        MAX(wp.created_at) as last_message_at,
        CASE 
          WHEN wm_current.user_id IS NOT NULL THEN true 
          ELSE false 
        END as is_member
      FROM workgroups w
      LEFT JOIN users u ON w.created_by = u.id
      LEFT JOIN workgroup_members wm ON w.id = wm.workgroup_id
      LEFT JOIN workgroup_posts wp ON w.id = wp.workgroup_id AND wp.is_deleted = false
      LEFT JOIN workgroup_members wm_current ON w.id = wm_current.workgroup_id AND wm_current.user_id = $1
      WHERE w.org_id = $2 AND w.is_archived = false
    `;
    
    const params = [req.user.id, req.user.orgId];
    let paramIndex = 3;
    
    // Filter by type
    if (type && type !== 'all') {
      query += ` AND w.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    // Search filter
    if (search) {
      query += ` AND (w.name ILIKE $${paramIndex} OR w.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Privacy filter - only show private groups if user is a member
    query += ` AND (w.is_private = false OR wm_current.user_id IS NOT NULL)`;
    
    query += `
      GROUP BY w.id, u.full_name, wm_current.user_id
      ORDER BY w.last_activity_at DESC, w.created_at DESC
    `;
    
    const result = await db.query(query, params);
    
    // Add activity indicators
    const workgroups = result.rows.map(wg => ({
      ...wg,
      has_recent_activity: wg.last_message_at && 
        new Date(wg.last_message_at) > new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      is_online: Math.random() > 0.5 // Mock online status - in real app, use WebSocket
    }));
    
    res.json(workgroups);
  } catch (err) {
    next(err);
  }
};

// Get single workgroup
const getWorkgroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        w.*,
        u.full_name as created_by_name,
        COUNT(DISTINCT wm.user_id) as member_count,
        COUNT(DISTINCT wp.id) as message_count,
        CASE 
          WHEN wm_current.user_id IS NOT NULL THEN wm_current.role 
          ELSE null 
        END as user_role
      FROM workgroups w
      LEFT JOIN users u ON w.created_by = u.id
      LEFT JOIN workgroup_members wm ON w.id = wm.workgroup_id
      LEFT JOIN workgroup_posts wp ON w.id = wp.workgroup_id AND wp.is_deleted = false
      LEFT JOIN workgroup_members wm_current ON w.id = wm_current.workgroup_id AND wm_current.user_id = $1
      WHERE w.id = $2 AND w.org_id = $3 AND w.is_archived = false
      GROUP BY w.id, u.full_name, wm_current.user_id, wm_current.role
    `;
    
    const result = await db.query(query, [req.user.id, id, req.user.orgId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workgroup not found' });
    }
    
    const workgroup = result.rows[0];
    
    // Check if user can access private workgroup
    if (workgroup.is_private && !workgroup.user_role) {
      return res.status(403).json({ error: 'Access denied to private workgroup' });
    }
    
    res.json(workgroup);
  } catch (err) {
    next(err);
  }
};

// Create workgroup
const createWorkgroup = async (req, res, next) => {
  try {
    const { name, description, avatar_color, type, is_private } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Workgroup name is required' });
    }
    
    // Check if name already exists in organization
    const existingQuery = `
      SELECT id FROM workgroups 
      WHERE org_id = $1 AND LOWER(name) = LOWER($2) AND is_archived = false
    `;
    const existing = await db.query(existingQuery, [req.user.orgId, name.trim()]);
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'A workgroup with this name already exists' });
    }
    
    const id = uuidv4();
    const query = `
      INSERT INTO workgroups (
        id, org_id, name, description, avatar_color, type, is_private, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const result = await db.query(query, [
      id,
      req.user.orgId,
      name.trim(),
      description?.trim() || null,
      avatar_color || 'bg-blue-500',
      type || 'team',
      is_private || false,
      req.user.id
    ]);
    
    // Log activity
    await logActivity(id, req.user.id, 'workgroup_created', {
      workgroup_name: name.trim(),
      type: type || 'team'
    });
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Update workgroup
const updateWorkgroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, avatar_color, type, is_private } = req.body;
    
    // Check if user is admin or owner
    const memberQuery = `
      SELECT role FROM workgroup_members 
      WHERE workgroup_id = $1 AND user_id = $2
    `;
    const memberResult = await db.query(memberQuery, [id, req.user.id]);
    
    if (memberResult.rows.length === 0 || 
        !['owner', 'admin'].includes(memberResult.rows[0].role)) {
      return res.status(403).json({ error: 'Only workgroup owners and admins can update workgroup settings' });
    }
    
    if (name && name.trim()) {
      // Check if new name conflicts with existing workgroup
      const existingQuery = `
        SELECT id FROM workgroups 
        WHERE org_id = $1 AND LOWER(name) = LOWER($2) AND id != $3 AND is_archived = false
      `;
      const existing = await db.query(existingQuery, [req.user.orgId, name.trim(), id]);
      
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'A workgroup with this name already exists' });
      }
    }
    
    const query = `
      UPDATE workgroups 
      SET 
        name = COALESCE($1, name),
        description = $2,
        avatar_color = COALESCE($3, avatar_color),
        type = COALESCE($4, type),
        is_private = COALESCE($5, is_private),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND org_id = $7
      RETURNING *
    `;
    
    const result = await db.query(query, [
      name?.trim(),
      description?.trim(),
      avatar_color,
      type,
      is_private,
      id,
      req.user.orgId
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workgroup not found' });
    }
    
    // Log activity
    await logActivity(id, req.user.id, 'workgroup_updated', {
      changes: { name, description, avatar_color, type, is_private }
    });
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Delete workgroup
const deleteWorkgroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user is owner
    const memberQuery = `
      SELECT role FROM workgroup_members 
      WHERE workgroup_id = $1 AND user_id = $2
    `;
    const memberResult = await db.query(memberQuery, [id, req.user.id]);
    
    if (memberResult.rows.length === 0 || memberResult.rows[0].role !== 'owner') {
      return res.status(403).json({ error: 'Only workgroup owners can delete workgroups' });
    }
    
    // Soft delete by archiving
    const query = `
      UPDATE workgroups 
      SET is_archived = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND org_id = $2
      RETURNING name
    `;
    
    const result = await db.query(query, [id, req.user.orgId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workgroup not found' });
    }
    
    // Log activity
    await logActivity(id, req.user.id, 'workgroup_deleted', {
      workgroup_name: result.rows[0].name
    });
    
    res.json({ message: 'Workgroup deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Get workgroup members
const getWorkgroupMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user has access to workgroup
    const accessQuery = `
      SELECT w.is_private, wm.user_id
      FROM workgroups w
      LEFT JOIN workgroup_members wm ON w.id = wm.workgroup_id AND wm.user_id = $1
      WHERE w.id = $2 AND w.org_id = $3
    `;
    const accessResult = await db.query(accessQuery, [req.user.id, id, req.user.orgId]);
    
    if (accessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workgroup not found' });
    }
    
    if (accessResult.rows[0].is_private && !accessResult.rows[0].user_id) {
      return res.status(403).json({ error: 'Access denied to private workgroup' });
    }
    
    const query = `
      SELECT 
        wm.*,
        u.full_name,
        u.email,
        u.avatar_url,
        ui.full_name as invited_by_name
      FROM workgroup_members wm
      JOIN users u ON wm.user_id = u.id
      LEFT JOIN users ui ON wm.invited_by = ui.id
      WHERE wm.workgroup_id = $1
      ORDER BY 
        CASE wm.role 
          WHEN 'owner' THEN 1 
          WHEN 'admin' THEN 2 
          WHEN 'member' THEN 3 
          WHEN 'guest' THEN 4 
        END,
        wm.joined_at ASC
    `;
    
    const result = await db.query(query, [id]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Add member to workgroup
const addWorkgroupMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id, role } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Check if current user can add members
    const permissionQuery = `
      SELECT wm.role, w.allow_member_add_remove
      FROM workgroup_members wm
      JOIN workgroups w ON wm.workgroup_id = w.id
      WHERE wm.workgroup_id = $1 AND wm.user_id = $2
    `;
    const permissionResult = await db.query(permissionQuery, [id, req.user.id]);
    
    if (permissionResult.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this workgroup' });
    }
    
    const { role: currentUserRole, allow_member_add_remove } = permissionResult.rows[0];
    
    if (!['owner', 'admin'].includes(currentUserRole) && !allow_member_add_remove) {
      return res.status(403).json({ error: 'You do not have permission to add members' });
    }
    
    // Check if user exists and is in same organization
    const userQuery = `
      SELECT id, full_name FROM users 
      WHERE id = $1 AND org_id = $2
    `;
    const userResult = await db.query(userQuery, [user_id, req.user.orgId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in your organization' });
    }
    
    // Check if user is already a member
    const existingQuery = `
      SELECT id FROM workgroup_members 
      WHERE workgroup_id = $1 AND user_id = $2
    `;
    const existingResult = await db.query(existingQuery, [id, user_id]);
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'User is already a member of this workgroup' });
    }
    
    const insertQuery = `
      INSERT INTO workgroup_members (workgroup_id, user_id, role, invited_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await db.query(insertQuery, [
      id,
      user_id,
      role || 'member',
      req.user.id
    ]);
    
    // Log activity
    await logActivity(id, req.user.id, 'member_added', {
      added_user_name: userResult.rows[0].full_name,
      role: role || 'member'
    });
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Remove member from workgroup
const removeWorkgroupMember = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;
    
    // Get member details
    const memberQuery = `
      SELECT wm.user_id, wm.role, u.full_name
      FROM workgroup_members wm
      JOIN users u ON wm.user_id = u.id
      WHERE wm.id = $1 AND wm.workgroup_id = $2
    `;
    const memberResult = await db.query(memberQuery, [memberId, id]);
    
    if (memberResult.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    const { user_id: targetUserId, role: targetRole, full_name } = memberResult.rows[0];
    
    // Check permissions
    const permissionQuery = `
      SELECT role FROM workgroup_members 
      WHERE workgroup_id = $1 AND user_id = $2
    `;
    const permissionResult = await db.query(permissionQuery, [id, req.user.id]);
    
    if (permissionResult.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this workgroup' });
    }
    
    const currentUserRole = permissionResult.rows[0].role;
    
    // Users can remove themselves, owners can remove anyone, admins can remove members/guests
    if (targetUserId !== req.user.id) {
      if (currentUserRole === 'owner') {
        // Owners can remove anyone except other owners
        if (targetRole === 'owner') {
          return res.status(403).json({ error: 'Cannot remove other owners' });
        }
      } else if (currentUserRole === 'admin') {
        // Admins can only remove members and guests
        if (['owner', 'admin'].includes(targetRole)) {
          return res.status(403).json({ error: 'Cannot remove owners or other admins' });
        }
      } else {
        return res.status(403).json({ error: 'You do not have permission to remove members' });
      }
    }
    
    const deleteQuery = `
      DELETE FROM workgroup_members 
      WHERE id = $1 AND workgroup_id = $2
    `;
    
    await db.query(deleteQuery, [memberId, id]);
    
    // Log activity
    await logActivity(id, req.user.id, 'member_removed', {
      removed_user_name: full_name,
      was_self_removal: targetUserId === req.user.id
    });
    
    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    next(err);
  }
};

// Get workgroup posts/messages
const getWorkgroupPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { channel_id, limit = 50, offset = 0 } = req.query;
    
    // Check access
    const accessQuery = `
      SELECT w.is_private, wm.user_id
      FROM workgroups w
      LEFT JOIN workgroup_members wm ON w.id = wm.workgroup_id AND wm.user_id = $1
      WHERE w.id = $2 AND w.org_id = $3
    `;
    const accessResult = await db.query(accessQuery, [req.user.id, id, req.user.orgId]);
    
    if (accessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workgroup not found' });
    }
    
    if (accessResult.rows[0].is_private && !accessResult.rows[0].user_id) {
      return res.status(403).json({ error: 'Access denied to private workgroup' });
    }
    
    let query = `
      WITH RECURSIVE post_tree AS (
        -- Get parent posts
        SELECT 
          p.*,
          u.full_name as author_name,
          u.avatar_url as author_avatar,
          0 as depth,
          p.id as root_id
        FROM workgroup_posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.workgroup_id = $1 
          AND p.parent_id IS NULL 
          AND p.is_deleted = false
    `;
    
    const params = [id];
    let paramIndex = 2;
    
    if (channel_id) {
      query += ` AND p.channel_id = $${paramIndex}`;
      params.push(channel_id);
      paramIndex++;
    }
    
    query += `
        UNION ALL
        -- Get replies
        SELECT 
          p.*,
          u.full_name as author_name,
          u.avatar_url as author_avatar,
          pt.depth + 1,
          pt.root_id
        FROM workgroup_posts p
        JOIN users u ON p.user_id = u.id
        JOIN post_tree pt ON p.parent_id = pt.id
        WHERE p.is_deleted = false
      )
      SELECT * FROM post_tree
      ORDER BY root_id DESC, depth ASC, created_at ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    
    // Group replies under parent posts
    const postsMap = new Map();
    const rootPosts = [];
    
    result.rows.forEach(post => {
      if (post.depth === 0) {
        post.replies = [];
        postsMap.set(post.id, post);
        rootPosts.push(post);
      } else {
        const parentPost = postsMap.get(post.root_id);
        if (parentPost) {
          parentPost.replies.push(post);
        }
      }
    });
    
    res.json(rootPosts);
  } catch (err) {
    next(err);
  }
};

// Create post/message
const createWorkgroupPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, channel_id, parent_id, content_type } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    // Check if user is member
    const memberQuery = `
      SELECT id FROM workgroup_members 
      WHERE workgroup_id = $1 AND user_id = $2
    `;
    const memberResult = await db.query(memberQuery, [id, req.user.id]);
    
    if (memberResult.rows.length === 0) {
      return res.status(403).json({ error: 'You must be a member to post messages' });
    }
    
    const postId = uuidv4();
    const insertQuery = `
      INSERT INTO workgroup_posts (
        id, workgroup_id, channel_id, user_id, parent_id, content, content_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await db.query(insertQuery, [
      postId,
      id,
      channel_id || null,
      req.user.id,
      parent_id || null,
      content.trim(),
      content_type || 'text'
    ]);
    
    // Get post with author info
    const postQuery = `
      SELECT p.*, u.full_name as author_name, u.avatar_url as author_avatar
      FROM workgroup_posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;
    const postResult = await db.query(postQuery, [postId]);
    
    // Log activity
    await logActivity(id, req.user.id, 'message_posted', {
      message_id: postId,
      is_reply: !!parent_id
    });
    
    res.status(201).json(postResult.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Delete workgroup post
const deleteWorkgroupPost = async (req, res, next) => {
  try {
    const { id, postId } = req.params;
    
    // Check if post exists and get post info
    const postQuery = `
      SELECT p.*, wm.role
      FROM workgroup_posts p
      LEFT JOIN workgroup_members wm ON p.workgroup_id = wm.workgroup_id AND wm.user_id = $1
      WHERE p.id = $2 AND p.workgroup_id = $3 AND p.is_deleted = false
    `;
    const postResult = await db.query(postQuery, [req.user.id, postId, id]);
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = postResult.rows[0];
    
    // Check permissions: author can delete their own posts, admins/owners can delete any post
    if (post.user_id !== req.user.id && !['owner', 'admin'].includes(post.role)) {
      return res.status(403).json({ error: 'You can only delete your own posts or be an admin' });
    }
    
    // Soft delete the post
    const deleteQuery = `
      UPDATE workgroup_posts 
      SET is_deleted = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await db.query(deleteQuery, [postId]);
    
    // Log activity
    await logActivity(id, req.user.id, 'message_deleted', {
      message_id: postId,
      deleted_by_author: post.user_id === req.user.id
    });
    
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Toggle pin status of workgroup post
const togglePinWorkgroupPost = async (req, res, next) => {
  try {
    const { id, postId } = req.params;
    const { is_pinned } = req.body;
    
    // Check if user is admin/owner
    const memberQuery = `
      SELECT role FROM workgroup_members 
      WHERE workgroup_id = $1 AND user_id = $2
    `;
    const memberResult = await db.query(memberQuery, [id, req.user.id]);
    
    if (memberResult.rows.length === 0) {
      return res.status(403).json({ error: 'You must be a member to pin posts' });
    }
    
    if (!['owner', 'admin'].includes(memberResult.rows[0].role)) {
      return res.status(403).json({ error: 'Only admins and owners can pin posts' });
    }
    
    // Check if post exists
    const postQuery = `
      SELECT * FROM workgroup_posts 
      WHERE id = $1 AND workgroup_id = $2 AND is_deleted = false
    `;
    const postResult = await db.query(postQuery, [postId, id]);
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Update pin status
    const updateQuery = `
      UPDATE workgroup_posts 
      SET is_pinned = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(updateQuery, [is_pinned, postId]);
    
    // Log activity
    await logActivity(id, req.user.id, is_pinned ? 'message_pinned' : 'message_unpinned', {
      message_id: postId
    });
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Helper function to log activities
const logActivity = async (workgroupId, userId, activityType, activityData = {}) => {
  try {
    const query = `
      INSERT INTO workgroup_activities (workgroup_id, user_id, activity_type, activity_data)
      VALUES ($1, $2, $3, $4)
    `;
    await db.query(query, [workgroupId, userId, activityType, activityData]);
  } catch (err) {
    console.error('Error logging activity:', err);
  }
};

// Get workgroup activities
const getWorkgroupActivities = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;
    
    const query = `
      SELECT 
        wa.*,
        u.full_name as user_name,
        u.avatar_url as user_avatar
      FROM workgroup_activities wa
      LEFT JOIN users u ON wa.user_id = u.id
      WHERE wa.workgroup_id = $1
      ORDER BY wa.created_at DESC
      LIMIT $2
    `;
    
    const result = await db.query(query, [id, parseInt(limit)]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};