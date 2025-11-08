const express = require('express');
const router = express.Router();
const { PurchaseOrder, Project } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

// Generate unique PO number
const generatePONumber = async () => {
  const prefix = 'PO';
  const year = new Date().getFullYear();
  
  const lastPO = await PurchaseOrder.findOne({
    where: {
      po_number: {
        [Op.like]: `${prefix}-${year}-%`
      }
    },
    order: [['created_at', 'DESC']]
  });

  let nextNumber = 1;
  if (lastPO) {
    const lastNumber = parseInt(lastPO.po_number.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}-${year}-${String(nextNumber).padStart(4, '0')}`;
};

// @route   GET /api/purchase-orders
// @desc    Get all purchase orders
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
        { po_number: { [Op.like]: `%${search}%` } },
        { vendor_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const purchaseOrders = await PurchaseOrder.findAll({
      where,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: purchaseOrders.length,
      purchaseOrders
    });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching purchase orders'
    });
  }
});

// @route   GET /api/purchase-orders/:id
// @desc    Get single purchase order
// @access  Private
router.get('/:id', protect, authorize('Admin', 'Sales/Finance', 'Project Manager'), async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status']
        }
      ]
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    res.status(200).json({
      success: true,
      purchaseOrder
    });
  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching purchase order'
    });
  }
});

// @route   POST /api/purchase-orders
// @desc    Create new purchase order
// @access  Private (Admin, Sales/Finance, PM)
router.post('/', protect, authorize('Admin', 'Sales/Finance', 'Project Manager'), async (req, res) => {
  try {
    const { project_id, vendor_name, vendor_email, amount, status, order_date, description } = req.body;

    if (!vendor_name || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Vendor name and amount are required'
      });
    }

    // Generate PO number
    const po_number = await generatePONumber();

    // Create purchase order
    const purchaseOrder = await PurchaseOrder.create({
      po_number,
      project_id,
      vendor_name,
      vendor_email,
      amount,
      status: status || 'Draft',
      order_date: order_date || new Date(),
      description
    });

    // Fetch complete purchase order
    const completePO = await PurchaseOrder.findByPk(purchaseOrder.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      purchaseOrder: completePO
    });
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating purchase order'
    });
  }
});

// @route   PUT /api/purchase-orders/:id
// @desc    Update purchase order
// @access  Private (Admin, Sales/Finance, PM)
router.put('/:id', protect, authorize('Admin', 'Sales/Finance', 'Project Manager'), async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByPk(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    const { project_id, vendor_name, vendor_email, amount, status, order_date, description } = req.body;

    // Update fields
    if (project_id !== undefined) purchaseOrder.project_id = project_id;
    if (vendor_name) purchaseOrder.vendor_name = vendor_name;
    if (vendor_email !== undefined) purchaseOrder.vendor_email = vendor_email;
    if (amount) purchaseOrder.amount = amount;
    if (status) purchaseOrder.status = status;
    if (order_date) purchaseOrder.order_date = order_date;
    if (description !== undefined) purchaseOrder.description = description;

    await purchaseOrder.save();

    // Fetch updated purchase order
    const updatedPO = await PurchaseOrder.findByPk(purchaseOrder.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Purchase order updated successfully',
      purchaseOrder: updatedPO
    });
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating purchase order'
    });
  }
});

// @route   DELETE /api/purchase-orders/:id
// @desc    Delete purchase order
// @access  Private (Admin)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByPk(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    await purchaseOrder.destroy();

    res.status(200).json({
      success: true,
      message: 'Purchase order deleted successfully'
    });
  } catch (error) {
    console.error('Delete purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting purchase order'
    });
  }
});

module.exports = router;

