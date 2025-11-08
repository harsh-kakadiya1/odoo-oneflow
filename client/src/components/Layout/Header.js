import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import NotificationBell from '../UI/NotificationBell';
import DarkModeToggle from '../UI/DarkModeToggle';

const Header = ({ onMenuClick }) => {
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
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
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

          {/* Page title */}
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {getPageTitle()}
            </h1>
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

