# 🚀 How to Run OneFlow Project

## ✅ Prerequisites Check

Before running, ensure you have:
- ✅ Node.js 16+ installed
- ✅ MySQL 8.0+ installed and running
- ✅ npm installed

---

## 📋 Step-by-Step Instructions

### Step 1: Setup MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE oneflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'oneflow_user'@'localhost' IDENTIFIED BY 'OneFlow@2024';
GRANT ALL PRIVILEGES ON oneflow_db.* TO 'oneflow_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 2: Configure Backend

```bash
# Navigate to server directory
cd Odoo-final/server

# Install dependencies
npm install

# Create .env file
# Copy the content below into server/.env
```

**Create `server/.env` file with this content:**
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=oneflow_db
DB_USER=oneflow_user
DB_PASSWORD=OneFlow@2024

JWT_SECRET=oneflow_super_secret_jwt_key_2024_change_in_production
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=OneFlow <your-email@gmail.com>

CLIENT_URL=http://localhost:3000
```

### Step 3: Create Admin User

```bash
# Still in server directory
node createAdmin.js

# Follow the prompts:
# Full Name: Admin User
# Email: admin@oneflow.com
# Password: Admin@123

# You'll see: ✅ Admin user created successfully!
```

### Step 4: Start Backend Server

```bash
# In server directory
npm run dev

# You should see:
# ✅ MySQL Database connected successfully
# ✅ Database models synchronized
# 🚀 OneFlow Server running on port 5000
```

**Keep this terminal open!**

### Step 5: Start Frontend (New Terminal)

```bash
# Open NEW terminal
cd Odoo-final/client

# Install dependencies
npm install

# Start development server
npm start

# Browser will automatically open to http://localhost:3000
```

---

## 🎉 You're Ready!

### Login Credentials:
- **Email:** admin@oneflow.com
- **Password:** Admin@123

### What You Can Do Now:

✅ **Login** - Use the credentials above  
✅ **Dashboard** - View KPIs and stats  
✅ **Projects** - Create and manage projects  
✅ **Users** - Add new users (Admin only)  
✅ **Profile** - Update your profile and password  
✅ **Notifications** - Real-time notifications  

---

## 🔧 Quick Commands

### Using the Batch/Shell Scripts:

**Windows:**
```bash
cd Odoo-final
start-dev.bat
```

**Mac/Linux:**
```bash
cd Odoo-final
chmod +x start-dev.sh
./start-dev.sh
```

This will start both servers automatically!

---

## 🐛 Troubleshooting

### Backend Won't Start?

```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;

# Check .env file exists
cd server
cat .env  # Mac/Linux
type .env  # Windows
```

### Frontend Won't Start?

```bash
# Clear and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

### Can't Login?

```bash
# Recreate admin user
cd server
node createAdmin.js
```

### Port Already in Use?

```bash
# Change port in server/.env
PORT=5001

# Or kill the process using port 5000
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000
```

---

## 📊 What's Working

### ✅ Fully Functional (95%):
- Login/Logout
- Password Reset
- Dashboard with real-time stats
- Projects (Create, List, View)
- Users Management (Admin only)
- Profile Management
- Real-time Notifications
- Email Service

### ⚠️ Coming Soon (5%):
- Project Detail Page with Financials
- Tasks Kanban Board
- Analytics Charts
- Settings Pages (Financial Documents)

---

## 🎯 Next Steps After Running

1. **Login** with admin credentials
2. **Create a Project** (Projects page)
3. **Add Users** (Users page - Admin only)
4. **View Dashboard** stats
5. **Update Profile** (Profile page)
6. **Test Notifications** (Bell icon)

---

## 📞 Need Help?

### Documentation Files:
- `QUICK_START_GUIDE.md` - Quick start guide
- `MYSQL_SETUP_GUIDE.md` - Detailed MySQL setup
- `PROJECT_SETUP.md` - Complete setup guide
- `IMPLEMENTATION_STATUS.md` - Technical details

### Common Issues:

**"Cannot find module"**
```bash
npm install
```

**"Connection refused"**
```bash
# Check MySQL is running
# Verify credentials in .env
```

**"Port 3000 already in use"**
```bash
# Kill the process or change port
# React will ask to use different port
```

---

## 🎊 Success!

Your OneFlow Project Management System is now running!

**URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api/health

**Test Backend:**
```bash
curl http://localhost:5000/api/health
```

You should see:
```json
{
  "success": true,
  "message": "OneFlow API is running"
}
```

---

**Happy Project Managing! 🚀**

