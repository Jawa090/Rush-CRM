const db = require('../config/database');

// Share lead with another workspace
const shareLeadWithWorkspace = async (req, res, next) => {
  try {
    const { leadId } = req.params;
    const { workspaceId, accessLevel = 'view', expiresAt } = req.body;

    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }

    // Verify user has access to the lead
    const leadCheck = await db.query(
      `SELECT l.*, w.name as workspace_name 
       FROM leads l
       LEFT JOIN workgroups w ON w.id = l.workspace_id
       WHERE l.id = $1 AND l.org_id = $2`,
      [leadId, req.user.orgId]
    );

    if (leadCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leadCheck.rows[0];

    // Verify target workspace exists
    const workspaceCheck = await db.query(
      'SELECT id, name FROM workgroups WHERE id = $1 AND org_id = $2',
      [workspaceId, req.user.orgId]
    );

    if (workspaceCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Target workspace not found' });
    }

    // Check if already shared
    const existingShare = await db.query(
      'SELECT id FROM lead_workspace_access WHERE lead_id = $1 AND workspace_id = $2',
      [leadId, workspaceId]
    );

    if (existingShare.rows.length > 0) {
      // Update existing share
      const result = await db.query(
        `UPDATE lead_workspace_access 
         SET access_level = $1, expires_at = $2, granted_by = $3, granted_at = NOW()
         WHERE lead_id = $4 AND workspace_id = $5
         RETURNING *`,
        [accessLevel, expiresAt || null, req.user.id, leadId, workspaceId]
      );
      return res.json(result.rows[0]);
    }

    // Create new share
    const result = await db.query(
      `INSERT INTO lead_workspace_access 
       (lead_id, workspace_id, granted_by, access_level, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [leadId, workspaceId, req.user.id, accessLevel, expiresAt || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Get all workspaces a lead is shared with
const getLeadSharedWorkspaces = async (req, res, next) => {
  try {
    const { leadId } = req.params;

    const result = await db.query(
      `SELECT lwa.*, w.name as workspace_name, w.type as workspace_type,
              u.email as granted_by_email
       FROM lead_workspace_access lwa
       JOIN workgroups w ON w.id = lwa.workspace_id
       LEFT JOIN users u ON u.id = lwa.granted_by
       WHERE lwa.lead_id = $1
       AND (lwa.expires_at IS NULL OR lwa.expires_at > CURRENT_TIMESTAMP)
       ORDER BY lwa.granted_at DESC`,
      [leadId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Remove workspace access
const removeWorkspaceAccess = async (req, res, next) => {
  try {
    const { leadId, workspaceId } = req.params;

    const result = await db.query(
      'DELETE FROM lead_workspace_access WHERE lead_id = $1 AND workspace_id = $2 RETURNING id',
      [leadId, workspaceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workspace access not found' });
    }

    res.json({ message: 'Workspace access removed successfully' });
  } catch (err) {
    next(err);
  }
};

// Get all available workspaces for sharing
const getAvailableWorkspaces = async (req, res, next) => {
  try {
    const { leadId } = req.params;

    // Get workspaces that user is member of, excluding the lead's current workspace
    const result = await db.query(
      `SELECT DISTINCT w.id, w.name, w.type, w.description
       FROM workgroups w
       JOIN workgroup_members wm ON wm.workgroup_id = w.id
       WHERE wm.user_id = $1 
       AND w.org_id = $2
       AND w.id NOT IN (
         SELECT workspace_id FROM leads WHERE id = $3 AND workspace_id IS NOT NULL
         UNION
         SELECT workspace_id FROM lead_workspace_access WHERE lead_id = $3
       )
       ORDER BY w.name`,
      [req.user.id, req.user.orgId, leadId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  shareLeadWithWorkspace,
  getLeadSharedWorkspaces,
  removeWorkspaceAccess,
  getAvailableWorkspaces
};
