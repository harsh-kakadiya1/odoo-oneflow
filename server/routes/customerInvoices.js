const express = require('express');
const router = express.Router();
const { CustomerInvoice, Project, SalesOrder } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

// Generate unique Invoice number
const generateInvoiceNumber = async () => {
  const prefix = 'INV';
  const year = new Date().getFullYear();
  
  const lastInvoice = await CustomerInvoice.findOne({
    where: {
      invoice_number: {
        [Op.like]: `${prefix}-${year}-%`
      }
    },
    order: [['created_at', 'DESC']]
  });

  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoice_number.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}-${year}-${String(nextNumber).padStart(4, '0')}`;
};

// @route   GET /api/customer-invoices
// @desc    Get all customer invoices
// @access  Private
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
        { invoice_number: { [Op.like]: `%${search}%` } },
        { customer_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const customerInvoices = await CustomerInvoice.findAll({
      where,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: SalesOrder,
          as: 'salesOrder',
          attributes: ['id', 'so_number']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: customerInvoices.length,
      customerInvoices
    });
  } catch (error) {
    console.error('Get customer invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching customer invoices'
    });
  }
});

// @route   GET /api/customer-invoices/:id
// @desc    Get single customer invoice
// @access  Private
router.get('/:id', protect, authorize('Admin', 'Sales/Finance', 'Project Manager'), async (req, res) => {
  try {
    const customerInvoice = await CustomerInvoice.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status']
        },
        {
          model: SalesOrder,
          as: 'salesOrder',
          attributes: ['id', 'so_number', 'amount']
        }
      ]
    });

    if (!customerInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Customer invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      customerInvoice
    });
  } catch (error) {
    console.error('Get customer invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching customer invoice'
    });
  }
});

// @route   POST /api/customer-invoices
// @desc    Create new customer invoice
// @access  Private (Admin, Sales/Finance, PM)
router.post('/', protect, authorize('Admin', 'Sales/Finance', 'Project Manager'), async (req, res) => {
  try {
    const { project_id, sales_order_id, customer_name, amount, status, invoice_date, due_date, description } = req.body;

    if (!customer_name || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and amount are required'
      });
    }

    // Generate invoice number
    const invoice_number = await generateInvoiceNumber();

    // Create customer invoice
    const customerInvoice = await CustomerInvoice.create({
      invoice_number,
      project_id,
      sales_order_id,
      customer_name,
      amount,
      status: status || 'Draft',
      invoice_date: invoice_date || new Date(),
      due_date,
      description
    });

    // Fetch complete customer invoice
    const completeInvoice = await CustomerInvoice.findByPk(customerInvoice.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: SalesOrder,
          as: 'salesOrder',
          attributes: ['id', 'so_number']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Customer invoice created successfully',
      customerInvoice: completeInvoice
    });
  } catch (error) {
    console.error('Create customer invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating customer invoice'
    });
  }
});

// @route   PUT /api/customer-invoices/:id
// @desc    Update customer invoice
// @access  Private (Admin, Sales/Finance, PM)
router.put('/:id', protect, authorize('Admin', 'Sales/Finance', 'Project Manager'), async (req, res) => {
  try {
    const customerInvoice = await CustomerInvoice.findByPk(req.params.id);

    if (!customerInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Customer invoice not found'
      });
    }

    const { project_id, sales_order_id, customer_name, amount, status, invoice_date, due_date, description } = req.body;

    // Update fields
    if (project_id !== undefined) customerInvoice.project_id = project_id;
    if (sales_order_id !== undefined) customerInvoice.sales_order_id = sales_order_id;
    if (customer_name) customerInvoice.customer_name = customer_name;
    if (amount) customerInvoice.amount = amount;
    if (status) customerInvoice.status = status;
    if (invoice_date) customerInvoice.invoice_date = invoice_date;
    if (due_date !== undefined) customerInvoice.due_date = due_date;
    if (description !== undefined) customerInvoice.description = description;

    await customerInvoice.save();

    // Fetch updated customer invoice
    const updatedInvoice = await CustomerInvoice.findByPk(customerInvoice.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: SalesOrder,
          as: 'salesOrder',
          attributes: ['id', 'so_number']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Customer invoice updated successfully',
      customerInvoice: updatedInvoice
    });
  } catch (error) {
    console.error('Update customer invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating customer invoice'
    });
  }
});

// @route   DELETE /api/customer-invoices/:id
// @desc    Delete customer invoice
// @access  Private (Admin)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const customerInvoice = await CustomerInvoice.findByPk(req.params.id);

    if (!customerInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Customer invoice not found'
      });
    }

    await customerInvoice.destroy();

    res.status(200).json({
      success: true,
      message: 'Customer invoice deleted successfully'
    });
  } catch (error) {
    console.error('Delete customer invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting customer invoice'
    });
  }
});

module.exports = router;

