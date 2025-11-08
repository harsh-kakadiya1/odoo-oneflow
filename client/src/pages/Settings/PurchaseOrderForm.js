import React from 'react';
import DocumentForm from './DocumentForm';
import { purchaseOrderAPI } from '../../utils/api';

const PurchaseOrderForm = () => {
  const fields = [
    {
      name: 'po_number',
      label: 'PO Number',
      type: 'text',
      placeholder: 'Auto-generated on save',
      disabled: true
    },
    {
      name: 'vendor_name',
      label: 'Vendor Name',
      type: 'text',
      required: true,
      placeholder: 'Enter vendor/supplier name'
    },
    {
      name: 'vendor_email',
      label: 'Vendor Email',
      type: 'email',
      placeholder: 'vendor@example.com'
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
      label: 'Description',
      type: 'textarea',
      placeholder: 'Purchase order details, items, specifications, payment terms...'
    }
  ];

  return (
    <DocumentForm
      title="Purchase Order"
      documentApi={purchaseOrderAPI}
      fields={fields}
      backPath="/settings/purchase-orders"
      allowProjectLinking={true}
    />
  );
};

export default PurchaseOrderForm;

