import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DocumentListView from './DocumentListView';
import Badge from '../../components/UI/Badge';
import { salesOrderAPI, projectAPI } from '../../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const SalesOrdersList = () => {
  const [salesOrders, setSalesOrders] = useState([]);
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
      const response = await salesOrderAPI.getAll(params);
      setSalesOrders(response.data.salesOrders || []);
    } catch (error) {
      console.error('Error fetching sales orders:', error);
      toast.error('Failed to load sales orders');
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
      case 'Confirmed': return 'blue';
      case 'Invoiced': return 'green';
      case 'Cancelled': return 'red';
      default: return 'gray';
    }
  };

  const columns = [
    { key: 'number', label: 'Order Number' },
    { key: 'partner', label: 'Customer' },
    { key: 'date', label: 'Order Date' },
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

  const renderRow = (order) => (
    <tr key={order.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Link
            to={`/settings/sales-orders/${order.id}`}
            className="text-blue-600 hover:text-blue-900 font-medium"
          >
            {order.order_number}
          </Link>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{order.partner_name}</div>
        <div className="text-sm text-gray-500">{order.partner_email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.order_date ? format(new Date(order.order_date), 'MMM dd, yyyy') : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ${order.total_amount?.toLocaleString() || '0.00'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge color={getStatusColor(order.status)}>
          {order.status}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {order.project ? (
          <Link
            to={`/projects/${order.project.id}`}
            className="text-blue-600 hover:text-blue-900 text-sm"
          >
            {order.project.name}
          </Link>
        ) : (
          <span className="text-gray-400 text-sm">No project</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <Link
          to={`/settings/sales-orders/${order.id}/edit`}
          className="text-indigo-600 hover:text-indigo-900 mr-4"
        >
          Edit
        </Link>
        <Link
          to={`/settings/sales-orders/${order.id}`}
          className="text-blue-600 hover:text-blue-900"
        >
          View
        </Link>
      </td>
    </tr>
  );

  return (
    <DocumentListView
      title="Sales Orders"
      documents={salesOrders}
      loading={loading}
      columns={columns}
      searchPlaceholder="Search by order number, customer name, or email..."
      createHref="/settings/sales-orders/new"
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

export default SalesOrdersList;