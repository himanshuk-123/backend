import { verifyRefreshToken, generateTokenPair } from '../utils/jwt.util.js';
import { UserRepository } from '../repositories/user.repositories.js';
import { ValidationError } from '../service/user.service.js';

const userRepository = new UserRepository();

/**
 * Refresh access token using refresh token
 * @route POST /api/auth/refresh
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: "Refresh token is required"
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token refresh failed",
        error: error.message || "Invalid or expired refresh token"
      });
    }

    // Verify user still exists and is not deleted
    const user = await userRepository.findById(decoded.user_id);
    
    if (!user || user.is_deleted) {
      return res.status(401).json({
        success: false,
        message: "Token refresh failed",
        error: "User not found or account has been deleted"
      });
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      user_id: user.user_id,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });

  } catch (error) {
    console.error('Error in refreshToken controller:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: "Something went wrong while refreshing token"
    });
  }
};

