# Quick Test Guide - Task Status Updates

## What Was Fixed

The task status update functionality was broken due to a missing API function. This has been resolved!

## Changes Made

### 1. ✅ Added Missing API Function
**File: `client/src/utils/api.js`**
```javascript
updateStatus: (id, status) => api.put(`/tasks/${id}`, { status })
```

### 2. ✅ Fixed List View Updates
**File: `client/src/pages/Tasks/TaskListView.js`**
- Status changes now properly save to database
- Added success/error toast notifications
- Added automatic rollback on failure

## How to Test

### Start the Development Server
```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Start frontend
cd client
npm start
```

### Test Kanban View (Drag & Drop)
1. Navigate to **Tasks** page (`/tasks`)
2. Click **"Kanban"** view button
3. **Drag a task** from "New" column to "In Progress" column
4. ✅ You should see a green success toast: "Task status updated"
5. ✅ The task should stay in the new column
6. **Refresh the page** - task should still be in the correct column

### Test List View (Dropdown)
1. Navigate to **Tasks** page (`/tasks`)
2. Click **"List"** view button
3. **Click the status dropdown** on any task
4. Select a different status (e.g., "In Progress")
5. ✅ You should see a green success toast: "Task status updated"
6. ✅ The dropdown should show the new status
7. **Refresh the page** - status should persist

### Test Project Tasks (Buttons)
1. Navigate to **Projects** page (`/projects`)
2. **Click on any project** to open details
3. Scroll down to the **Tasks** section
4. Find a task with status "New"
5. **Click "Mark In Progress"** button
6. ✅ You should see a green success toast: "Task status updated"
7. ✅ The button should change to show new status
8. **Refresh the page** - status should persist

## What to Look For

### ✅ Success Indicators
- Green toast notification appears
- Task moves to correct column/section
- Status persists after page refresh
- No console errors

### ❌ If Something Goes Wrong
- Red toast notification appears
- Task reverts to original position
- Check browser console for errors
- Check backend server logs

## Browser Console Check

Open Developer Tools (F12) and check the Console tab:
- ❌ **Before fix**: `TypeError: taskAPI.updateStatus is not a function`
- ✅ **After fix**: No errors, only successful API responses

## Database Verification (Optional)

If you want to verify the database is being updated:

```sql
-- Check task statuses
SELECT id, title, status, updated_at 
FROM tasks 
ORDER BY updated_at DESC 
LIMIT 10;
```

The `updated_at` timestamp should change when you update task status.

## Troubleshooting

### Issue: Build fails with compilation errors
**Solution:** Run `npm install` in the client folder to ensure all dependencies are installed

### Issue: Toast notifications don't appear
**Solution:** Check that `react-hot-toast` is installed and the `<Toaster />` component is rendered in App.js

### Issue: Tasks don't persist after refresh
**Solution:** 
1. Check that backend server is running
2. Check browser Network tab (F12 → Network) for failed PUT requests
3. Verify database connection is working

### Issue: Drag & drop doesn't work in Kanban view
**Solution:** 
1. Check that `@hello-pangea/dnd` is installed
2. Clear browser cache and reload
3. Check console for JavaScript errors

## Files Modified

Only 2 files were changed:
1. ✅ `client/src/utils/api.js` - Added `updateStatus` function
2. ✅ `client/src/pages/Tasks/TaskListView.js` - Fixed status change handler

## No Backend Changes Required

The backend API was already working correctly. Only frontend changes were needed.

---

**Ready to test!** 🚀

The fix is complete and the application builds successfully. All task status updates should now work properly across all three views (Kanban, List, and Project Tasks).

