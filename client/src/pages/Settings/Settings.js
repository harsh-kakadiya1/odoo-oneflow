import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { 
  FileText, 
  ShoppingCart, 
  Receipt, 
  CreditCard, 
  DollarSign,
  Package
} from 'lucide-react';

const SettingsCard = ({ title, description, icon: Icon, href, color }) => (
  <Link to={href} className="block">
    <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 h-full">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </Card>
  </Link>
);

const Settings = () => {
  const location = useLocation();

  const settingsModules = [
    {
      title: 'Sales Orders',
      description: 'Manage all sales orders across projects. Create new orders and link them to projects.',
      icon: ShoppingCart,
      href: '/settings/sales-orders',
      color: 'bg-blue-500'
    },
    {
      title: 'Purchase Orders',
      description: 'Track purchase orders and procurement. Link orders to specific projects for better tracking.',
      icon: Receipt,
      href: '/settings/purchase-orders',
      color: 'bg-green-500'
    },
    {
      title: 'Customer Invoices',
      description: 'Manage customer invoices and billing. Generate invoices from sales orders.',
      icon: FileText,
      href: '/settings/customer-invoices',
      color: 'bg-purple-500'
    },
    {
      title: 'Vendor Bills',
      description: 'Track vendor bills and payments. Link bills to purchase orders and projects.',
      icon: CreditCard,
      href: '/settings/vendor-bills',
      color: 'bg-orange-500'
    },
    {
      title: 'Expenses',
      description: 'Manage employee expenses and reimbursements. Track project-related expenses.',
      icon: DollarSign,
      href: '/settings/expenses',
      color: 'bg-red-500'
    }
  ];

  // Check if we're on a specific settings page
  const isOnSubPage = location.pathname !== '/settings' && location.pathname.startsWith('/settings/');

  if (isOnSubPage) {
    // This will be handled by individual route components
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsModules.map((module, index) => (
          <SettingsCard key={index} {...module} />
        ))}
      </div>

      <div className="mt-12 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Global Lists</h3>
            <p>
              Each module shows a global list of all documents across all projects. 
              Use these lists to get a comprehensive view of your business operations.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Search & Filter</h3>
            <p>
              Search documents by number, partner, amount, or state. 
              Filter by date ranges, partners, status, or specific projects.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Group & Organize</h3>
            <p>
              Group documents by project, partner, or state to organize your view. 
              Create new documents or link existing ones to projects.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Project Integration</h3>
            <p>
              Documents created here can be linked to projects. 
              View project-specific documents in the project's Links panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;