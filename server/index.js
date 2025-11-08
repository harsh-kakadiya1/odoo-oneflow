const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/database');
const app = express();

// Connect to database
connectDB();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads', 'receipts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const salesOrderRoutes = require('./routes/salesOrders');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const customerInvoiceRoutes = require('./routes/customerInvoices');
const vendorBillRoutes = require('./routes/vendorBills');
const expenseRoutes = require('./routes/expenses');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/customer-invoices', customerInvoiceRoutes);
app.use('/api/vendor-bills', vendorBillRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OneFlow API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 OneFlow Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
});

// Socket.IO setup for real-time notifications
const socketIO = require('socket.io');
const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('📱 New client connected:', socket.id);

  // Join user-specific room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    console.log('📱 Client disconnected:', socket.id);
  });
});

// Make io available globally
global.io = io;

module.exports = app;

