import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repositories.js';
import { generateTokenPair } from '../utils/jwt.util.js';

// Custom error classes for better error handling
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

export class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

export class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Validate user input data
   * @param {Object} userData - User registration data
   * @throws {ValidationError} When validation fails
   */
  validateUserData(userData) {
    const { name, email, password, phone_number } = userData;

    // Required fields validation
    if (!name || !email || !password || !phone_number) {
      throw new ValidationError('All fields (name, email, password, phone_number) are required');
    }

    // Name validation
    if (name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters long');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Please provide a valid email address');
    }

    // Phone number validation (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone_number)) {
      throw new ValidationError('Please provide a valid 10-digit Indian phone number');
    }

    // Password validation
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    // if (!passwordRegex.test(password)) {
    //   throw new ValidationError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    // }
  }

  /**
   * Create a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Created user without password
   * @throws {ValidationError|ConflictError} When validation fails or user exists
   */
  async createUser(userData) {
    try {
      // Validate input data
      this.validateUserData(userData);

      const { name, email, password, phone_number, role = 'customer' } = userData;

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email.toLowerCase());
      if (existingUser && !existingUser.is_deleted) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12; // Increased from 10 for better security
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Prepare user data
      const newUserData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash,
        phone_number: phone_number.trim(),
        role: role.toLowerCase()
      };

      // Create user in database
      const createdUser = await this.userRepository.createUser(newUserData);

        // Generate JWT tokens for new user
      const tokens = generateTokenPair({
        user_id: createdUser.user_id,
        email: newUserData.email,
        role: newUserData.role
      });

      // Return user data with tokens (without sensitive information)
      return {
        user: {
          user_id: createdUser.user_id,
          name: newUserData.name,
          email: newUserData.email,
          phone_number: newUserData.phone_number,
          role: newUserData.role,
          image_url: createdUser.image_url || null,
          created_at: createdUser.created_at
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      };

    } catch (error) {
      // Re-throw custom errors as-is
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      
      // Log unexpected errors
      console.error('Unexpected error in createUser:', error);
      throw new Error('Failed to create user. Please try again later.');
    }
  }

  async updateProfile(userId, data) {

  if (!userId) {
    throw new ValidationError("User ID required");
  }

  if (!data.name) {
    throw new ValidationError("Name is required");
  }

  const updatedUser = await this.userRepository.updateUserProfile(userId, data);

  if (!updatedUser) {
    throw new Error("Profile update failed");
  }

  return updatedUser;
}

  async loginUser(email, password) {
    try {
      // Validate input
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      // Find user by email
      const user = await this.userRepository.findByEmail(email.toLowerCase());
      if (!user || user.is_deleted) {
        throw new ValidationError('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new ValidationError('Invalid email or password');
      }

      // Generate JWT tokens
      const tokens = generateTokenPair({
        user_id: user.user_id,
        email: user.email,
        role: user.role
      });

      // Return user data with tokens (without sensitive information)
      return {
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          phone_number: user.phone_number,
          role: user.role,
          image_url: user.image_url || null,
          created_at: user.created_at
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      };

    } catch (error) {
      // Re-throw custom errors as-is
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }

      // Log unexpected errors
      console.error('Unexpected error in loginUser:', error);
      throw new Error('Failed to login user. Please try again later.');
    }
  }
}
