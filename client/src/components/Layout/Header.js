import React from 'react';
import { Menu } from 'lucide-react';
import NotificationBell from '../UI/NotificationBell';
import DarkModeToggle from '../UI/DarkModeToggle';

const Header = ({ onMenuClick }) => {

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
              OneFlow
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

