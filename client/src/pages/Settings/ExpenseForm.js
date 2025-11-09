import React from 'react';
import DocumentForm from './DocumentForm';
import { expenseAPI } from '../../utils/api';

const ExpenseForm = () => {
  const fields = [
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      required: true,
      placeholder: 'Brief description of the expense'
    },
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      required: true,
      placeholder: '0.00'
    },
    {
      name: 'expense_date',
      label: 'Expense Date',
      type: 'date',
      required: true
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      options: [
        { value: 'Travel', label: 'Travel' },
        { value: 'Meals', label: 'Meals & Entertainment' },
        { value: 'Office Supplies', label: 'Office Supplies' },
        { value: 'Software', label: 'Software & Tools' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Training', label: 'Training & Education' },
        { value: 'Other', label: 'Other' }
      ]
    },
    {
      name: 'is_billable',
      label: 'Billable to Customer',
      type: 'select',
      required: true,
      options: [
        { value: 'false', label: 'No - Internal Expense' },
        { value: 'true', label: 'Yes - Billable to Customer' }
      ]
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'Pending', label: 'Pending Approval' },
        { value: 'Approved', label: 'Approved' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Reimbursed', label: 'Reimbursed' }
      ]
    }
  ];

  return (
    <DocumentForm
      title="Expense"
      documentApi={expenseAPI}
      fields={fields}
      backPath="/settings/expenses"
      allowProjectLinking={true}
    />
  );
};

export default ExpenseForm;