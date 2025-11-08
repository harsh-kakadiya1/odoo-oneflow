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

const Sidebar = ({ onClose, isExpanded, setIsExpanded }) => {
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
      roles: ['Admin', 'Sales/Finance', 'Project Manager']
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
        "flex flex-col h-full bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out",
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
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Logo/Brand - FIXED at top (always shows on hover) */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className={clsx(
          "flex items-center transition-all duration-300",
          isExpanded ? "justify-start" : "justify-center"
        )}>
          <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
            <FileText className="h-6 w-6 text-white" />
          </div>
          {isExpanded && (
            <div className="ml-3 flex-1 min-w-0 overflow-hidden opacity-100 transition-opacity duration-300">
              <p className="text-base font-bold text-gray-900 whitespace-nowrap">
                OneFlow
              </p>
              <p className="text-xs text-gray-500 whitespace-nowrap">
                Project Management
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation - EXPANDABLE from this line */}
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
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:shadow-md',
                  !isExpanded && 'justify-center'
                )}
                title={!isExpanded ? item.name : ''}
              >
                <Icon
                  className={clsx(
                    'h-5 w-5 flex-shrink-0 transition-colors',
                    active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700',
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

      {/* User info - Part of expandable section */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className={clsx(
          "flex items-center",
          isExpanded ? "space-x-3" : "justify-center"
        )}>
          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          {isExpanded && (
            <div className="flex-1 min-w-0 opacity-100 transition-opacity duration-300">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

