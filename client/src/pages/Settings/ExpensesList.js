import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DocumentListView from './DocumentListView';
import Badge from '../../components/UI/Badge';
import { expenseAPI, projectAPI } from '../../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ExpensesList = () => {
  const [expenses, setExpenses] = useState([]);
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
      const response = await expenseAPI.getAll(params);
      setExpenses(response.data.expenses || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
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
      case 'Pending': return 'yellow';
      case 'Approved': return 'green';
      case 'Rejected': return 'red';
      case 'Reimbursed': return 'blue';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Travel': return '✈️';
      case 'Meals': return '🍽️';
      case 'Office Supplies': return '📎';
      case 'Software': return '💻';
      case 'Marketing': return '📢';
      case 'Training': return '📚';
      default: return '📄';
    }
  };

  const columns = [
    { key: 'description', label: 'Description' },
    { key: 'employee', label: 'Employee' },
    { key: 'category', label: 'Category' },
    { key: 'date', label: 'Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'project', label: 'Project' },
    { key: 'actions', label: 'Actions' }
  ];

  const groupByOptions = [
    { value: 'status', label: 'Status' },
    { value: 'project', label: 'Project' },
    { value: 'partner', label: 'Employee' },
    { value: 'category', label: 'Category' }
  ];

  const renderRow = (expense) => (
    <tr key={expense.id} className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <span className="mr-2">{getCategoryIcon(expense.category)}</span>
          <div>
            <Link
              to={`/settings/expenses/${expense.id}`}
              className="text-blue-600 hover:text-blue-900 font-medium"
            >
              {expense.description}
            </Link>
            {expense.receipt_url && (
              <div className="text-xs text-gray-500 mt-1">📎 Receipt attached</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{expense.user?.name}</div>
        <div className="text-sm text-gray-500">{expense.user?.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {expense.category}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {expense.expense_date ? format(new Date(expense.expense_date), 'MMM dd, yyyy') : '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ₹{expense.amount?.toLocaleString('en-IN') || '0'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge color={getStatusColor(expense.status)}>
          {expense.status}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {expense.project ? (
          <Link
            to={`/projects/${expense.project.id}`}
            className="text-blue-600 hover:text-blue-900 text-sm"
          >
            {expense.project.name}
          </Link>
        ) : (
          <span className="text-gray-400 text-sm">No project</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {expense.status === 'Pending' && (
          <>
            <button
              onClick={() => handleApprove(expense.id)}
              className="text-green-600 hover:text-green-900 mr-4"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(expense.id)}
              className="text-red-600 hover:text-red-900 mr-4"
            >
              Reject
            </button>
          </>
        )}
        <Link
          to={`/settings/expenses/${expense.id}/edit`}
          className="text-indigo-600 hover:text-indigo-900 mr-4"
        >
          Edit
        </Link>
        <Link
          to={`/settings/expenses/${expense.id}`}
          className="text-blue-600 hover:text-blue-900"
        >
          View
        </Link>
      </td>
    </tr>
  );

  const handleApprove = async (expenseId) => {
    try {
      await expenseAPI.update(expenseId, { status: 'Approved' });
      toast.success('Expense approved successfully');
      fetchData();
    } catch (error) {
      console.error('Error approving expense:', error);
      toast.error('Failed to approve expense');
    }
  };

  const handleReject = async (expenseId) => {
    try {
      await expenseAPI.update(expenseId, { status: 'Rejected' });
      toast.success('Expense rejected');
      fetchData();
    } catch (error) {
      console.error('Error rejecting expense:', error);
      toast.error('Failed to reject expense');
    }
  };

  return (
    <DocumentListView
      title="Expenses"
      documents={expenses}
      loading={loading}
      columns={columns}
      searchPlaceholder="Search by description, employee name, or category..."
      createHref="/settings/expenses/new"
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

export default ExpensesList;