import React from 'react';
import DocumentForm from './DocumentForm';
import { salesOrderAPI } from '../../utils/api';

const SalesOrderForm = () => {
  const fields = [
    {
      name: 'so_number',
      label: 'SO Number',
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
      name: 'customer_email',
      label: 'Customer Email',
      type: 'email',
      placeholder: 'customer@example.com'
    },
    {
      name: 'order_date',
      label: 'Order Date',
      type: 'date',
      required: true
    },
    {
      name: 'amount',
      label: 'Total Amount',
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
        { value: 'Confirmed', label: 'Confirmed' },
        { value: 'Billed', label: 'Billed' }
      ]
    },
    {
      name: 'description',
      label: 'Description / Terms & Conditions',
      type: 'textarea',
      placeholder: 'Order details, payment terms, delivery conditions...'
    }
  ];

  return (
    <DocumentForm
      title="Sales Order"
      documentApi={salesOrderAPI}
      fields={fields}
      backPath="/settings/sales-orders"
      allowProjectLinking={true}
    />
  );
};

export default SalesOrderForm;