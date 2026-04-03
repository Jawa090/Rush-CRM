const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, requireOrg } = require('../../middleware/auth');
const employeeController = require('../../controllers/hrms/employeeController');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/employees');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and Word documents are allowed'));
    }
  }
});

router.use(auth, requireOrg);

router.get('/', employeeController.getAll);
router.get('/stats', employeeController.getStats);
router.get('/:id', employeeController.getById);
router.get('/:id/documents', employeeController.getDocuments);
router.post('/', employeeController.create);
router.post('/:id/documents', upload.single('file'), employeeController.uploadDocument);
router.put('/:id', employeeController.update);
router.delete('/:id', employeeController.remove);
router.delete('/:id/documents/:docId', employeeController.deleteDocument);

module.exports = router;
