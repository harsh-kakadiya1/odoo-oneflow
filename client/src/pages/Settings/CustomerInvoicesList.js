import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DocumentListView from './DocumentListView';
import Badge from '../../components/UI/Badge';
import { customerInvoiceAPI, projectAPI } from '../../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CustomerInvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [groupBy, setGroupBy] = useState('');

  useEffect(() => {
    fetchData();
    fetchProjects();
  }, [searchTerm, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        ...filters
      };
      const response = await customerInvoiceAPI.getAll(params);
      setInvoices(response.data.customerInvoices || response.data.invoices || []);
    } catch (error) {
      console.error('Error fetching customer invoices:', error);
      toast.error('Failed to load customer invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'gray';
      case 'Sent': return 'blue';
      case 'Paid': return 'green';
      case 'Overdue': return 'red';
      case 'Cancelled': return 'red';
      default: return 'gray';
    }
  };

  const columns = [
    { key: 'number', label: 'Invoice Number' },
    { key: 'customer', label: 'Customer' },
    { key: 'date', label: 'Invoice Date' },
    { key: 'due_date', label: 'Due Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'project', label: 'Project' },
    { key: 'actions', label: 'Actions' }
  ];

  const groupByOptions = [
    { value: 'status', label: 'Status' },
    { value: 'project', label: 'Project' },
    { value: 'partner', label: 'Customer' }
  ];

  const renderRow = (invoice) => (
    <tr key={invoice.id} className="hover:bg-gray-50 dark:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Link
            to={`/settings/customer-invoices/${invoice.id}`}
            className="text-blue-600 hover:text-blue-900 font-medium"
          >
            {invoice.invoice_number}
          </Link>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">{invoice.customer_name}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.customer_email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {invoice.invoice_date ? format(new Date(invoice.invoice_date), 'MMM dd, yyyy') : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {invoice.due_date ? format(new Date(invoice.due_date), 'MMM dd, yyyy') : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        ₹{invoice.amount?.toLocaleString('en-IN') || '0'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge color={getStatusColor(invoice.status)}>
          {invoice.status}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {invoice.project ? (
          <Link
            to={`/projects/${invoice.project.id}`}
            className="text-blue-600 hover:text-blue-900 text-sm"
          >
            {invoice.project.name}
          </Link>
        ) : (
          <span className="text-gray-400 text-sm">No project</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <Link
          to={`/settings/customer-invoices/${invoice.id}/edit`}
          className="text-indigo-600 hover:text-indigo-900 mr-4"
        >
          Edit
        </Link>
        <Link
          to={`/settings/customer-invoices/${invoice.id}`}
          className="text-blue-600 hover:text-blue-900"
        >
          View
        </Link>
      </td>
    </tr>
  );

  return (
    <DocumentListView
      title="Customer Invoices"
      documents={invoices}
      loading={loading}
      columns={columns}
      searchPlaceholder="Search by invoice number, customer name, or email..."
      createHref="/settings/customer-invoices/new"
      onRefresh={fetchData}
      onSearch={setSearchTerm}
      searchTerm={searchTerm}
      filters={filters}
      onFilterChange={handleFilterChange}
      onClearFilters={clearFilters}
      groupBy={groupBy}
      onGroupChange={setGroupBy}
      groupByOptions={groupByOptions}
      projects={projects}
      renderRow={renderRow}
    />
  );
};

export default CustomerInvoicesList;