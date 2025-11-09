import React from 'react';
import DocumentForm from './DocumentForm';
import { salesOrderAPI } from '../../utils/api';

const SalesOrderForm = () => {
  const fields = [
    {
      name: 'order_number',
      label: 'Order Number',
      type: 'text',
      placeholder: 'Auto-generated if left empty'
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
      name: 'customer_phone',
      label: 'Customer Phone',
      type: 'tel',
      placeholder: '+1 (555) 123-4567'
    },
    {
      name: 'order_date',
      label: 'Order Date',
      type: 'date',
      required: true
    },
    {
      name: 'delivery_date',
      label: 'Expected Delivery Date',
      type: 'date'
    },
    {
      name: 'total_amount',
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
        { value: 'Invoiced', label: 'Invoiced' },
        { value: 'Cancelled', label: 'Cancelled' }
      ]
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Order details and notes...'
    },
    {
      name: 'terms_conditions',
      label: 'Terms & Conditions',
      type: 'textarea',
      placeholder: 'Payment terms, delivery conditions...'
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