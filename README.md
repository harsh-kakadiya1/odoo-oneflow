# OneFlow - Plan to Bill in One Place

A complete, production-ready Project Management System built with the MERN stack and MySQL. OneFlow enables project managers to take projects from planning through execution to billing in a single, unified platform.

## 🎯 Features

### Core Functionality
- **Project Management**: Create, assign, and track projects with real-time financial calculations
- **Task Management**: Kanban board with drag-and-drop, status tracking, and time logging
- **Financial Tracking**: Integrated Sales Orders, Purchase Orders, Customer Invoices, and Vendor Bills
- **Expense Management**: Submit, approve, and track expenses with receipt uploads
- **Timesheets**: Log billable and non-billable hours with automatic cost calculations
- **Analytics Dashboard**: Role-specific KPIs, charts, and insights
- **Real-time Notifications**: Socket.IO-powered notifications for all key events
- **Email Integration**: Password reset, welcome emails, and notifications

### User Roles & Permissions
- **Admin**: Full system access, user management, global oversight
- **Project Manager**: Project creation, team management, expense approval
- **Team Member**: Task execution, timesheet logging, expense submission
- **Sales/Finance**: Financial document management, billing, reporting

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, Redux Toolkit, React Router, TailwindCSS
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: MySQL 8.0+
- **Real-time**: Socket.IO
- **Authentication**: JWT with bcrypt
- **Email**: Nodemailer
- **Charts**: Chart.js & Recharts

### Project Structure
```
Odoo-final/
├── server/                  # Backend Node.js/Express application
│   ├── config/             # Database & configuration
│   ├── models/             # Sequelize models
│   ├── routes/             # API route handlers
│   ├── middleware/         # Auth & RBAC middleware
│   ├── services/           # Email & notification services
│   ├── utils/              # Helper functions
│   └── index.js            # Server entry point
│
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── store/          # Redux store & slices
│   │   ├── utils/          # API client & utilities
│   │   └── App.js          # Main app component
│   └── public/
│
├── MYSQL_SETUP_GUIDE.md    # Detailed MySQL setup instructions
├── PROJECT_SETUP.md        # Complete setup and installation guide
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MySQL 8.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Odoo-final
   ```

2. **Setup MySQL**
   Follow the detailed guide in [MYSQL_SETUP_GUIDE.md](./MYSQL_SETUP_GUIDE.md)

3. **Install Dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

4. **Configure Environment**
   ```bash
   # Copy server/.env.example to server/.env
   # Update with your MySQL credentials and email settings
   ```

5. **Start the Application**
   ```bash
   # Terminal 1 - Start backend (from server directory)
   npm run dev

   # Terminal 2 - Start frontend (from client directory)
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 📚 Key Concepts

### Financial Calculations

**Revenue**: Sum of all Customer Invoices (Sent/Paid status) linked to a project

**Cost**: Sum of:
- Approved Vendor Bills
- Approved Expenses
- Timesheet costs (hours × user's hourly rate)

**Profit**: Revenue - Cost

### Business Workflows

#### Fixed-Price Project Flow
1. Sales team creates a Sales Order for ₹1,00,000
2. PM creates project and links the Sales Order
3. PM creates tasks and assigns team members
4. Team logs hours → Cost increases automatically
5. PM creates Customer Invoices for milestones → Revenue increases
6. Real-time profit tracking throughout

#### Vendor & Expense Flow
1. PM creates Purchase Order for vendor services
2. Vendor completes work → Finance creates Vendor Bill
3. Team member submits expense with receipt
4. PM approves expense
5. All costs reflect immediately in project financials

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected API routes
- SQL injection prevention (Sequelize ORM)
- XSS protection
- CORS configuration
- Password reset with secure tokens

## 🎨 UI Components

The application includes a complete set of reusable UI components:
- Button, Input, Card, Badge
- Loading Spinner
- Notification Bell with dropdown
- Modal, Dropdown, Tooltip
- Form components with validation
- Data tables with sorting/filtering
- Charts and visualizations

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List projects (role-filtered)
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project with financials
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `POST /api/tasks/:id/timesheets` - Log hours

### Financial Documents
- Sales Orders: `/api/sales-orders`
- Purchase Orders: `/api/purchase-orders`
- Customer Invoices: `/api/customer-invoices`
- Vendor Bills: `/api/vendor-bills`
- Expenses: `/api/expenses`

### Dashboard
- `GET /api/dashboard/stats` - Role-specific KPIs
- `GET /api/dashboard/recent-projects` - Recent projects
- `GET /api/dashboard/recent-tasks` - Recent tasks

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 📦 Deployment

### Production Build

```bash
# Build frontend
cd client
npm run build

# Set NODE_ENV=production in server/.env
# Start production server
cd server
npm start
```

### Environment Variables

See `server/.env.example` for all required environment variables.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

Developed as part of the Odoo Virtual Round Hackathon.

## 🐛 Known Issues & Roadmap

- [ ] Mobile responsive design improvements
- [ ] Export financial reports to PDF
- [ ] Gantt chart view for project timeline
- [ ] Budget alerts and notifications
- [ ] Integration with accounting software
- [ ] Multi-currency support
- [ ] Advanced reporting and analytics

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review API documentation

---

**OneFlow** - Complete project management from planning to billing, all in one place.

