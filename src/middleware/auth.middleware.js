import { verifyAccessToken } from '../utils/jwt.util.js';
import { UserRepository } from '../repositories/user.repositories.js';

const userRepository = new UserRepository();

/**
 * Authentication middleware to verify JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.',
        error: 'No token provided'
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.',
        error: 'Token is missing'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: error.message || 'Invalid or expired token'
      });
    }

    // Verify user still exists and is not deleted
    const user = await userRepository.findById(decoded.user_id);
    
    if (!user || user.is_deleted) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: 'User not found or account has been deleted'
      });
    }

    // Attach user information to request object
    req.user = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (error) {
    console.error('Error in authenticate middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: 'Authentication process failed'
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        error: `You do not have permission to access this resource. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

