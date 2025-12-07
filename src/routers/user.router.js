import express from 'express';
import { createUser, getUserById, loginUser, getCurrentUser, updateUserProfile } from '../controllers/user.controller.js';
import { uploadUserImage } from '../controllers/image.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload, handleUploadError } from '../middleware/upload.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', createUser);

/**
 * @route   POST /api/users/login
 * @desc    Login user and get JWT tokens
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/users/me
 * @desc    Get current authenticated user profile
 * @access  Private (requires authentication)
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @route   POST /api/users/upload-image
 * @desc    Upload user profile image
 * @access  Private (requires authentication)
 */
router.post('/upload-image', authenticate, upload.single('image'), handleUploadError, uploadUserImage);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (requires authentication)
 */
router.get('/:id', authenticate, getUserById);
router.put('/update-profile', authenticate, updateUserProfile);

export default router;
