const express = require('express');
const router = express.Router();
const { Company, User } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for logo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'company-logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
    }
  }
});

// @route   GET /api/companies/:id
// @desc    Get company details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.user.id);
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Users can only view their own company
    if (company.id !== currentUser.company_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this company'
      });
    }

    res.status(200).json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching company'
    });
  }
});

// @route   PUT /api/companies/:id
// @desc    Update company details (Admin only)
// @access  Private (Admin)
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.user.id);
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Admin can only update their own company
    if (company.id !== currentUser.company_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this company'
      });
    }

    const { name, country, currency, address } = req.body;

    // Update fields
    if (name) company.name = name;
    if (country) company.country = country;
    if (currency) company.currency = currency;
    if (address !== undefined) company.address = address;

    await company.save();

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      company
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating company'
    });
  }
});

// @route   POST /api/companies/:id/logo
// @desc    Upload company logo (Admin only)
// @access  Private (Admin)
router.post('/:id/logo', protect, authorize('Admin'), upload.single('logo'), async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.user.id);
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Admin can only update their own company
    if (company.id !== currentUser.company_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this company'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Delete old logo if exists
    if (company.logo) {
      const oldLogoPath = path.join(__dirname, '../uploads/logos', path.basename(company.logo));
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    // Update logo path
    company.logo = `/uploads/logos/${req.file.filename}`;
    await company.save();

    res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      company
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading logo'
    });
  }
});

module.exports = router;

