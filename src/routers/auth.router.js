import express from 'express';
import { refreshToken } from '../controllers/auth.controller.js';

const router = express.Router();

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', refreshToken);

export default router;

