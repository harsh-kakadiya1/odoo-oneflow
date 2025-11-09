import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ExternalLink, 
  IndianRupee, 
  ShoppingCart, 
  FileText, 
  Receipt,
  CreditCard
} from 'lucide-react';
import { Card, CardContent } from '../../../components/UI/Card';
import Button from '../../../components/UI/Button';
import Badge from '../../../components/UI/Badge';
import LoadingSpinner from '../../../components/UI/LoadingSpinner';
import { projectAPI } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const LinksPanel = ({ projectId }) => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [links, setLinks] = useState({
    salesOrders: [],
    purchaseOrders: [],
    customerInvoices: [],
    vendorBills: [],
    expenses: []
  });
  const [loading, setLoading] = useState(true);

  const fetchProjectLinks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getProjectLinks(projectId);
      setLinks(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching project links:', error);
      toast.error('Failed to load project links');
      setLinks({
        salesOrders: [],
        purchaseOrders: [],
        customerInvoices: [],
        vendorBills: [],
        expenses: []
      });
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectLinks();
  }, [fetchProjectLinks]);

  const linkTypes = [
    {
      key: 'salesOrders',
      title: 'Sales Orders',
      icon: IndianRupee,
      color: 'green',
      createRoute: '/settings/sales-orders/new',
      viewRoute: '/settings/sales-orders',
      detailRoute: '/settings/sales-orders'
    },
    {
      key: 'purchaseOrders',
      title: 'Purchase Orders',
      icon: ShoppingCart,
      color: 'blue',
      createRoute: '/settings/purchase-orders/new',
      viewRoute: '/settings/purchase-orders',
      detailRoute: '/settings/purchase-orders'
    },
    {
      key: 'customerInvoices',
      title: 'Customer Invoices',
      icon: FileText,
      color: 'purple',
      createRoute: '/settings/customer-invoices/new',
      viewRoute: '/settings/customer-invoices',
      detailRoute: '/settings/customer-invoices'
    },
    {
      key: 'vendorBills',
      title: 'Vendor Bills',
      icon: Receipt,
      color: 'orange',
      createRoute: '/settings/vendor-bills/new',
      viewRoute: '/settings/vendor-bills',
      detailRoute: '/settings/vendor-bills'
    },
    {
      key: 'expenses',
      title: 'Expenses',
      icon: CreditCard,
      color: 'red',
      createRoute: '/settings/expenses/new',
      viewRoute: '/settings/expenses',
      detailRoute: '/settings/expenses'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'secondary',
      'Confirmed': 'primary',
      'Billed': 'success',
      'Sent': 'primary',
      'Paid': 'success',
      'Submitted': 'primary',
      'Received': 'success',
      'Cancelled': 'error',
      'Pending': 'warning',
      'Approved': 'success',
      'Rejected': 'error',
      'Reimbursed': 'success',
      'Overdue': 'error'
    };
    return colors[status] || 'secondary';
  };

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Linked Financial Documents</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Financial documents linked to this project
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {linkTypes.map((linkType) => {
          const Icon = linkType.icon;
          const items = links[linkType.key] || [];
          const totalAmount = items.reduce((sum, item) => sum + Number(item.total_amount || item.amount || 0), 0);

          return (
            <Card key={linkType.key} className="h-fit">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-5 w-5 text-${linkType.color}-500`} />
                    <h4 className="font-semibold text-gray-900 dark:text-white">{linkType.title}</h4>
                    <Badge variant="outline" className="ml-2">
                      {items.length}
                    </Badge>
                  </div>

                  {hasRole(['Admin', 'Project Manager', 'Sales/Finance']) && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(linkType.createRoute)}
                        title={`Create new ${linkType.title.toLowerCase()}`}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        New
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(linkType.viewRoute)}
                        title={`View all ${linkType.title.toLowerCase()}`}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount:</span>
                    <span className={`font-semibold text-${linkType.color}-600`}>
                      {formatAmount(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Document List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      No {linkType.title.toLowerCase()} linked to this project
                    </p>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:shadow-sm transition-shadow cursor-pointer"
                        onClick={() => navigate(`${linkType.detailRoute}/${item.id}/edit`)}
                        title={`View/Edit ${item.number || item.reference}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              {item.number || item.reference || `#${item.id}`}
                            </span>
                            <Badge variant={getStatusColor(item.status)} size="sm">
                              {item.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {item.partner_name || item.vendor_name || item.customer_name || 'N/A'}
                            </span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {formatAmount(item.total_amount || item.amount)}
                            </span>
                          </div>
                          {item.date && (
                            <span className="text-xs text-gray-400">
                              {formatDate(item.date)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Actions */}
                {items.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center">
                        <span className="text-gray-500 dark:text-gray-400">Draft: </span>
                        <span className="font-medium">
                          {items.filter(item => item.status === 'Draft').length}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-500 dark:text-gray-400">Paid/Approved: </span>
                        <span className="font-medium">
                          {items.filter(item => ['Paid', 'Approved'].includes(item.status)).length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Financial Summary */}
      <Card>
        <CardContent>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Project Financial Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Sales Orders</p>
              <p className="font-bold text-green-600 dark:text-green-400">
                {formatAmount(links.salesOrders?.reduce((sum, item) => sum + Number(item.amount || 0), 0))}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{links.salesOrders?.length || 0} orders</p>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Purchase Orders</p>
              <p className="font-bold text-blue-600 dark:text-blue-400">
                {formatAmount(links.purchaseOrders?.reduce((sum, item) => sum + Number(item.amount || 0), 0))}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{links.purchaseOrders?.length || 0} orders</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Invoices</p>
              <p className="font-bold text-purple-600 dark:text-purple-400">
                {formatAmount(links.customerInvoices?.reduce((sum, item) => sum + Number(item.amount || 0), 0))}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{links.customerInvoices?.length || 0} invoices</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Vendor Bills</p>
              <p className="font-bold text-orange-600 dark:text-orange-400">
                {formatAmount(links.vendorBills?.reduce((sum, item) => sum + Number(item.amount || 0), 0))}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{links.vendorBills?.length || 0} bills</p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Expenses</p>
              <p className="font-bold text-red-600 dark:text-red-400">
                {formatAmount(links.expenses?.reduce((sum, item) => sum + Number(item.amount || 0), 0))}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{links.expenses?.length || 0} items</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinksPanel;