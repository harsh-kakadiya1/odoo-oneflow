import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  updatePassword: (passwords) => api.put('/auth/update-password', passwords),
};

// User APIs
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Project APIs
export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getProjectLinks: (id) => api.get(`/projects/${id}/links`),
  getFinancials: (id) => api.get(`/projects/${id}/financials`),
};

// Task APIs
export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  getByProject: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => api.put(`/tasks/${id}`, { status }), // Helper for status updates
  delete: (id) => api.delete(`/tasks/${id}`),
  logTime: (id, data) => api.post(`/tasks/${id}/time`, data),
  getTimeEntries: (id) => api.get(`/tasks/${id}/time`),
  addComment: (id, data) => api.post(`/tasks/${id}/comments`, data),
  getComments: (id) => api.get(`/tasks/${id}/comments`),
  uploadAttachment: (id, formData) => api.post(`/tasks/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAttachments: (id) => api.get(`/tasks/${id}/attachments`),
  logTimesheet: (id, data) => api.post(`/tasks/${id}/timesheets`, data),
  getTimesheets: (id) => api.get(`/tasks/${id}/timesheets`),
};

// Sales Order APIs
export const salesOrderAPI = {
  getAll: (params) => api.get('/sales-orders', { params }),
  getById: (id) => api.get(`/sales-orders/${id}`),
  create: (data) => api.post('/sales-orders', data),
  update: (id, data) => api.put(`/sales-orders/${id}`, data),
  delete: (id) => api.delete(`/sales-orders/${id}`),
};

// Purchase Order APIs
export const purchaseOrderAPI = {
  getAll: (params) => api.get('/purchase-orders', { params }),
  getById: (id) => api.get(`/purchase-orders/${id}`),
  create: (data) => api.post('/purchase-orders', data),
  update: (id, data) => api.put(`/purchase-orders/${id}`, data),
  delete: (id) => api.delete(`/purchase-orders/${id}`),
};

// Customer Invoice APIs
export const customerInvoiceAPI = {
  getAll: (params) => api.get('/customer-invoices', { params }),
  getById: (id) => api.get(`/customer-invoices/${id}`),
  create: (data) => api.post('/customer-invoices', data),
  update: (id, data) => api.put(`/customer-invoices/${id}`, data),
  delete: (id) => api.delete(`/customer-invoices/${id}`),
};

// Vendor Bill APIs
export const vendorBillAPI = {
  getAll: (params) => api.get('/vendor-bills', { params }),
  getById: (id) => api.get(`/vendor-bills/${id}`),
  create: (data) => api.post('/vendor-bills', data),
  update: (id, data) => api.put(`/vendor-bills/${id}`, data),
  delete: (id) => api.delete(`/vendor-bills/${id}`),
};

// Expense APIs
export const expenseAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getPendingApprovals: () => api.get('/expenses/pending/approvals'),
};

// Notification APIs
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentProjects: () => api.get('/dashboard/recent-projects'),
  getRecentTasks: () => api.get('/dashboard/recent-tasks'),
  getProjectStatusChart: () => api.get('/dashboard/charts/project-status'),
  getTaskCompletionChart: () => api.get('/dashboard/charts/task-completion'),
};

// Company APIs
export const companyAPI = {
  getById: (id) => api.get(`/companies/${id}`),
  update: (id, data) => api.put(`/companies/${id}`, data),
  uploadLogo: (id, formData) => api.post(`/companies/${id}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default api;

