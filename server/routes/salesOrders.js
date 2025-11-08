const express = require('express');
const router = express.Router();
const { SalesOrder, Project } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

// Generate unique SO number
const generateSONumber = async () => {
  const prefix = 'SO';
  const year = new Date().getFullYear();
  
  const lastSO = await SalesOrder.findOne({
    where: {
      so_number: {
        [Op.like]: `${prefix}-${year}-%`
      }
    },
    order: [['created_at', 'DESC']]
  });

  let nextNumber = 1;
  if (lastSO) {
    const lastNumber = parseInt(lastSO.so_number.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}-${year}-${String(nextNumber).padStart(4, '0')}`;
};

// @route   GET /api/sales-orders
// @desc    Get all sales orders
// @access  Private (Admin, Sales/Finance, PM)
router.get('/', protect, authorize('Admin', 'Sales/Finance', 'Project Manager'), async (req, res) => {
  try {
    const { project_id, status, customer_name, search } = req.query;
    let where = {};

    if (project_id) {
      where.project_id = project_id;
    }

    if (status) {
      where.status = status;
    }

    if (customer_name) {
      where.customer_name = { [Op.like]: `%${customer_name}%` };
    }

    if (search) {
      where[Op.or] = [
        { so_number: { [Op.like]: `%${search}%` } },
        { customer_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const salesOrders = await SalesOrder.findAll({
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
      count: salesOrders.length,
      salesOrders
    });
  } catch (error) {
    console.error('Get sales orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sales orders'
    });
  }
});

// @route   GET /api/sales-orders/:id
// @desc    Get single sales order
// @access  Private
router.get('/:id', protect, authorize('Admin', 'Sales/Finance', 'Project Manager'), async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status']
        }
      ]
    });

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sales order not found'
      });
    }

    res.status(200).json({
      success: true,
      salesOrder
    });
  } catch (error) {
    console.error('Get sales order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sales order'
    });
  }
});

// @route   POST /api/sales-orders
// @desc    Create new sales order
// @access  Private (Admin, Sales/Finance)
router.post('/', protect, authorize('Admin', 'Sales/Finance'), async (req, res) => {
  try {
    const { project_id, customer_name, customer_email, amount, status, order_date, description } = req.body;

    if (!customer_name || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and amount are required'
      });
    }

    // Generate SO number
    const so_number = await generateSONumber();

    // Create sales order
    const salesOrder = await SalesOrder.create({
      so_number,
      project_id,
      customer_name,
      customer_email,
      amount,
      status: status || 'Draft',
      order_date: order_date || new Date(),
      description
    });

    // Fetch complete sales order
    const completeSO = await SalesOrder.findByPk(salesOrder.id, {
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
      message: 'Sales order created successfully',
      salesOrder: completeSO
    });
  } catch (error) {
    console.error('Create sales order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating sales order'
    });
  }
});

// @route   PUT /api/sales-orders/:id
// @desc    Update sales order
// @access  Private (Admin, Sales/Finance)
router.put('/:id', protect, authorize('Admin', 'Sales/Finance'), async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findByPk(req.params.id);

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sales order not found'
      });
    }

    const { project_id, customer_name, customer_email, amount, status, order_date, description } = req.body;

    // Update fields
    if (project_id !== undefined) salesOrder.project_id = project_id;
    if (customer_name) salesOrder.customer_name = customer_name;
    if (customer_email !== undefined) salesOrder.customer_email = customer_email;
    if (amount) salesOrder.amount = amount;
    if (status) salesOrder.status = status;
    if (order_date) salesOrder.order_date = order_date;
    if (description !== undefined) salesOrder.description = description;

    await salesOrder.save();

    // Fetch updated sales order
    const updatedSO = await SalesOrder.findByPk(salesOrder.id, {
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
      message: 'Sales order updated successfully',
      salesOrder: updatedSO
    });
  } catch (error) {
    console.error('Update sales order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating sales order'
    });
  }
});

// @route   DELETE /api/sales-orders/:id
// @desc    Delete sales order
// @access  Private (Admin)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findByPk(req.params.id);

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sales order not found'
      });
    }

    await salesOrder.destroy();

    res.status(200).json({
      success: true,
      message: 'Sales order deleted successfully'
    });
  } catch (error) {
    console.error('Delete sales order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting sales order'
    });
  }
});

module.exports = router;

