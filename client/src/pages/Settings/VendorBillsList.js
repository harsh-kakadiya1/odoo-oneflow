import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DocumentListView from './DocumentListView';
import Badge from '../../components/UI/Badge';
import { vendorBillAPI, projectAPI } from '../../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const VendorBillsList = () => {
  const [bills, setBills] = useState([]);
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
      const response = await vendorBillAPI.getAll(params);
      setBills(response.data.vendorBills || response.data.bills || []);
    } catch (error) {
      console.error('Error fetching vendor bills:', error);
      toast.error('Failed to load vendor bills');
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
      case 'Posted': return 'blue';
      case 'Paid': return 'green';
      case 'Cancelled': return 'red';
      default: return 'gray';
    }
  };

  const columns = [
    { key: 'number', label: 'Bill Number' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'date', label: 'Bill Date' },
    { key: 'due_date', label: 'Due Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'project', label: 'Project' },
    { key: 'actions', label: 'Actions' }
  ];

  const groupByOptions = [
    { value: 'status', label: 'Status' },
    { value: 'project', label: 'Project' },
    { value: 'partner', label: 'Vendor' }
  ];

  const renderRow = (bill) => (
    <tr key={bill.id} className="hover:bg-gray-50 dark:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Link
            to={`/settings/vendor-bills/${bill.id}`}
            className="text-blue-600 hover:text-blue-900 font-medium"
          >
            {bill.bill_number}
          </Link>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">{bill.vendor_name}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{bill.vendor_email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {bill.bill_date ? format(new Date(bill.bill_date), 'MMM dd, yyyy') : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {bill.due_date ? format(new Date(bill.due_date), 'MMM dd, yyyy') : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        ₹{bill.amount?.toLocaleString('en-IN') || '0'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge color={getStatusColor(bill.status)}>
          {bill.status}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {bill.project ? (
          <Link
            to={`/projects/${bill.project.id}`}
            className="text-blue-600 hover:text-blue-900 text-sm"
          >
            {bill.project.name}
          </Link>
        ) : (
          <span className="text-gray-400 text-sm">No project</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <Link
          to={`/settings/vendor-bills/${bill.id}/edit`}
          className="text-indigo-600 hover:text-indigo-900 mr-4"
        >
          Edit
        </Link>
        <Link
          to={`/settings/vendor-bills/${bill.id}`}
          className="text-blue-600 hover:text-blue-900"
        >
          View
        </Link>
      </td>
    </tr>
  );

  return (
    <DocumentListView
      title="Vendor Bills"
      documents={bills}
      loading={loading}
      columns={columns}
      searchPlaceholder="Search by bill number, vendor name, or email..."
      createHref="/settings/vendor-bills/new"
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

export default VendorBillsList;