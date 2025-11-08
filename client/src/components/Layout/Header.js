import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, User, LogOut, Settings, Home, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../UI/NotificationBell';
import DarkModeToggle from '../UI/DarkModeToggle';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    // Handle dynamic routes (with IDs)
    if (path.startsWith('/projects/') && path !== '/projects') {
      return 'Project Details';
    }
    if (path.startsWith('/settings/sales-orders/')) {
      return 'Sales Order';
    }
    if (path.startsWith('/settings/expenses/')) {
      return 'Expense';
    }
    
    // Static routes
    const routes = {
      '/dashboard': 'Dashboard',
      '/projects': 'Projects',
      '/tasks': 'Tasks',
      '/analytics': 'Analytics',
      '/users': 'Users',
      '/profile': 'Profile',
      '/settings': 'Settings',
      '/settings/sales-orders': 'Sales Orders',
      '/settings/purchase-orders': 'Purchase Orders',
      '/settings/customer-invoices': 'Customer Invoices',
      '/settings/vendor-bills': 'Vendor Bills',
      '/settings/expenses': 'Expenses',
    };
    
    return routes[path] || 'OneFlow';
  };

  return (
    <header className="bg-gray-50 shadow-sm sticky top-0 z-20">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Breadcrumb navigation */}
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <Home className="h-4 w-4 text-gray-400" />
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-semibold text-gray-900">{getPageTitle()}</span>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            <DarkModeToggle />
            <NotificationBell />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

