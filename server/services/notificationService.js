const { Notification, User } = require('../models');
const { sendNotificationEmail } = require('./emailService');

// Create notification
const createNotification = async (userId, title, message, type = 'info', link = null) => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      title,
      message,
      type,
      link,
      is_read: false
    });

    // Optionally send email notification
    const user = await User.findByPk(userId);
    if (user) {
      // Send email in background (don't wait for it)
      sendNotificationEmail(user, notification).catch(err => {
        console.error('Failed to send notification email:', err);
      });
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Create notifications for multiple users
const createBulkNotifications = async (userIds, title, message, type = 'info', link = null) => {
  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type,
      link,
      is_read: false
    }));

    await Notification.bulkCreate(notifications);
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};

// Notification types for common events
const notifyTaskAssigned = async (userId, taskTitle, projectName) => {
  return createNotification(
    userId,
    'New Task Assigned',
    `You have been assigned to task "${taskTitle}" in project "${projectName}".`,
    'info',
    '/tasks'
  );
};

const notifyExpenseApproved = async (userId, expenseDescription, amount) => {
  return createNotification(
    userId,
    'Expense Approved',
    `Your expense "${expenseDescription}" for ₹${amount} has been approved.`,
    'success',
    '/expenses'
  );
};

const notifyExpenseRejected = async (userId, expenseDescription, amount) => {
  return createNotification(
    userId,
    'Expense Rejected',
    `Your expense "${expenseDescription}" for ₹${amount} has been rejected.`,
    'warning',
    '/expenses'
  );
};

const notifyExpensePendingApproval = async (managerId, userName, expenseDescription, amount, projectName) => {
  return createNotification(
    managerId,
    'Expense Pending Approval',
    `${userName} submitted an expense "${expenseDescription}" for ₹${amount} in project "${projectName}".`,
    'info',
    '/approvals'
  );
};

const notifyProjectAssigned = async (userId, projectName, role) => {
  return createNotification(
    userId,
    'Added to Project',
    `You have been added to project "${projectName}" as ${role}.`,
    'info',
    '/projects'
  );
};

const notifyDeadlineApproaching = async (userId, taskTitle, daysLeft) => {
  return createNotification(
    userId,
    'Deadline Approaching',
    `Task "${taskTitle}" is due in ${daysLeft} day(s).`,
    'warning',
    '/tasks'
  );
};

module.exports = {
  createNotification,
  createBulkNotifications,
  notifyTaskAssigned,
  notifyExpenseApproved,
  notifyExpenseRejected,
  notifyExpensePendingApproval,
  notifyProjectAssigned,
  notifyDeadlineApproaching
};

