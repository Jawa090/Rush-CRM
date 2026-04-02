const db = require('../../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/drive');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true);
  }
});

// Get all folders
const getFolders = async (req, res, next) => {
  try {
    const { parent_id } = req.query;
    
    let query = `
      SELECT f.*, u.full_name as created_by_name,
             (SELECT COUNT(*) FROM drive_files WHERE folder_id = f.id AND is_deleted = false) as file_count,
             (SELECT COALESCE(SUM(file_size), 0) FROM drive_files WHERE folder_id = f.id AND is_deleted = false) as total_size
      FROM drive_folders f
      LEFT JOIN users u ON f.created_by = u.id
      WHERE f.org_id = $1 AND (f.is_deleted = false OR f.is_deleted IS NULL)
    `;
    
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (parent_id) {
      query += ` AND f.parent_folder_id = $${paramIndex}`;
      params.push(parent_id);
    } else {
      query += ` AND f.parent_folder_id IS NULL`;
    }

    query += ` ORDER BY f.name ASC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Get all files
const getFiles = async (req, res, next) => {
  try {
    const { folder_id, recent } = req.query;
    
    let query = `
      SELECT f.*, u.full_name as created_by_name,
             fo.name as folder_name
      FROM drive_files f
      LEFT JOIN users u ON f.created_by = u.id
      LEFT JOIN drive_folders fo ON f.folder_id = fo.id
      WHERE f.org_id = $1 AND f.is_deleted = false
    `;
    
    const params = [req.user.orgId];
    let paramIndex = 2;

    if (folder_id) {
      query += ` AND f.folder_id = $${paramIndex}`;
      params.push(folder_id);
      paramIndex++;
    }

    if (recent === 'true') {
      query += ` ORDER BY f.updated_at DESC LIMIT 20`;
    } else {
      query += ` ORDER BY f.name ASC`;
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Create folder
const createFolder = async (req, res, next) => {
  try {
    const { name, parent_folder_id, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    // Build path
    let path = name;
    if (parent_folder_id) {
      const parentResult = await db.query(
        'SELECT path FROM drive_folders WHERE id = $1 AND org_id = $2',
        [parent_folder_id, req.user.orgId]
      );
      if (parentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Parent folder not found' });
      }
      path = `${parentResult.rows[0].path}/${name}`;
    }

    // Check if folder with same name exists in same parent
    const existingResult = await db.query(
      'SELECT id FROM drive_folders WHERE name = $1 AND parent_folder_id = $2 AND org_id = $3',
      [name, parent_folder_id || null, req.user.orgId]
    );

    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'Folder with this name already exists' });
    }

    const result = await db.query(
      `INSERT INTO drive_folders (org_id, created_by, name, parent_folder_id, color, path)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.orgId, req.user.id, name.trim(), parent_folder_id || null, color || 'folder-blue', path]
    );

    // Log activity
    await db.query(
      `INSERT INTO drive_activities (org_id, user_id, folder_id, activity_type, activity_data)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.orgId, req.user.id, result.rows[0].id, 'created', { folder_name: name }]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Upload file
const uploadFile = async (req, res, next) => {
  try {
    console.log('Upload request received:', req.file, req.body);
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { folder_id } = req.body;
    const file = req.file;

    console.log('File details:', {
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path
    });

    // Verify folder exists if provided
    if (folder_id) {
      const folderResult = await db.query(
        'SELECT id FROM drive_folders WHERE id = $1 AND org_id = $2',
        [folder_id, req.user.orgId]
      );
      if (folderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Folder not found' });
      }
    }

    const result = await db.query(
      `INSERT INTO drive_files (org_id, created_by, folder_id, name, original_name, file_type, file_size, mime_type, file_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.user.orgId,
        req.user.id,
        folder_id || null,
        file.originalname,
        file.originalname,
        path.extname(file.originalname).toLowerCase(),
        file.size,
        file.mimetype,
        file.path
      ]
    );

    // Create initial version
    await db.query(
      `INSERT INTO drive_file_versions (file_id, version_number, file_path, file_size, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [result.rows[0].id, 1, file.path, file.size, req.user.id]
    );

    // Log activity
    await db.query(
      `INSERT INTO drive_activities (org_id, user_id, file_id, activity_type, activity_data)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.orgId, req.user.id, result.rows[0].id, 'created', { file_name: file.originalname }]
    );

    console.log('File uploaded successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Upload error:', err);
    next(err);
  }
};

// Delete folder
const deleteFolder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if folder exists and belongs to org
    const folderResult = await db.query(
      'SELECT * FROM drive_folders WHERE id = $1 AND org_id = $2',
      [id, req.user.orgId]
    );

    if (folderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const folder = folderResult.rows[0];

    // Check if folder has subfolders or files
    const hasContent = await db.query(
      `SELECT 
         (SELECT COUNT(*) FROM drive_folders WHERE parent_folder_id = $1) as subfolder_count,
         (SELECT COUNT(*) FROM drive_files WHERE folder_id = $1 AND is_deleted = false) as file_count`,
      [id]
    );

    const { subfolder_count, file_count } = hasContent.rows[0];
    
    if (parseInt(subfolder_count) > 0 || parseInt(file_count) > 0) {
      return res.status(400).json({ error: 'Cannot delete folder that contains files or subfolders' });
    }

    // Delete folder
    await db.query('DELETE FROM drive_folders WHERE id = $1', [id]);

    // Log activity
    await db.query(
      `INSERT INTO drive_activities (org_id, user_id, activity_type, activity_data)
       VALUES ($1, $2, $3, $4)`,
      [req.user.orgId, req.user.id, 'deleted', { folder_name: folder.name, folder_id: id }]
    );

    res.json({ message: 'Folder deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete file (move to trash)
const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE drive_files 
       SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND org_id = $2 AND is_deleted = false
       RETURNING *`,
      [id, req.user.orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Log activity
    await db.query(
      `INSERT INTO drive_activities (org_id, user_id, file_id, activity_type, activity_data)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.orgId, req.user.id, id, 'deleted', { file_name: result.rows[0].name }]
    );

    res.json({ message: 'File moved to trash' });
  } catch (err) {
    next(err);
  }
};

// Get recent activities
const getRecentActivities = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT a.*, u.full_name as user_name, f.name as file_name, fo.name as folder_name
       FROM drive_activities a
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN drive_files f ON a.file_id = f.id
       LEFT JOIN drive_folders fo ON a.folder_id = fo.id
       WHERE a.org_id = $1
       ORDER BY a.created_at DESC
       LIMIT 50`,
      [req.user.orgId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Search files and folders
const search = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchTerm = `%${q.trim()}%`;

    // Search folders
    const foldersResult = await db.query(
      `SELECT 'folder' as type, id, name, created_at, updated_at, path
       FROM drive_folders 
       WHERE org_id = $1 AND name ILIKE $2
       ORDER BY name ASC`,
      [req.user.orgId, searchTerm]
    );

    // Search files
    const filesResult = await db.query(
      `SELECT 'file' as type, id, name, file_type, file_size, created_at, updated_at
       FROM drive_files 
       WHERE org_id = $1 AND is_deleted = false AND name ILIKE $2
       ORDER BY name ASC`,
      [req.user.orgId, searchTerm]
    );

    const results = [
      ...foldersResult.rows,
      ...filesResult.rows
    ];

    res.json(results);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFolders,
  getFiles,
  createFolder,
  uploadFile: [upload.single('file'), uploadFile],
  deleteFolder,
  deleteFile,
  getRecentActivities,
  search
};
