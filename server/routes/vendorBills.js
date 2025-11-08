const express = require('express');
const router = express.Router();
const { VendorBill, Project, PurchaseOrder } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

// @route   GET /api/vendor-bills
// @desc    Get all vendor bills
// @access  Private
router.get('/', protect, authorize('Admin', 'Sales/Finance', 'Project Manager'), async (req, res) => {
  try {
    const { project_id, status, vendor_name, search } = req.query;
    let where = {};

    if (project_id) {
      where.project_id = project_id;
    }

    if (status) {
      where.status = status;
    }

    if (vendor_name) {
      where.vendor_name = { [Op.like]: `%${vendor_name}%` };
    }

    if (search) {
      where[Op.or] = [
        { bill_number: { [Op.like]: `%${search}%` } },
        { vendor_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const vendorBills = await VendorBill.findAll({
      where,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
          attributes: ['id', 'po_number']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: vendorBills.length,
      vendorBills
    });
  } catch (error) {
    console.error('Get vendor bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching vendor bills'
    });
  }
});

// @route   GET /api/vendor-bills/:id
// @desc    Get single vendor bill
// @access  Private
router.get('/:id', protect, authorize('Admin', 'Sales/Finance', 'Project Manager'), async (req, res) => {
  try {
    const vendorBill = await VendorBill.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status']
        },
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
          attributes: ['id', 'po_number', 'amount']
        }
      ]
    });

    if (!vendorBill) {
      return res.status(404).json({
        success: false,
        message: 'Vendor bill not found'
      });
    }

    res.status(200).json({
      success: true,
      vendorBill
    });
  } catch (error) {
    console.error('Get vendor bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching vendor bill'
    });
  }
});

// @route   POST /api/vendor-bills
// @desc    Create new vendor bill
// @access  Private (Admin, Sales/Finance)
router.post('/', protect, authorize('Admin', 'Sales/Finance'), async (req, res) => {
  try {
    const { project_id, purchase_order_id, vendor_name, bill_number, amount, status, bill_date, due_date, description } = req.body;

    if (!vendor_name || !bill_number || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Vendor name, bill number, and amount are required'
      });
    }

    // Create vendor bill
    const vendorBill = await VendorBill.create({
      bill_number,
      project_id,
      purchase_order_id,
      vendor_name,
      amount,
      status: status || 'Draft',
      bill_date: bill_date || new Date(),
      due_date,
      description
    });

    // Fetch complete vendor bill
    const completeBill = await VendorBill.findByPk(vendorBill.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
          attributes: ['id', 'po_number']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Vendor bill created successfully',
      vendorBill: completeBill
    });
  } catch (error) {
    console.error('Create vendor bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating vendor bill'
    });
  }
});

// @route   PUT /api/vendor-bills/:id
// @desc    Update vendor bill
// @access  Private (Admin, Sales/Finance)
router.put('/:id', protect, authorize('Admin', 'Sales/Finance'), async (req, res) => {
  try {
    const vendorBill = await VendorBill.findByPk(req.params.id);

    if (!vendorBill) {
      return res.status(404).json({
        success: false,
        message: 'Vendor bill not found'
      });
    }

    const { project_id, purchase_order_id, vendor_name, bill_number, amount, status, bill_date, due_date, description } = req.body;

    // Update fields
    if (project_id !== undefined) vendorBill.project_id = project_id;
    if (purchase_order_id !== undefined) vendorBill.purchase_order_id = purchase_order_id;
    if (vendor_name) vendorBill.vendor_name = vendor_name;
    if (bill_number) vendorBill.bill_number = bill_number;
    if (amount) vendorBill.amount = amount;
    if (status) vendorBill.status = status;
    if (bill_date) vendorBill.bill_date = bill_date;
    if (due_date !== undefined) vendorBill.due_date = due_date;
    if (description !== undefined) vendorBill.description = description;

    await vendorBill.save();

    // Fetch updated vendor bill
    const updatedBill = await VendorBill.findByPk(vendorBill.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
          attributes: ['id', 'po_number']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Vendor bill updated successfully',
      vendorBill: updatedBill
    });
  } catch (error) {
    console.error('Update vendor bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating vendor bill'
    });
  }
});

// @route   DELETE /api/vendor-bills/:id
// @desc    Delete vendor bill
// @access  Private (Admin)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const vendorBill = await VendorBill.findByPk(req.params.id);

    if (!vendorBill) {
      return res.status(404).json({
        success: false,
        message: 'Vendor bill not found'
      });
    }

    await vendorBill.destroy();

    res.status(200).json({
      success: true,
      message: 'Vendor bill deleted successfully'
    });
  } catch (error) {
    console.error('Delete vendor bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting vendor bill'
    });
  }
});

module.exports = router;

