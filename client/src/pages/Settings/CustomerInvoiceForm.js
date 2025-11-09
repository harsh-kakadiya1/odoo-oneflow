import React from 'react';
import DocumentForm from './DocumentForm';
import { customerInvoiceAPI } from '../../utils/api';

const CustomerInvoiceForm = () => {
  const fields = [
    {
      name: 'invoice_number',
      label: 'Invoice Number',
      type: 'text',
      placeholder: 'Auto-generated on save',
      disabled: true
    },
    {
      name: 'customer_name',
      label: 'Customer Name',
      type: 'text',
      required: true,
      placeholder: 'Enter customer name'
    },
    {
      name: 'invoice_date',
      label: 'Invoice Date',
      type: 'date',
      required: true
    },
    {
      name: 'due_date',
      label: 'Due Date',
      type: 'date',
      required: true
    },
    {
      name: 'amount',
      label: 'Total Amount (including tax)',
      type: 'number',
      required: true,
      placeholder: '0.00'
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'Draft', label: 'Draft' },
        { value: 'Sent', label: 'Sent' },
        { value: 'Paid', label: 'Paid' }
      ]
    },
    {
      name: 'description',
      label: 'Description / Notes',
      type: 'textarea',
      placeholder: 'Invoice items, services rendered, milestones completed, payment instructions...'
    }
  ];

  return (
    <DocumentForm
      title="Customer Invoice"
      documentApi={customerInvoiceAPI}
      fields={fields}
      backPath="/settings/customer-invoices"
      allowProjectLinking={true}
    />
  );
};

export default CustomerInvoiceForm;

