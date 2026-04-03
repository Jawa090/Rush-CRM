const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Generic storage configuration
const createStorage = (uploadPath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, `../../uploads/${uploadPath}`);
      ensureUploadDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
};

// File filter for documents (PDF, DOC, DOCX, images)
const documentFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only documents and images are allowed (JPEG, PNG, PDF, DOC, DOCX)'));
  }
};

// File filter for spreadsheets (CSV, XLSX, XLS)
const spreadsheetFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only spreadsheet files are allowed (CSV, XLSX, XLS)'));
  }
};

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WEBP)'));
  }
};

// Allow all file types
const allFilesFilter = (req, file, cb) => {
  cb(null, true);
};

// Multer configurations for different use cases
const multerConfig = {
  // Employee documents (10MB limit)
  employees: multer({
    storage: createStorage('employees'),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: documentFilter,
  }),
  
  // Lead imports (10MB limit)
  imports: multer({
    storage: createStorage('imports'),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: spreadsheetFilter,
  }),
  
  // Workgroup files (50MB limit)
  workgroups: multer({
    storage: createStorage('workgroups'),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: allFilesFilter,
  }),
  
  // Drive files (100MB limit)
  drive: multer({
    storage: createStorage('drive'),
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: allFilesFilter,
  }),
  
  // Profile pictures (5MB limit)
  profiles: multer({
    storage: createStorage('profiles'),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
  }),
  
  // Generic documents (20MB limit)
  documents: multer({
    storage: createStorage('documents'),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: documentFilter,
  }),
};

module.exports = multerConfig;
