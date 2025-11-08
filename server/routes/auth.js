const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Company } = require('../models');
const { protect } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/signup
// @desc    Register first user (becomes admin) and create company
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, companyName, country, currency } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide first name, last name, email, and password'
      });
    }

    if (!companyName || !country || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Please provide company name, country, and currency'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain uppercase, lowercase, number, and special character'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if company name already exists
    const existingCompany = await Company.findOne({ where: { name: companyName.trim() } });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company name is already taken. Please choose a different name.'
      });
    }

    // Create company first
    const company = await Company.create({
      name: companyName.trim(),
      country,
      currency: currency.toUpperCase(),
      is_active: true
    });

    // The first user to register with a company becomes Admin of that company
    // Since we just created a new company, this user is the first and becomes Admin
    const role = 'Admin';

    // Create user with company association
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password_hash: password,
      role,
      company_id: company.id,
      hourly_rate: 0,
      is_active: true
    });

    // Generate token
    const token = generateToken(user.id);

    // Fetch user with company data
    const userWithCompany = await User.findByPk(user.id, {
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name', 'country', 'currency']
      }],
      attributes: { exclude: ['password_hash', 'reset_password_token', 'reset_password_expire'] }
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully! You are the company owner.',
      token,
      user: userWithCompany
    });
  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Fetch user with company data
    const userWithCompany = await User.findByPk(user.id, {
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name', 'country', 'currency']
      }],
      attributes: { exclude: ['password_hash', 'reset_password_token', 'reset_password_expire'] }
    });

    res.status(200).json({
      success: true,
      token,
      user: userWithCompany
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name', 'country', 'currency']
      }],
      attributes: { exclude: ['password_hash', 'reset_password_token', 'reset_password_expire'] }
    });

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set expire
    user.reset_password_token = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.reset_password_expire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.save();

    // Send email
    const emailResult = await sendPasswordResetEmail(user, resetToken);

    if (!emailResult.success) {
      user.reset_password_token = null;
      user.reset_password_expire = null;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing password reset'
    });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Hash the token from URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      where: {
        reset_password_token: resetPasswordToken,
        reset_password_expire: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password_hash = password;
    user.reset_password_token = null;
    user.reset_password_expire = null;

    await user.save();

    // Generate new token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error resetting password'
    });
  }
});

// @route   PUT /api/auth/update-password
// @desc    Update password (when logged in)
// @access  Private
router.put('/update-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findByPk(req.user.id);

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password_hash = newPassword;
    await user.save();

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating password'
    });
  }
});

module.exports = router;

