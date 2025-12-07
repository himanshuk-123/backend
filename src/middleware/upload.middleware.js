import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for memory storage (we'll upload directly to Azure)
const storage = multer.memoryStorage();

// File filter - only accept images
const fileFilter = (req, file, cb) => {
  // Accept image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

/**
 * Generate unique file name
 * @param {string} originalName - Original file name
 * @param {string} prefix - Prefix for the file (e.g., 'user', 'shop', 'product')
 * @returns {string} Unique file name
 */
export const generateFileName = (originalName, prefix = 'file') => {
  const ext = originalName.split('.').pop();
  const uniqueId = uuidv4();
  const timestamp = Date.now();
  return `${prefix}/${timestamp}-${uniqueId}.${ext}`;
};

/**
 * Error handler for multer errors
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large',
        error: 'File size must be less than 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Upload error',
      error: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: 'Upload error',
      error: err.message
    });
  }
  
  next();
};

