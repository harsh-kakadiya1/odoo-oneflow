Demonstration Video

https://drive.google.com/file/d/10Zep19zWKDKJ2jkJBHHlWGL4Ng-1anlt/view?usp=drivesdk


# OneFlow - Project Management & Invoicing Platform

<div align="center">

OneFlow Logo

**A comprehensive project management, time tracking, and financial management solution built for modern businesses.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18+-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-v8+-orange.svg)](https://www.mysql.com/)

</div>

---

## 📹 Demonstration Video


![OneFlow Demo Video](https://drive.google.com/file/d/10Zep19zWKDKJ2jkJBHHlWGL4Ng-1anlt/view?usp=drivesdk)

*Click the image above to watch a full demonstration of OneFlow's features*

---

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [User Roles](#-user-roles)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

##  Features

###  Project Management
- Create and manage multiple projects with detailed tracking
- Assign project managers and team members
- Track project status (Planned, In Progress, Completed, On Hold)
- Set budgets and monitor spending
- Real-time project progress visualization

###  Task Management
- Create, assign, and track tasks
- Kanban board view for visual task management
- Set priorities and due dates
- Task status tracking (New, In Progress, Blocked, Done)
- Estimated vs. actual hours tracking

###  Time Tracking
- Log hours worked on tasks and projects
- View personal and team timesheet analytics
- Track billable vs. non-billable hours
- Weekly and monthly time reports
- Automatic hourly rate calculations

###  Financial Management
- **Sales Orders**: Create and track customer orders
- **Purchase Orders**: Manage vendor purchases
- **Customer Invoices**: Generate and send invoices (INR currency)
- **Vendor Bills**: Track and manage payables
- **Expense Tracking**: Submit and approve employee expenses
- Comprehensive financial reporting and analytics

###  Analytics & Reports
- Real-time dashboard with KPIs
- Project cost vs. revenue analysis
- Task completion trends
- Resource utilization reports
- Financial overview and insights

###  User Management
- Role-based access control (Admin, Project Manager, Team Member, Sales/Finance)
- User profile management
- Company-based multi-tenancy
- Activity notifications

###  Modern UI/UX
- Clean, intuitive interface
- Dark mode support
- Responsive design (mobile, tablet, desktop)
- Real-time updates
- Beautiful charts and visualizations

---

##  Screenshots

### 1. Landing Page
<!-- Replace with actual screenshot path -->
![Landing Page](screenshots/01-landing-page.png)
*Modern landing page with feature highlights and pricing information*

### 2. Dashboard Overview
<!-- Replace with actual screenshot path -->
![Dashboard](screenshots/02-dashboard.png)
*Real-time dashboard showing active projects, delayed tasks, hours logged, and revenue metrics with interactive charts*

### 3. Project Management
<!-- Replace with actual screenshot path -->
![Projects](screenshots/03-projects.png)
*Comprehensive project listing with status tracking, budget monitoring, and team member assignment*

### 4. Task Kanban Board
<!-- Replace with actual screenshot path -->
![Kanban Board](screenshots/04-kanban-board.png)
*Drag-and-drop Kanban board for visual task management across different stages*

### 5. Time Tracking & Analytics
<!-- Replace with actual screenshot path -->
![Timesheets](screenshots/05-timesheets.png)
*Detailed timesheet view with weekly logs, billable hours tracking, and analytics*

### 6. Financial Management
<!-- Replace with actual screenshot path -->
![Financial Dashboard](screenshots/06-financial-management.png)
*Complete financial management interface for invoices, orders, bills, and expenses (Indian Rupees)*

---

## 🛠 Technology Stack

### Frontend
- **React 18+** - Modern UI library
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js & Recharts** - Data visualization
- **Lucide React** - Beautiful icon library
- **date-fns** - Date manipulation
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Sequelize ORM** - Database management
- **MySQL** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Development Tools
- **nodemon** - Auto-restart development server
- **dotenv** - Environment configuration
- **CORS** - Cross-origin resource sharing

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn**
- **MySQL** (v8.0 or higher)
- **Git**

### System Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 500MB free space

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/odoo-oneflow.git
cd odoo-oneflow
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

### 4. Environment Configuration

Create a `.env` file in the `server` directory:

```bash
cd ../server
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=oneflow_db
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password

# Frontend URL
CLIENT_URL=http://localhost:3000
```

---

## 🗄 Database Setup

### 1. Create Database

Log into MySQL and create the database:

```sql
CREATE DATABASE oneflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Run Migrations (if applicable)

If there are pending database migrations:

```bash
cd server
# Run the migration script
mysql -u root -p oneflow_db < database_migrations/ADD_COMPANY_ID_TO_FINANCIAL_TABLES.sql
```

### 3. Seed Test Data

Populate the database with sample data for testing:

```bash
cd server
npm run seed
```

This will create:
- 1 Company (OneFlow Solutions)
- 11 Users (Admins, Project Managers, Team Members, Sales/Finance)
- 5 Projects with various statuses
- 9 Tasks assigned to different users
- 150+ Timesheet entries
- Sample Sales Orders, Invoices, Purchase Orders, Vendor Bills, and Expenses

**Test Login Credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin | john.smith@oneflow.com | password123 |
| Admin | sarah.johnson@oneflow.com | password123 |
| Admin | julikyada293@gmail.com | password123 |
| Project Manager | mike.chen@oneflow.com | password123 |
| Sales/Finance | lisa.brown@oneflow.com | password123 |
| Team Member | alex.rodriguez@oneflow.com | password123 |

---

## 🏃 Running the Application

### Development Mode

You'll need two terminal windows:

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
Server will start on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```
Frontend will start on `http://localhost:3000`

### Production Mode

**Build Frontend:**
```bash
cd client
npm run build
```

**Start Production Server:**
```bash
cd ../server
npm start
```

The application will be available at `http://localhost:5000`

---

## 👥 User Roles

OneFlow implements role-based access control with four distinct user roles:

### 🔐 Admin
- Full system access
- Manage all projects, users, and settings
- View all financial data and reports
- Configure system settings
- Access to all analytics

### 📋 Project Manager
- Create and manage projects
- Assign tasks to team members
- View project financials
- Approve timesheets and expenses
- Access project-level analytics

### 👤 Team Member
- View assigned tasks and projects
- Log time on tasks
- Submit expenses
- Update task status
- View personal timesheets

### 💼 Sales/Finance
- Manage sales orders and invoices
- Process purchase orders and vendor bills
- Review and approve expenses
- Access financial reports
- View revenue and cost analytics

---

## 📚 API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Team Member",
  "company_id": 1
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Projects

#### Get All Projects
```http
GET /api/projects
Authorization: Bearer {token}
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Website",
  "description": "Company website redesign",
  "start_date": "2024-01-01",
  "end_date": "2024-06-30",
  "budget": 50000,
  "project_manager_id": 2,
  "status": "Planned"
}
```

### Tasks

#### Get Tasks
```http
GET /api/tasks
Authorization: Bearer {token}
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Design homepage",
  "description": "Create homepage mockup",
  "project_id": 1,
  "assignee_id": 3,
  "due_date": "2024-02-15",
  "priority": "High",
  "status": "New",
  "estimated_hours": 16
}
```

### Timesheets

#### Log Hours
```http
POST /api/timesheets
Authorization: Bearer {token}
Content-Type: application/json

{
  "task_id": 1,
  "hours_logged": 4.5,
  "log_date": "2024-01-15",
  "description": "Working on homepage design"
}
```

For complete API documentation, see [API_DOCS.md](docs/API_DOCS.md)

---

## 📁 Project Structure

```
odoo-oneflow/
├── client/                    # React frontend
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Layout/      # Layout components
│   │   │   └── UI/          # UI components
│   │   ├── contexts/         # React Context providers
│   │   ├── pages/           # Page components
│   │   │   ├── Auth/        # Authentication pages
│   │   │   ├── Dashboard/   # Dashboard
│   │   │   ├── Projects/    # Project management
│   │   │   ├── Tasks/       # Task management
│   │   │   ├── Analytics/   # Analytics & reports
│   │   │   ├── Settings/    # Financial management
│   │   │   └── ...
│   │   ├── utils/           # Utility functions
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   └── package.json
│
├── server/                   # Node.js backend
│   ├── config/              # Configuration files
│   │   └── database.js      # Database config
│   ├── models/              # Sequelize models
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   ├── Timesheet.js
│   │   └── ...
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   ├── dashboard.js
│   │   └── ...
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js          # Authentication
│   │   └── errorHandler.js
│   ├── utils/               # Utility functions
│   ├── seed.js              # Database seeding
│   ├── seedTestData.js      # Test data generation
│   └── server.js            # Server entry point
│
├── database_migrations/      # SQL migration scripts
├── screenshots/              # Application screenshots
├── .gitignore
├── README.md
└── package.json
```

---

## 🤝 Contributing

We welcome contributions to OneFlow! Here's how you can help:

### Steps to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/odoo-oneflow.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests if applicable

4. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**

### Development Guidelines

- Follow the existing code structure and naming conventions
- Write meaningful commit messages
- Update documentation for new features
- Test your changes thoroughly
- Ensure all linter checks pass

### Code Style

- **Frontend**: ESLint with React configuration
- **Backend**: Standard Node.js conventions
- **Formatting**: Prettier (2 spaces, single quotes)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

### Documentation
- [Installation Guide](docs/INSTALLATION.md)
- [User Manual](docs/USER_MANUAL.md)
- [API Documentation](docs/API_DOCS.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

### Getting Help

If you encounter any issues or have questions:

1. **Check the documentation** in the `docs/` folder
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - System information

### Contact

- **Email**: support@oneflow.com
- **GitHub Issues**: [github.com/yourusername/odoo-oneflow/issues](https://github.com/yourusername/odoo-oneflow/issues)
- **Website**: [oneflow.com](https://oneflow.com)

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend framework
- All contributors who have helped improve this project
- Open source community

---

## 🗺 Roadmap

### Upcoming Features

- [ ] Real-time collaboration with WebSockets
- [ ] Mobile app (React Native)
- [ ] Advanced reporting and export features
- [ ] Integration with popular tools (Slack, Jira, etc.)
- [ ] Multi-language support
- [ ] Email notifications
- [ ] Calendar view for tasks and deadlines
- [ ] File attachments for tasks and projects
- [ ] Gantt chart for project timeline
- [ ] Custom fields and workflows

---

<div align="center">

**Made with ❤️ by the OneFlow Team**

⭐ Star us on GitHub if you find this project helpful!

[Report Bug](https://github.com/yourusername/odoo-oneflow/issues) · [Request Feature](https://github.com/yourusername/odoo-oneflow/issues) · [Documentation](docs/)

</div>

