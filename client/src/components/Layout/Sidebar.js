import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  User,
  FileText,
  X,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { user, hasRole } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['Admin', 'Project Manager', 'Team Member', 'Sales/Finance']
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderKanban,
      roles: ['Admin', 'Project Manager', 'Team Member', 'Sales/Finance']
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: CheckSquare,
      roles: ['Admin', 'Project Manager', 'Team Member']
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      roles: ['Admin', 'Project Manager', 'Sales/Finance']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['Admin', 'Sales/Finance', 'Project Manager'],
      children: [
        { name: 'Sales Orders', href: '/settings/sales-orders' },
        { name: 'Purchase Orders', href: '/settings/purchase-orders' },
        { name: 'Customer Invoices', href: '/settings/customer-invoices' },
        { name: 'Vendor Bills', href: '/settings/vendor-bills' },
        { name: 'Expenses', href: '/settings/expenses' }
      ]
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      roles: ['Admin', 'Project Manager']
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      roles: ['Admin', 'Project Manager', 'Team Member', 'Sales/Finance']
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    hasRole(item.roles)
  );

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Close button for mobile */}
      {onClose && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Logo/Brand */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-900">
              OneFlow
            </p>
            <p className="text-xs text-gray-500">
              Project Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <div key={item.name}>
              <Link
                to={item.href}
                onClick={onClose}
                className={clsx(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  active
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon
                  className={clsx(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    active
                      ? 'text-primary-500'
                      : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
              
              {/* Sub-menu for Settings */}
              {item.children && active && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      onClick={onClose}
                      className={clsx(
                        'block px-3 py-1.5 text-xs rounded-md transition-colors',
                        location.pathname === child.href
                          ? 'text-primary-700 bg-primary-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

