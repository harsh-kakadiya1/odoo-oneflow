import React from 'react';
import DocumentForm from './DocumentForm';
import { vendorBillAPI } from '../../utils/api';

const VendorBillForm = () => {
  const fields = [
    {
      name: 'bill_number',
      label: 'Bill Number',
      type: 'text',
      required: true,
      placeholder: 'Enter vendor bill/invoice number'
    },
    {
      name: 'vendor_name',
      label: 'Vendor Name',
      type: 'text',
      required: true,
      placeholder: 'Enter vendor/supplier name'
    },
    {
      name: 'bill_date',
      label: 'Bill Date',
      type: 'date',
      required: true
    },
    {
      name: 'due_date',
      label: 'Payment Due Date',
      type: 'date'
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
        { value: 'Submitted', label: 'Submitted' },
        { value: 'Paid', label: 'Paid' }
      ]
    },
    {
      name: 'description',
      label: 'Description / Notes',
      type: 'textarea',
      placeholder: 'Bill items, services, products purchased, vendor reference, internal notes...'
    }
  ];

  return (
    <DocumentForm
      title="Vendor Bill"
      documentApi={vendorBillAPI}
      fields={fields}
      backPath="/settings/vendor-bills"
      allowProjectLinking={true}
    />
  );
};

export default VendorBillForm;

