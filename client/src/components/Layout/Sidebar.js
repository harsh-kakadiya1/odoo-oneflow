import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  DollarSign,
  LogOut,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

const Sidebar = ({ onClose, isExpanded, setIsExpanded }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasRole, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

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
      name: 'Timesheets',
      href: '/timesheets',
      icon: Clock,
      roles: ['Admin', 'Project Manager', 'Team Member', 'Sales/Finance']
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      roles: ['Admin', 'Project Manager', 'Sales/Finance']
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
    <div 
      className={clsx(
        "flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-700",
        isExpanded ? "w-64" : "w-20"
      )}
      onMouseEnter={() => setIsExpanded && setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded && setIsExpanded(false)}
    >
      {/* Close button for mobile */}
      {onClose && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Logo/Brand - FIXED at top */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className={clsx(
          "flex items-center transition-all duration-300",
          isExpanded ? "justify-start" : "justify-center"
        )}>
          <div className="h-10 w-10 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <FileText className="h-6 w-6 text-white" />
          </div>
          {isExpanded && (
            <div className="ml-3 flex-1 min-w-0 overflow-hidden opacity-100 transition-opacity duration-300">
              <p className="text-base font-bold text-gray-900 dark:text-white whitespace-nowrap">
                OneFlow
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Project Management
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation - EXPANDABLE */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <div key={item.name}>
              <Link
                to={item.href}
                onClick={onClose}
                className={clsx(
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 shadow-sm',
                  active
                    ? 'bg-primary-600 dark:bg-primary-700 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md',
                  !isExpanded && 'justify-center'
                )}
                title={!isExpanded ? item.name : ''}
              >
                <Icon
                  className={clsx(
                    'h-5 w-5 flex-shrink-0 transition-colors',
                    active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300',
                    isExpanded && 'mr-3'
                  )}
                />
                {isExpanded && (
                  <span className="whitespace-nowrap overflow-hidden">
                    {item.name}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* User Profile Section - Bottom */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={clsx(
              "flex items-center w-full p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors",
              isExpanded ? "space-x-3" : "justify-center"
            )}
          >
            <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            {isExpanded && (
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.role}
                </p>
              </div>
            )}
          </button>

          {/* Dropdown menu */}
          {showUserMenu && isExpanded && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.role}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/profile');
                  if (onClose) onClose();
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="h-4 w-4 mr-2" />
                Profile Settings
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  navigate('/login');
                  if (onClose) onClose();
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
