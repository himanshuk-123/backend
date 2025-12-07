/**
 * Input validation middleware for user registration
 */
export const validateUserRegistration = (req, res, next) => {
    const { name, email, password, phone_number } = req.body;
    const errors = [];

    // Check required fields
    if (!name) errors.push('Name is required');
    if (!email) errors.push('Email is required');
    if (!password) errors.push('Password is required');
    if (!phone_number) errors.push('Phone number is required');

    // Basic format validations
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format');
    }

    if (phone_number && !/^[6-9]\d{9}$/.test(phone_number)) {
        errors.push('Invalid phone number format');
    }

    if (password && password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

/**
 * Sanitize user input
 */
export const sanitizeUserInput = (req, res, next) => {
    if (req.body.name) {
        req.body.name = req.body.name.trim();
    }
    
    if (req.body.email) {
        req.body.email = req.body.email.toLowerCase().trim();
    }
    
    if (req.body.phone_number) {
        req.body.phone_number = req.body.phone_number.trim();
    }

    next();
};