# 🔧 Troubleshooting: Manager Names & Task Data Not Showing

## ✅ What I Fixed

### 1. **Manager Name Display** - Added Fallback Logic
All manager name displays now try multiple approaches:
```javascript
// Tries firstName + lastName first, then falls back to name field
{project.projectManager ? 
  `${project.projectManager.firstName || ''} ${project.projectManager.lastName || ''}`.trim() || 
  project.projectManager.name || 
  'Not assigned'
  : 'Not assigned'}
```

### 2. **Task Assignee Display** - Added Fallback Logic
```javascript
// Same fallback approach for task assignees
{task.assignee ? 
  (task.assignee.firstName && task.assignee.lastName 
    ? `${task.assignee.firstName} ${task.assignee.lastName}`.trim()
    : task.assignee.name || 'Assigned')
  : 'Unassigned'}
```

### 3. **Team Member Display** - Added Fallback Logic
Works with both firstName/lastName and name field

---

## 🐛 Why Names Still Not Showing

### **Root Cause: Database Migration Not Run**

The server logs show these errors:
```
❌ Unknown column 'company.email' in 'field list'
❌ Unknown column 'Task.cover_image' in 'field list'
```

These errors are **blocking** the API from returning data, which is why you see:
- ❌ Manager names empty
- ❌ Progress showing 0/0 tasks
- ❌ All financials showing ₹0

---

## ✅ Solution: Run Database Migration

### **Step 1: Execute Migration Script**

Open **MySQL Workbench** and run:
```
DATABASE_MIGRATION_AFTER_MERGE.sql
```

Or via command line:
```bash
mysql -u oneflow_user -p oneflow_db < DATABASE_MIGRATION_AFTER_MERGE.sql
```

### **Step 2: Verify Migration Success**

In MySQL Workbench:
```sql
-- Check if cover_image column exists
DESCRIBE tasks;
-- Should show: cover_image | TEXT | YES

-- Check if companies has email column
DESCRIBE companies;
-- Should show: email | varchar(100) | YES
```

### **Step 3: Restart Server**

Your server should auto-restart with nodemon. If not:
```bash
cd server
npm run dev
```

### **Step 4: Refresh Browser**

Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## 🔍 Quick Diagnostic

### **Check Server Logs:**

**If you still see errors:**
```
Error: Unknown column 'company.email'
Error: Unknown column 'Task.cover_image'
```
→ Migration didn't run successfully

**If you see:**
```
✅ MySQL Database connected successfully
Executing (default): SELECT ... FROM projects ...
```
→ Migration worked! Data should appear.

### **Check Browser Console (F12):**

Look for API errors:
```javascript
// Good response:
{
  success: true,
  projects: [
    {
      id: 1,
      name: "odoo",
      projectManager: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com"
      },
      tasks: [ /* array of tasks */ ]
    }
  ]
}

// Bad response (missing data):
{
  success: false,
  message: "Database error"
}
```

---

## 📊 Expected Behavior After Fix

### **Projects Page:**
- ✅ Progress bar shows: "X/Y tasks completed" with actual numbers
- ✅ Manager: "John Doe" (actual name)
- ✅ Team: "3 members" (actual count)
- ✅ Revenue/Cost/Profit show real values

### **Project Details:**
- ✅ Header shows: "Project Name" with "Status" badge
- ✅ Manager: "John Doe" displayed
- ✅ KPI cards show real dates/budget
- ✅ Progress bars show actual percentages
- ✅ Team section lists all members with names
- ✅ Financial cards show calculated values

### **Tasks:**
- ✅ Task cards show status and priority
- ✅ Assigned: "Jane Smith" (actual name)
- ✅ Due Date shows actual date
- ✅ Status change buttons work

---

## 🚨 If Data Still Shows as 0 After Migration

### **Option 1: Create Some Test Data**

1. Go to `/projects` page
2. Click "New Project"
3. Fill in:
   - Name: "Test Project"
   - Description: "Testing project"
   - Start Date: Today
   - End Date: Next week
   - Budget: 10000
   - Select yourself as manager
4. Create the project
5. Open the project
6. Click "New Task"
7. Create 2-3 tasks
8. Mark one as "Done"
9. Go back to dashboard

### **Option 2: Run Sample Data SQL**

If you have `TASK_SAMPLE_DATA.sql`:
```sql
USE oneflow_db;
-- Run the sample data script
SOURCE TASK_SAMPLE_DATA.sql;
```

---

## 📝 Summary

### **Current Issue:**
- Manager names not showing
- Task progress showing 0/0
- All values showing 0

### **Root Cause:**
- Database migration not executed
- Server getting database errors
- API failing to return data

### **Solution:**
1. ✅ Run `DATABASE_MIGRATION_AFTER_MERGE.sql`
2. ✅ Server auto-restarts
3. ✅ Refresh browser
4. ✅ Data appears!

---

**The UI is ready and all fallbacks are in place. Just run the migration to see your data!** 🚀

