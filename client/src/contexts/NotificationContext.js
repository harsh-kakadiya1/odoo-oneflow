import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { notificationAPI } from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('join', user.id);
      });

      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ), {
          duration: 5000,
          position: 'top-right'
        });
      });

      setSocket(newSocket);

      // Project events -> dispatch to window so pages can refresh
      newSocket.on('project:created', (payload) => {
        window.dispatchEvent(new CustomEvent('projectsUpdated', { detail: { action: 'created', payload } }));
        window.dispatchEvent(new CustomEvent('dashboardUpdate', { detail: { source: 'project:created' } }));
      });
      newSocket.on('project:updated', (payload) => {
        window.dispatchEvent(new CustomEvent('projectsUpdated', { detail: { action: 'updated', payload } }));
        window.dispatchEvent(new CustomEvent('dashboardUpdate', { detail: { source: 'project:updated' } }));
      });
      newSocket.on('project:deleted', (payload) => {
        window.dispatchEvent(new CustomEvent('projectsUpdated', { detail: { action: 'deleted', payload } }));
        window.dispatchEvent(new CustomEvent('dashboardUpdate', { detail: { source: 'project:deleted' } }));
      });

      // Task events -> dispatch so dashboard and task lists refresh
      newSocket.on('task:created', (payload) => {
        window.dispatchEvent(new CustomEvent('tasksUpdated', { detail: { action: 'created', payload } }));
        window.dispatchEvent(new CustomEvent('dashboardUpdate', { detail: { source: 'task:created' } }));
      });
      newSocket.on('task:updated', (payload) => {
        window.dispatchEvent(new CustomEvent('tasksUpdated', { detail: { action: 'updated', payload } }));
        window.dispatchEvent(new CustomEvent('dashboardUpdate', { detail: { source: 'task:updated' } }));
      });
      newSocket.on('task:deleted', (payload) => {
        window.dispatchEvent(new CustomEvent('tasksUpdated', { detail: { action: 'deleted', payload } }));
        window.dispatchEvent(new CustomEvent('dashboardUpdate', { detail: { source: 'task:deleted' } }));
      });

      // Expense events -> dispatch so expenses lists refresh
      newSocket.on('expense:created', (payload) => {
        window.dispatchEvent(new CustomEvent('expensesUpdated', { detail: { action: 'created', payload } }));
        window.dispatchEvent(new CustomEvent('dashboardUpdate', { detail: { source: 'expense:created' } }));
      });
      newSocket.on('expense:updated', (payload) => {
        window.dispatchEvent(new CustomEvent('expensesUpdated', { detail: { action: 'updated', payload } }));
        window.dispatchEvent(new CustomEvent('dashboardUpdate', { detail: { source: 'expense:updated' } }));
      });
      newSocket.on('expense:deleted', (payload) => {
        window.dispatchEvent(new CustomEvent('expensesUpdated', { detail: { action: 'deleted', payload } }));
        window.dispatchEvent(new CustomEvent('dashboardUpdate', { detail: { source: 'expense:deleted' } }));
      });

      // Invoice events -> dispatch so invoice lists and project financials refresh
      newSocket.on('invoice:created', (payload) => {
        window.dispatchEvent(new CustomEvent('invoicesUpdated', { detail: { action: 'created', payload } }));
        window.dispatchEvent(new CustomEvent('dashboardUpdate', { detail: { source: 'invoice:created' } }));
      });
      newSocket.on('invoice:updated', (payload) => {
        window.dispatchEvent(new CustomEvent('invoicesUpdated', { detail: { action: 'updated', payload } }));
        window.dispatchEvent(new CustomEvent('dashboardUpdate', { detail: { source: 'invoice:updated' } }));
      });
      newSocket.on('invoice:deleted', (payload) => {
        window.dispatchEvent(new CustomEvent('invoicesUpdated', { detail: { action: 'deleted', payload } }));
        window.dispatchEvent(new CustomEvent('dashboardUpdate', { detail: { source: 'invoice:deleted' } }));
      });

      // Timesheet events -> dispatch for project financial updates
      newSocket.on('timesheet:created', (payload) => {
        window.dispatchEvent(new CustomEvent('timesheetsUpdated', { detail: { action: 'created', payload } }));
        window.dispatchEvent(new CustomEvent('dashboardUpdate', { detail: { source: 'timesheet:created' } }));
      });
      newSocket.on('timesheet:updated', (payload) => {
        window.dispatchEvent(new CustomEvent('timesheetsUpdated', { detail: { action: 'updated', payload } }));
        window.dispatchEvent(new CustomEvent('dashboardUpdate', { detail: { source: 'timesheet:updated' } }));
      });
      newSocket.on('timesheet:deleted', (payload) => {
        window.dispatchEvent(new CustomEvent('timesheetsUpdated', { detail: { action: 'deleted', payload } }));
        window.dispatchEvent(new CustomEvent('dashboardUpdate', { detail: { source: 'timesheet:deleted' } }));
      });

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  // Fetch notifications on mount
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.delete(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      // Recalculate unread count
      const deletedNotif = notifications.find(n => n.id === notificationId);
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

