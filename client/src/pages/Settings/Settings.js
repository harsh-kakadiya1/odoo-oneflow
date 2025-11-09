import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { 
  FileText, 
  ShoppingCart, 
  Receipt, 
  CreditCard, 
  DollarSign,
  Package,
  ExternalLink
} from 'lucide-react';
import { 
  salesOrderAPI, 
  purchaseOrderAPI, 
  customerInvoiceAPI, 
  vendorBillAPI, 
  expenseAPI 
} from '../../utils/api';
import { format } from 'date-fns';

const SettingsCard = ({ title, icon: Icon, href, color, count }) => (
  <Link to={href} className="block flex-1">
    <Card className="p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 h-full">
      <div className="flex flex-col items-center text-center space-y-2">
        <div className={`p-3 rounded-xl ${color} relative`}>
          <Icon className="h-6 w-6 text-white" />
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {count}
            </span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
    </Card>
  </Link>
);

const Settings = () => {
  const location = useLocation();
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [documentCounts, setDocumentCounts] = useState({
    salesOrders: 0,
    purchaseOrders: 0,
    customerInvoices: 0,
    vendorBills: 0,
    expenses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentDocuments();
  }, []);

  const fetchRecentDocuments = async () => {
    try {
      setLoading(true);
      const [soRes, poRes, ciRes, vbRes, expRes] = await Promise.all([
        salesOrderAPI.getAll({ limit: 5 }),
        purchaseOrderAPI.getAll({ limit: 5 }),
        customerInvoiceAPI.getAll({ limit: 5 }),
        vendorBillAPI.getAll({ limit: 5 }),
        expenseAPI.getAll({ limit: 5 })
      ]);

      // Set counts
      setDocumentCounts({
        salesOrders: soRes.data.count || soRes.data.salesOrders?.length || 0,
        purchaseOrders: poRes.data.count || poRes.data.purchaseOrders?.length || 0,
        customerInvoices: ciRes.data.count || ciRes.data.customerInvoices?.length || 0,
        vendorBills: vbRes.data.count || vbRes.data.vendorBills?.length || 0,
        expenses: expRes.data.count || expRes.data.expenses?.length || 0
      });

      // Combine all documents with type identifier
      const allDocs = [
        ...(soRes.data.salesOrders || []).map(doc => ({ ...doc, docType: 'Sales Order', docColor: 'blue' })),
        ...(poRes.data.purchaseOrders || []).map(doc => ({ ...doc, docType: 'Purchase Order', docColor: 'green' })),
        ...(ciRes.data.customerInvoices || []).map(doc => ({ ...doc, docType: 'Customer Invoice', docColor: 'purple' })),
        ...(vbRes.data.vendorBills || []).map(doc => ({ ...doc, docType: 'Vendor Bill', docColor: 'orange' })),
        ...(expRes.data.expenses || []).map(doc => ({ ...doc, docType: 'Expense', docColor: 'red' }))
      ];

      // Sort by creation date
      allDocs.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));

      // Take top 20
      setRecentDocuments(allDocs.slice(0, 20));
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const settingsModules = [
    {
      title: 'Sales Orders',
      icon: ShoppingCart,
      href: '/settings/sales-orders',
      color: 'bg-blue-500',
      count: documentCounts.salesOrders
    },
    {
      title: 'Purchase Orders',
      icon: Receipt,
      href: '/settings/purchase-orders',
      color: 'bg-green-500',
      count: documentCounts.purchaseOrders
    },
    {
      title: 'Customer Invoices',
      icon: FileText,
      href: '/settings/customer-invoices',
      color: 'bg-purple-500',
      count: documentCounts.customerInvoices
    },
    {
      title: 'Vendor Bills',
      icon: CreditCard,
      href: '/settings/vendor-bills',
      color: 'bg-orange-500',
      count: documentCounts.vendorBills
    },
    {
      title: 'Expenses',
      icon: DollarSign,
      href: '/settings/expenses',
      color: 'bg-red-500',
      count: documentCounts.expenses
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
      'Pending': 'warning',
      'Approved': 'success',
      'Rejected': 'error',
      'Reimbursed': 'success'
    };
    return colors[status] || 'secondary';
  };

  const getDocumentNumber = (doc) => {
    return doc.so_number || doc.po_number || doc.invoice_number || 
           doc.bill_number || doc.description || `#${doc.id}`;
  };

  const getPartnerName = (doc) => {
    return doc.customer_name || doc.vendor_name || doc.user?.name || 'N/A';
  };

  const getDocumentDate = (doc) => {
    const date = doc.order_date || doc.invoice_date || doc.bill_date || doc.expense_date || doc.created_at;
    return date ? format(new Date(date), 'MMM dd, yyyy') : '-';
  };

  // Check if we're on a specific settings page
  const isOnSubPage = location.pathname !== '/settings' && location.pathname.startsWith('/settings/');

  if (isOnSubPage) {
    // This will be handled by individual route components
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 5 Cards in One Row */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {settingsModules.map((module, index) => (
          <SettingsCard key={index} {...module} />
        ))}
      </div>

      {/* Recent Documents from All Categories */}
      <Card>
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Documents - All Categories
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {recentDocuments.length} recent items
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Document #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer/Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:border-gray-700">
                {recentDocuments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No recent documents found. Create your first document using the cards above.
                    </td>
                  </tr>
                ) : (
                  recentDocuments.map((doc, index) => (
                    <tr key={`${doc.docType}-${doc.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={doc.docColor === 'blue' ? 'primary' : 
                                       doc.docColor === 'green' ? 'success' : 
                                       doc.docColor === 'purple' ? 'secondary' : 
                                       doc.docColor === 'orange' ? 'warning' : 'error'}>
                          {doc.docType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getDocumentNumber(doc)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {getPartnerName(doc)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {doc.project ? (
                          <Link
                            to={`/projects/${doc.project.id}`}
                            className="text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400"
                          >
                            {doc.project.name}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-400">No project</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ₹{(doc.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {getDocumentDate(doc)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/settings/${
                            doc.docType === 'Sales Order' ? 'sales-orders' :
                            doc.docType === 'Purchase Order' ? 'purchase-orders' :
                            doc.docType === 'Customer Invoice' ? 'customer-invoices' :
                            doc.docType === 'Vendor Bill' ? 'vendor-bills' : 'expenses'
                          }/${doc.id}/edit`}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 flex items-center"
                        >
                          View <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Settings;