import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoadingSpinner from './components/UI/LoadingSpinner';
import Layout from './components/Layout/Layout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Main Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Projects from './pages/Projects/Projects';
import Analytics from './pages/Analytics/Analytics';
import ProjectDetail from './pages/Projects/ProjectDetail';
import Tasks from './pages/Tasks/Tasks';
import Users from './pages/Users/Users';
import Profile from './pages/Profile/Profile';

// Settings Pages
import Settings from './pages/Settings/Settings';
import SalesOrdersList from './pages/Settings/SalesOrdersList';
import PurchaseOrdersList from './pages/Settings/PurchaseOrdersList';
import CustomerInvoicesList from './pages/Settings/CustomerInvoicesList';
import VendorBillsList from './pages/Settings/VendorBillsList';
import ExpensesList from './pages/Settings/ExpensesList';
import SalesOrderForm from './pages/Settings/SalesOrderForm';
import ExpenseForm from './pages/Settings/ExpenseForm';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">You don't have permission to view this page.</p>
        </div>
      </Layout>
    );
  }

  return <Layout>{children}</Layout>;
};

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Project Manager', 'Sales/Finance']}>
            <Analytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Sales/Finance', 'Project Manager']}>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/sales-orders"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Sales/Finance', 'Project Manager']}>
            <SalesOrdersList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/purchase-orders"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Sales/Finance', 'Project Manager']}>
            <PurchaseOrdersList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/customer-invoices"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Sales/Finance', 'Project Manager']}>
            <CustomerInvoicesList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/vendor-bills"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Sales/Finance', 'Project Manager']}>
            <VendorBillsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/expenses"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Sales/Finance', 'Project Manager']}>
            <ExpensesList />
          </ProtectedRoute>
        }
      />

      {/* Form Routes */}
      <Route
        path="/settings/sales-orders/new"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Sales/Finance', 'Project Manager']}>
            <SalesOrderForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/sales-orders/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Sales/Finance', 'Project Manager']}>
            <SalesOrderForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/expenses/new"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Sales/Finance', 'Project Manager']}>
            <ExpenseForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/expenses/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Sales/Finance', 'Project Manager']}>
            <ExpenseForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Project Manager']}>
            <Users />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: '',
                style: {
                  background: 'var(--toast-bg, #fff)',
                  color: 'var(--toast-color, #363636)',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
