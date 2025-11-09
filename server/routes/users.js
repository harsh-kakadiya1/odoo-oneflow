const express = require('express');
const router = express.Router();
const { User, Company } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { generatePassword } = require('../utils/generatePassword');
const { sendWelcomeEmail } = require('../services/emailService');

// @route   GET /api/users
// @desc    Get users from same company (Admin sees all company users, PM sees only users they created)
// @access  Private (Admin, Project Manager, Sales/Finance)
router.get('/', protect, authorize('Admin', 'Project Manager', 'Sales/Finance'), async (req, res) => {
  try {
    const { role, search } = req.query;
    const { Op } = require('sequelize');
    
    // Get current user's company_id
    const currentUser = await User.findByPk(req.user.id);
    
    let where = { 
      is_active: true,
      company_id: currentUser.company_id // Only show users from same company
    };

    // Project Managers can only see users they created (within their company)
    if (req.user.role === 'Project Manager') {
      where.created_by = req.user.id;
    }

    if (role) {
      where.role = role;
    }

    if (search) {
      // Build search condition for first_name, last_name, and email
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash', 'reset_password_token', 'reset_password_expire'] },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'country', 'currency']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash', 'reset_password_token', 'reset_password_expire'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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

// @route   POST /api/users
// @desc    Create new user (Admin creates any role, PM with permission creates Team Members only)
// @access  Private (Admin, Project Manager with permission)
router.post('/', protect, authorize('Admin', 'Project Manager'), async (req, res) => {
  try {
    const { firstName, lastName, email, role, hourly_rate, can_manage_users } = req.body;

    // Check if Project Manager has permission to manage users
    if (req.user.role === 'Project Manager') {
      const pm = await User.findByPk(req.user.id);
      if (!pm.can_manage_users) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to manage users. Please contact your administrator.'
        });
      }
    }

    // Validate input
    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide first name, last name, email, and role'
      });
    }

    // Project Managers can only create Team Members
    if (req.user.role === 'Project Manager' && role !== 'Team Member') {
      return res.status(403).json({
        success: false,
        message: 'Project Managers can only create Team Member accounts'
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

    // Generate temporary password
    const temporaryPassword = generatePassword();

    // Get current user's company_id to associate new user with same company
    const currentUser = await User.findByPk(req.user.id);
    
    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password_hash: temporaryPassword,
      role,
      company_id: currentUser.company_id,
      created_by: req.user.id, // Track who created this user
      can_manage_users: req.user.role === 'Admin' && role === 'Project Manager' ? (can_manage_users || false) : false,
      hourly_rate: hourly_rate || 0,
      is_active: true
    });

    // Send welcome email with credentials
    const emailResult = await sendWelcomeEmail(user, temporaryPassword);

    if (!emailResult.success) {
      console.error('Failed to send welcome email:', emailResult.error);
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully. Credentials sent via email.',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        hourly_rate: user.hourly_rate
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (Admin can update anyone, PM can update users they created if they have permission)
// @access  Private (Admin or PM with permission or Self)
router.put('/:id', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    const currentUser = await User.findByPk(req.user.id);
    
    if (req.user.role === 'Admin') {
      // Admin can update anyone
    } else if (req.user.role === 'Project Manager') {
      // PM can only update users they created AND only if they have permission
      if (!currentUser.can_manage_users) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to manage users.'
        });
      }
      if (user.created_by !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update users you created'
        });
      }
    } else if (req.user.id !== user.id) {
      // Regular users can only update themselves
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    const { firstName, lastName, email, role, hourly_rate, can_manage_users } = req.body;

    // Only admin can change role, hourly_rate, and permissions
    if ((role || hourly_rate !== undefined || can_manage_users !== undefined) && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can change role, hourly rate, or permissions'
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (role && req.user.role === 'Admin') user.role = role;
    if (hourly_rate !== undefined && req.user.role === 'Admin') user.hourly_rate = hourly_rate;
    if (can_manage_users !== undefined && req.user.role === 'Admin') user.can_manage_users = can_manage_users;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        hourly_rate: user.hourly_rate
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user permanently (Admin can delete anyone, PM with permission can delete users they created)
// @access  Private (Admin or PM with permission)
router.delete('/:id', protect, authorize('Admin', 'Project Manager'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    const currentUser = await User.findByPk(req.user.id);
    
    if (req.user.role === 'Admin') {
      // Admin can delete anyone (except themselves)
      if (req.user.id === user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account'
        });
      }
    } else if (req.user.role === 'Project Manager') {
      // PM can only delete users they created AND only if they have permission
      if (!currentUser.can_manage_users) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to manage users.'
        });
      }
      if (user.created_by !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete users you created'
        });
      }
    }

    // Store user info for email notification
    const userEmail = user.email;
    const userName = `${user.firstName} ${user.lastName}`;

    // Hard delete - permanently remove from database
    await user.destroy();

    // Send deletion notification email
    const { sendUserDeletionEmail } = require('../services/emailService');
    try {
      await sendUserDeletionEmail(userEmail, userName);
    } catch (emailError) {
      console.error('Failed to send deletion notification email:', emailError);
      // Continue even if email fails
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully. Notification email sent.'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
});

module.exports = router;

