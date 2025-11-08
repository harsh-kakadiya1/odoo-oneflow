# MySQL Setup Guide for OneFlow

## Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Multi-Device Access Setup](#multi-device-access-setup)
4. [Database Creation](#database-creation)
5. [Troubleshooting](#troubleshooting)

---

## Installation

### Windows

1. **Download MySQL**
   - Visit [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
   - Download "MySQL Installer for Windows"
   - Choose the "Developer Default" or "Server only" setup type

2. **Install MySQL**
   - Run the installer
   - Choose "Developer Default" setup type
   - Click "Execute" to install all components
   - Configure MySQL Server:
     - Port: 3306 (default)
     - Root password: Choose a strong password
     - Create a Windows Service: Yes
     - Service Name: MySQL80 (default)

3. **Verify Installation**
   ```bash
   mysql --version
   ```

### macOS

1. **Using Homebrew** (Recommended)
   ```bash
   # Install Homebrew if not installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install MySQL
   brew install mysql
   
   # Start MySQL service
   brew services start mysql
   
   # Secure installation
   mysql_secure_installation
   ```

### Linux (Ubuntu/Debian)

```bash
# Update package index
sudo apt update

# Install MySQL Server
sudo apt install mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure installation
sudo mysql_secure_installation
```

---

## Configuration

### 1. Create MySQL User for OneFlow

```sql
-- Login as root
mysql -u root -p

-- Create database
CREATE DATABASE oneflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (replace 'your_password' with a strong password)
CREATE USER 'oneflow_user'@'localhost' IDENTIFIED BY 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON oneflow_db.* TO 'oneflow_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 2. Configure Environment Variables

Create `.env` file in the `server` directory:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=oneflow_db
DB_USER=oneflow_user
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=OneFlow <your-email@gmail.com>

# Frontend URL
CLIENT_URL=http://localhost:3000
```

---

## Multi-Device Access Setup

### Enable Remote Connections

#### 1. Configure MySQL to Listen on All Interfaces

**Windows:**
1. Locate `my.ini` file (usually in `C:\ProgramData\MySQL\MySQL Server 8.0\`)
2. Open with Administrator privileges
3. Find and modify:
   ```ini
   bind-address = 0.0.0.0
   ```
4. Restart MySQL service

**Linux/macOS:**
1. Edit MySQL configuration:
   ```bash
   sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
   # or
   sudo nano /etc/my.cnf
   ```
2. Find and modify:
   ```ini
   bind-address = 0.0.0.0
   ```
3. Restart MySQL:
   ```bash
   sudo systemctl restart mysql
   # or
   brew services restart mysql
   ```

#### 2. Create User for Remote Access

```sql
-- Login to MySQL
mysql -u root -p

-- Create user that can connect from any IP
CREATE USER 'oneflow_user'@'%' IDENTIFIED BY 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON oneflow_db.* TO 'oneflow_user'@'%';
FLUSH PRIVILEGES;
```

#### 3. Configure Firewall

**Windows:**
```powershell
# Open PowerShell as Administrator
New-NetFirewallRule -DisplayName "MySQL" -Direction Inbound -Protocol TCP -LocalPort 3306 -Action Allow
```

**Linux (UFW):**
```bash
sudo ufw allow 3306/tcp
sudo ufw reload
```

**macOS:**
```bash
# Add firewall rule in System Preferences > Security & Privacy > Firewall > Firewall Options
```

#### 4. Update Environment Variables for Remote Access

On the device connecting remotely, use the host machine's IP address:

```bash
DB_HOST=192.168.1.100  # Replace with your host machine's IP
DB_PORT=3306
DB_NAME=oneflow_db
DB_USER=oneflow_user
DB_PASSWORD=your_password
```

**Find Your IP Address:**
- **Windows:** `ipconfig`
- **macOS/Linux:** `ifconfig` or `ip addr show`

---

## Database Creation

### Automatic Setup (Recommended)

The application will automatically create all tables when you first run it:

```bash
cd server
npm install
npm run dev
```

The Sequelize ORM will:
1. Connect to the database
2. Create all required tables
3. Set up relationships
4. Initialize the schema

### Manual Setup (Optional)

If you prefer to see the schema, here's the SQL:

```sql
-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Project Manager', 'Team Member', 'Sales/Finance') NOT NULL DEFAULT 'Team Member',
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  reset_password_token VARCHAR(255),
  reset_password_expire DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status ENUM('Planned', 'In Progress', 'Completed', 'On Hold') NOT NULL DEFAULT 'Planned',
  project_manager_id INT NOT NULL,
  budget DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_manager_id) REFERENCES users(id)
);

-- Continue with other tables...
```

---

## Troubleshooting

### Connection Issues

**Error: "Access denied for user"**
```sql
-- Reset user password
ALTER USER 'oneflow_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

**Error: "Can't connect to MySQL server"**
```bash
# Check if MySQL is running
# Windows:
sc query MySQL80

# Linux/macOS:
sudo systemctl status mysql
# or
brew services list
```

**Error: "Table doesn't exist"**
```bash
# Delete and recreate database
mysql -u root -p
DROP DATABASE oneflow_db;
CREATE DATABASE oneflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Restart the application
cd server
npm run dev
```

### Performance Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_project_status ON projects(status);
CREATE INDEX idx_task_assignee ON tasks(assignee_id);
CREATE INDEX idx_task_status ON tasks(status);
CREATE INDEX idx_expense_status ON expenses(status);
```

### Backup Database

```bash
# Create backup
mysqldump -u oneflow_user -p oneflow_db > oneflow_backup.sql

# Restore backup
mysql -u oneflow_user -p oneflow_db < oneflow_backup.sql
```

---

## Security Best Practices

1. **Strong Passwords**: Use complex passwords for MySQL users
2. **Limited Privileges**: Only grant necessary permissions
3. **Firewall Rules**: Restrict MySQL port to known IPs if possible
4. **Regular Updates**: Keep MySQL updated
5. **SSL/TLS**: Enable encrypted connections for production
6. **Regular Backups**: Schedule automatic backups

---

## Next Steps

After setting up MySQL:

1. Install dependencies:
   ```bash
   cd server
   npm install
   
   cd ../client
   npm install
   ```

2. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm start
   ```

3. Access the application at `http://localhost:3000`

4. Default admin user will be created on first run (check console)

---

## Support

For issues or questions:
- Check application logs: `server/logs/`
- Review MySQL error log: `/var/log/mysql/error.log` (Linux) or MySQL Workbench (Windows)
- Ensure all ports are not blocked by firewall
- Verify network connectivity between devices

---

**OneFlow - Plan to Bill in One Place**

