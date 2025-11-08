import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  ExternalLink, 
  DollarSign, 
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
      setLinks(response.data);
    } catch (error) {
      console.error('Error fetching project links:', error);
      // Provide mock data for testing
      setLinks({
        salesOrders: [
          {
            id: 1,
            number: 'SO001',
            status: 'Sent',
            total_amount: 25000,
            partner_name: 'ABC Corp',
            date: '2024-11-01'
          },
          {
            id: 2,
            number: 'SO002',
            status: 'Paid',
            total_amount: 15000,
            partner_name: 'XYZ Ltd',
            date: '2024-11-05'
          }
        ],
        purchaseOrders: [
          {
            id: 1,
            number: 'PO001',
            status: 'Draft',
            total_amount: 8000,
            vendor_name: 'Supplier Inc',
            date: '2024-11-03'
          }
        ],
        customerInvoices: [
          {
            id: 1,
            number: 'INV001',
            status: 'Paid',
            total_amount: 25000,
            customer_name: 'ABC Corp',
            date: '2024-11-06'
          }
        ],
        vendorBills: [
          {
            id: 1,
            number: 'BILL001',
            status: 'Pending',
            total_amount: 8000,
            vendor_name: 'Supplier Inc',
            date: '2024-11-04'
          }
        ],
        expenses: [
          {
            id: 1,
            reference: 'EXP001',
            status: 'Approved',
            amount: 500,
            description: 'Travel expenses',
            date: '2024-11-02'
          },
          {
            id: 2,
            reference: 'EXP002',
            status: 'Pending',
            amount: 200,
            description: 'Office supplies',
            date: '2024-11-07'
          }
        ]
      });
      toast.error('Using mock data - backend API not available');
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
      icon: DollarSign,
      color: 'green',
      createRoute: '/sales-orders/create',
      viewRoute: '/sales-orders'
    },
    {
      key: 'purchaseOrders',
      title: 'Purchase Orders',
      icon: ShoppingCart,
      color: 'blue',
      createRoute: '/purchase-orders/create',
      viewRoute: '/purchase-orders'
    },
    {
      key: 'customerInvoices',
      title: 'Customer Invoices',
      icon: FileText,
      color: 'purple',
      createRoute: '/customer-invoices/create',
      viewRoute: '/customer-invoices'
    },
    {
      key: 'vendorBills',
      title: 'Vendor Bills',
      icon: Receipt,
      color: 'orange',
      createRoute: '/vendor-bills/create',
      viewRoute: '/vendor-bills'
    },
    {
      key: 'expenses',
      title: 'Expenses',
      icon: CreditCard,
      color: 'red',
      createRoute: '/expenses/create',
      viewRoute: '/expenses'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'secondary',
      'Sent': 'primary',
      'Paid': 'success',
      'Cancelled': 'danger',
      'Pending': 'warning',
      'Approved': 'success',
      'Rejected': 'danger'
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

                  {hasRole(['Admin', 'Project Manager', 'Sales', 'Finance']) && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Navigate to create new document with project pre-selected
                          window.location.href = `${linkType.createRoute}?project=${projectId}`;
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        New
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Navigate to view all documents
                          window.location.href = `${linkType.viewRoute}?project=${projectId}`;
                        }}
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
                        onClick={() => {
                          // Navigate to document detail
                          window.location.href = `${linkType.viewRoute}/${item.id}`;
                        }}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Sales Orders</p>
              <p className="font-bold text-green-600">
                {formatAmount(links.salesOrders?.reduce((sum, item) => sum + Number(item.total_amount || 0), 0))}
              </p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Purchase Orders</p>
              <p className="font-bold text-blue-600">
                {formatAmount(links.purchaseOrders?.reduce((sum, item) => sum + Number(item.total_amount || 0), 0))}
              </p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Invoices</p>
              <p className="font-bold text-purple-600">
                {formatAmount(links.customerInvoices?.reduce((sum, item) => sum + Number(item.total_amount || 0), 0))}
              </p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Expenses</p>
              <p className="font-bold text-red-600">
                {formatAmount(links.expenses?.reduce((sum, item) => sum + Number(item.amount || 0), 0))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinksPanel;