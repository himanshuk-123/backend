import { UserService, ValidationError, ConflictError } from "../service/user.service.js";
import { CartService } from "../service/cart.service.js";

const userServiceInstance = new UserService();
const cartService = new CartService();

/**
 * Create a new user
 * @route POST /api/users/register
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createUser = async (req, res) => {
  try {
    const result = await userServiceInstance.createUser(req.body);
    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });

  } catch (error) {
    console.error('Error in createUser controller:', error);

    // Handle validation errors
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: error.message
      });
    }

    // Handle conflict errors (user already exists)
    if (error instanceof ConflictError) {
      return res.status(409).json({
        success: false,
        message: "Conflict",
        error: error.message
      });
    }

    // Handle all other errors as internal server errors
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: "Something went wrong while creating the user"
    });
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await userServiceInstance.userRepository.findById(parseInt(id));
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user
    });

  } catch (error) {
    console.error('Error in getUserById controller:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: "Something went wrong while retrieving the user"
    });
  }
};

// ✅ UPDATE USER PROFILE
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const updatedUser = await userServiceInstance.updateProfile(userId, req.body);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });

  } catch (error) {
    console.error("Error in updateUserProfile:", error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
};


/**
 * Login user
 * @route POST /api/users/login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: "Email and password are required"
      });
    }

    const result = await userServiceInstance.loginUser(email, password);
    
    // Merge guest cart to user cart if guest_id is provided
    let mergedCart = null;
    if (result.user && result.user.user_id) {
      try {
        mergedCart = await cartService.mergeGuestCartToUser(result.user.user_id);
      } catch (cartError) {
        // Log error but don't fail login if cart merge fails
        console.error('Error merging guest cart on login:', cartError);
      }
    }

    // Add cart info to response if merged
    const responseData = {
      ...result,
      ...(mergedCart && { cart: mergedCart })
    };
    
    res.status(200).json({
      success: true,
      message: "Login successful" + (mergedCart ? " (guest cart merged)" : ""),
      data: responseData
    });

  } catch (error) {
    console.error('Error in loginUser controller:', error);

    // Handle validation errors
    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: "Login failed",
        error: error.message
      });
    }

    // Handle all other errors as internal server errors
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: "Something went wrong while logging in"
    });
  }
};

/**
 * Get current authenticated user profile
 * @route GET /api/users/me
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCurrentUser = async (req, res) => {
  try {
    // User information is attached by authenticate middleware
    const user = await userServiceInstance.userRepository.findById(req.user.user_id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: user
    });

  } catch (error) {
    console.error('Error in getCurrentUser controller:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: "Something went wrong while retrieving user profile"
    });
  }
};
