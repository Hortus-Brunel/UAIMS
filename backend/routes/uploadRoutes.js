const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { authenticate } = require('../middlewares/auth');
const { successResponse } = require('../utils/response');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename while preserving the original extension
    const ext = path.extname(file.originalname);
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// All upload routes require authentication
router.use(authenticate);

// POST /api/upload
router.post('/', upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Build absolute URL for the uploaded file.
    // Normalize any API base (for example /api or http://host/api) so we end up at /uploads/...
    const normalizeBaseUrl = (value) => {
      if (!value) return '';
      return value.replace(/\/$/, '').replace(/\/api$/i, '');
    };

    let fileUrl;
    if (process.env.BACKEND_URL) {
      const baseUrl = normalizeBaseUrl(process.env.BACKEND_URL);
      fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    } else {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:5000';
      fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    // Truncate fileName to 255 chars and fileType to 50 chars to match DB schema
    const fileName = req.file.originalname.substring(0, 255);
    const fileType = (req.file.mimetype || '').substring(0, 50);

    const data = {
      fileName,
      fileUrl: fileUrl,
      fileType,
      fileSizeBytes: req.file.size,
    };

    return successResponse(res, 'File uploaded successfully.', data, 201);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
