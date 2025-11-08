# OneFlow - Complete Project Setup Guide

This guide provides detailed instructions for setting up and running the OneFlow Project Management System.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup - What's Done & What's Needed](#frontend-setup)
4. [Running the Application](#running-the-application)
5. [Creating the First Admin User](#creating-the-first-admin-user)
6. [Testing the System](#testing-the-system)

---

## Prerequisites

Ensure you have the following installed:
- **Node.js** 16.x or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **MySQL** 8.0 or higher ([Setup Guide](./MYSQL_SETUP_GUIDE.md))
- **Git** (for cloning the repository)

---

## Backend Setup

### ✅ What's Already Complete

The **entire backend** is fully implemented and ready to use:

- ✅ MySQL database configuration with Sequelize ORM
- ✅ All database models (11 tables with relationships)
- ✅ Complete authentication system (JWT, bcrypt, password reset)
- ✅ Role-based access control (RBAC) middleware
- ✅ All API routes for:
  - Projects with financial calculations
  - Tasks and Timesheets with cost tracking
  - Sales Orders, Purchase Orders
  - Customer Invoices, Vendor Bills
  - Expenses with file upload
  - Notifications
  - Dashboard with role-specific stats
- ✅ Email service (welcome emails, password reset)
- ✅ Real-time notifications with Socket.IO
- ✅ Financial calculation utilities
- ✅ Error handling and validation

### Steps to Run the Backend

1. **Navigate to server directory**
   ```bash
   cd Odoo-final/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure .env file**
   Edit `server/.env` with your settings:
   ```env
   PORT=5000
   NODE_ENV=development

   # Your MySQL credentials
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=oneflow_db
   DB_USER=oneflow_user
   DB_PASSWORD=your_password

   # Generate a random string for JWT_SECRET
   JWT_SECRET=your_super_secret_key_change_this
   JWT_EXPIRE=7d

   # Gmail credentials (for email functionality)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   EMAIL_FROM=OneFlow <your-email@gmail.com>

   CLIENT_URL=http://localhost:3000
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   ✅ MySQL Database connected successfully
   ✅ Database models synchronized
   🚀 OneFlow Server running on port 5000
   ```

---

## Frontend Setup

### ✅ What's Already Complete

The frontend foundation is in place:

- ✅ Project structure and configuration
- ✅ TailwindCSS setup with custom theme
- ✅ API client with axios interceptors
- ✅ All API endpoints defined
- ✅ UI component library copied from previous project:
  - Button, Input, Card, Badge, LoadingSpinner
  - Notification Bell (needs context adaptation)
- ✅ Auth pages (Login, Forgot Password, Reset Password)
- ✅ Routing structure planned

### 🔨 What Needs to Be Built

You need to create the following (organized by priority):

#### Priority 1: Essential Infrastructure (Start Here)

1. **Redux Store Setup** (`client/src/store/`)
   ```
   store/
   ├── index.js                    # Configure store
   ├── slices/
   │   ├── authSlice.js           # Auth state management
   │   ├── projectSlice.js        # Projects state
   │   ├── taskSlice.js           # Tasks state
   │   ├── expenseSlice.js        # Expenses state
   │   └── notificationSlice.js   # Notifications state
   ```

2. **Context Providers** (`client/src/contexts/`)
   ```
   contexts/
   ├── AuthContext.js             # Authentication context
   └── NotificationContext.js     # Real-time notifications with Socket.IO
   ```

3. **Layout Components** (`client/src/components/Layout/`)
   ```
   Layout/
   ├── Layout.js                  # Main layout wrapper
   ├── Header.js                  # Top navigation with user menu
   └── Sidebar.js                 # Left sidebar navigation
   ```

4. **Main App Files**
   ```
   src/
   ├── App.js                     # Main app with routing
   ├── index.js                   # App entry point with providers
   ```

#### Priority 2: Core Pages

5. **Dashboard** (`client/src/pages/Dashboard/`)
   - Role-specific KPIs (cards showing stats)
   - Recent projects list
   - Recent tasks list
   - Quick actions

6. **Projects Pages** (`client/src/pages/Projects/`)
   ```
   Projects/
   ├── Projects.js                # Project list with filters
   ├── ProjectDetail.js           # Single project view with:
   │                              #   - Financial panel (Revenue, Cost, Profit)
   │                              #   - Tabs: Tasks, Settings
   │                              #   - Links panel (SOs, POs, Invoices, Bills)
   └── ProjectForm.js             # Create/edit project modal
   ```

7. **Tasks Pages** (`client/src/pages/Tasks/`)
   ```
   Tasks/
   ├── Tasks.js                   # Kanban board (4 columns: New, In Progress, Blocked, Done)
   ├── TaskCard.js                # Individual task card
   ├── TaskModal.js               # Task details with timesheet logging
   └── TaskForm.js                # Create/edit task form
   ```

8. **Users Management** (`client/src/pages/Users/`)
   ```
   Users/
   ├── Users.js                   # User list (Admin only)
   └── UserForm.js                # Create user with auto-generated password
   ```

#### Priority 3: Financial Pages

9. **Settings/Financial Documents** (`client/src/pages/Settings/`)
   ```
   Settings/
   ├── SalesOrders.js             # Global SO list
   ├── PurchaseOrders.js          # Global PO list
   ├── CustomerInvoices.js        # Global invoices list
   ├── VendorBills.js             # Global bills list
   └── Expenses.js                # Global expenses list
   ```

10. **Analytics** (`client/src/pages/Analytics/`)
    - Charts using Chart.js or Recharts
    - Role-specific dashboards
    - Project profitability charts
    - Resource utilization

#### Priority 4: Additional Components

11. **Shared Components** (`client/src/components/`)
    ```
    components/
    ├── FinancialPanel.js          # Reusable financial display
    ├── StatusBadge.js             # Status indicator
    ├── Modal.js                   # Generic modal wrapper
    ├── DataTable.js               # Reusable table with sort/filter
    └── FileUpload.js              # File upload for receipts
    ```

### Quick Start for Frontend Development

1. **Install dependencies**
   ```bash
   cd Odoo-final/client
   npm install
   ```

2. **Copy UI components** (already done in previous project structure)

3. **Start with Redux Store**
   Create `client/src/store/index.js`:
   ```javascript
   import { configureStore } from '@reduxjs/toolkit';
   import authReducer from './slices/authSlice';
   // Import other slices as you create them

   export const store = configureStore({
     reducer: {
       auth: authReducer,
       // Add other reducers
     },
   });
   ```

4. **Create Auth Context**
   Use the pattern from the previous project's `AuthContext.js`, but adapt for Redux.

5. **Start the development server**
   ```bash
   npm start
   ```

---

## Running the Application

### Development Mode

You need **two terminal windows**:

**Terminal 1 - Backend:**
```bash
cd Odoo-final/server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Odoo-final/client
npm start
```

The application will open at `http://localhost:3000`

### Ports Used
- **Frontend**: 3000
- **Backend API**: 5000
- **MySQL**: 3306
- **Socket.IO**: Same as backend (5000)

---

## Creating the First Admin User

### Option 1: Via API (Recommended for First User)

Create a simple script `server/createAdmin.js`:

```javascript
require('dotenv').config();
const { User } = require('./models');
const { connectDB } = require('./config/database');

const createAdmin = async () => {
  await connectDB();

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@oneflow.com',
    password_hash: 'Admin@123',  // Will be hashed automatically
    role: 'Admin',
    hourly_rate: 0,
    is_active: true
  });

  console.log('✅ Admin user created successfully!');
  console.log('Email:', admin.email);
  console.log('Password: Admin@123');
  console.log('\n⚠️  Please change this password after first login!');
  process.exit(0);
};

createAdmin().catch(err => {
  console.error('Error creating admin:', err);
  process.exit(1);
});
```

Run it:
```bash
cd server
node createAdmin.js
```

### Option 2: Via MySQL Directly

```sql
USE oneflow_db;

-- Note: This is a pre-hashed password for "Admin@123"
-- In production, use the backend to create users
INSERT INTO users (name, email, password_hash, role, hourly_rate, is_active)
VALUES ('Admin User', 'admin@oneflow.com', '$2a$10$..your.bcrypt.hash..', 'Admin', 0, TRUE);
```

---

## Testing the System

### 1. Test Authentication
- Login at `http://localhost:3000/login`
- Use admin credentials
- Test "Forgot Password" flow

### 2. Test User Management (Admin)
- Create a Project Manager
- Create Team Members
- Verify email is sent with credentials

### 3. Test Complete Project Flow

**Step 1: Create Project**
- Login as Admin
- Create a new project "Client Website"
- Assign a Project Manager
- Add team members

**Step 2: Create Financial Documents**
- Create a Sales Order for ₹100,000
- Link it to the project
- Verify financials update

**Step 3: Create and Execute Tasks**
- Login as Project Manager
- Create tasks (Design, Development, Testing)
- Assign to team members

**Step 4: Log Hours**
- Login as Team Member
- Log 8 hours on a task
- Verify cost calculation (8 × hourly_rate)

**Step 5: Create Invoice**
- Login as PM or Admin
- Create Customer Invoice for ₹50,000
- Verify revenue updates
- Check profit calculation

**Step 6: Submit Expense**
- Login as Team Member
- Submit expense with receipt
- Wait for approval

**Step 7: Approve Expense**
- Login as Project Manager
- Approve the expense
- Verify notification sent
- Check project cost update

### 4. Verify Real-time Features
- Open two browser windows (different users)
- Create a notification in one
- Verify it appears in the other

### 5. Test Role-Based Access
- Login as different roles
- Verify they see appropriate content
- Test permission restrictions

---

## Troubleshooting

### Backend Issues

**Database Connection Error:**
```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;

# Check user permissions
SHOW GRANTS FOR 'oneflow_user'@'localhost';
```

**Port Already in Use:**
```bash
# Change PORT in server/.env
PORT=5001
```

### Frontend Issues

**API Connection Error:**
- Verify backend is running on port 5000
- Check `proxy` in `client/package.json`
- Inspect browser console for CORS errors

**Missing Dependencies:**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

---

## Development Tips

1. **Use React DevTools** for debugging components
2. **Use Redux DevTools** for state inspection
3. **Check Network tab** for API calls
4. **Use Postman** to test API endpoints directly
5. **Check server console** for backend errors
6. **Use MySQL Workbench** to inspect database

---

## Next Steps

1. ✅ Setup MySQL ([MYSQL_SETUP_GUIDE.md](./MYSQL_SETUP_GUIDE.md))
2. ✅ Configure backend `.env`
3. ✅ Start backend and verify database connection
4. 🔨 Build frontend components (Priority 1 first)
5. 🔨 Test end-to-end workflows
6. 🚀 Deploy to production

---

**Need Help?**
- Review [README.md](./README.md) for project overview
- Check API documentation in code comments
- Review existing code structure for patterns

Good luck building OneFlow! 🚀

