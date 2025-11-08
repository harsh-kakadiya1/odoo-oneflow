import React, { useState } from 'react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { userAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const UserForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Team Member',
    hourly_rate: '0'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await userAPI.create(formData);
      toast.success('User created successfully! Credentials have been sent via email.');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        placeholder="Enter full name"
      />

      <Input
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
        placeholder="user@example.com"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role <span className="text-error-500">*</span>
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="Team Member">Team Member</option>
          <option value="Project Manager">Project Manager</option>
          <option value="Sales/Finance">Sales/Finance</option>
          <option value="Admin">Admin</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-error-600">{errors.role}</p>
        )}
      </div>

      <Input
        label="Hourly Rate (₹)"
        name="hourly_rate"
        type="number"
        step="0.01"
        value={formData.hourly_rate}
        onChange={handleChange}
        placeholder="0.00"
        helperText="Used for timesheet cost calculations"
      />

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-sm text-primary-800">
          <strong>Note:</strong> A temporary password will be automatically generated and sent to the user's email address. They can change it after their first login.
        </p>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={loading}>
          Create User
        </Button>
      </div>
    </form>
  );
};

export default UserForm;

