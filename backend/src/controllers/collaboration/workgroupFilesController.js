const db = require('../../config/database');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/workgroups');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true);
  }
});

// Get workgroup files
const getWorkgroupFiles = async (req, res, next) => {
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
        wf.*,
        u.full_name as uploaded_by_name,
        u.email as uploaded_by_email
      FROM workgroup_files wf
      JOIN users u ON wf.uploaded_by = u.id
      WHERE wf.workgroup_id = $1 AND wf.is_deleted = FALSE
      ORDER BY wf.created_at DESC
    `;
    
    const result = await db.query(query, [workgroupId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Upload workgroup file
const uploadWorkgroupFile = async (req, res, next) => {
  try {
    const { workgroupId } = req.params;
    
    // Check if user is member
    const memberQuery = `
      SELECT id FROM workgroup_members 
      WHERE workgroup_id = $1 AND user_id = $2
    `;
    const memberResult = await db.query(memberQuery, [workgroupId, req.user.id]);
    
    if (memberResult.rows.length === 0) {
      return res.status(403).json({ error: 'You must be a member to upload files' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileId = uuidv4();
    const insertQuery = `
      INSERT INTO workgroup_files (
        id, workgroup_id, name, file_size, 
        file_type, file_path, original_name, uploaded_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const result = await db.query(insertQuery, [
      fileId,
      workgroupId,
      req.file.filename,
      req.file.size,
      req.file.mimetype,
      req.file.path,
      req.file.originalname,
      req.user.id
    ]);
    
    // Create notification
    await createNotification(workgroupId, req.user.id, 'file_shared', 
      `${req.user.full_name || req.user.email} shared a file: ${req.file.originalname}`,
      { file_id: fileId, file_name: req.file.originalname }
    );
    
    // Get file with user info
    const fileQuery = `
      SELECT 
        wf.*,
        u.full_name as uploaded_by_name,
        u.email as uploaded_by_email
      FROM workgroup_files wf
      JOIN users u ON wf.uploaded_by = u.id
      WHERE wf.id = $1
    `;
    const fileResult = await db.query(fileQuery, [fileId]);
    
    res.status(201).json(fileResult.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Delete workgroup file
const deleteWorkgroupFile = async (req, res, next) => {
  try {
    const { workgroupId, fileId } = req.params;
    
    // Check if user owns the file or is admin
    const fileQuery = `
      SELECT wf.*, wm.role
      FROM workgroup_files wf
      LEFT JOIN workgroup_members wm ON wf.workgroup_id = wm.workgroup_id AND wm.user_id = $1
      WHERE wf.id = $2 AND wf.workgroup_id = $3
    `;
    const fileResult = await db.query(fileQuery, [req.user.id, fileId, workgroupId]);
    
    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const file = fileResult.rows[0];
    
    if (file.uploaded_by !== req.user.id && !['owner', 'admin'].includes(file.role)) {
      return res.status(403).json({ error: 'You can only delete your own files or be an admin' });
    }
    
    // Soft delete
    const deleteQuery = `
      UPDATE workgroup_files 
      SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await db.query(deleteQuery, [fileId]);
    
    // Delete physical file
    try {
      if (fs.existsSync(file.file_path)) {
        fs.unlinkSync(file.file_path);
      }
    } catch (fsErr) {
      console.error('Error deleting physical file:', fsErr);
    }
    
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Download workgroup file
const downloadWorkgroupFile = async (req, res, next) => {
  try {
    const { workgroupId, fileId } = req.params;
    
    // Check if user has access to workgroup
    const accessQuery = `
      SELECT w.is_private, wm.user_id
      FROM workgroups w
      LEFT JOIN workgroup_members wm ON w.id = wm.workgroup_id AND wm.user_id = $1
      WHERE w.id = $2
    `;
    const accessResult = await db.query(accessQuery, [req.user.id, workgroupId]);
    
    if (accessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workgroup not found' });
    }
    
    if (accessResult.rows[0].is_private && !accessResult.rows[0].user_id) {
      return res.status(403).json({ error: 'Access denied to private workgroup' });
    }
    
    // Get file info
    const fileQuery = `
      SELECT * FROM workgroup_files 
      WHERE id = $1 AND workgroup_id = $2 AND is_deleted = FALSE
    `;
    const fileResult = await db.query(fileQuery, [fileId, workgroupId]);
    
    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const file = fileResult.rows[0];
    
    // Check if file exists on disk
    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }
    
    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.setHeader('Content-Type', file.file_type || 'application/octet-stream');
    res.setHeader('Content-Length', file.file_size);
    
    // Stream the file
    const fileStream = fs.createReadStream(file.file_path);
    fileStream.pipe(res);
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
  getWorkgroupFiles,
  uploadWorkgroupFile: [upload.single('file'), uploadWorkgroupFile],
  deleteWorkgroupFile,
  downloadWorkgroupFile
};
