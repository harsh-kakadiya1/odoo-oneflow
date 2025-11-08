import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { Clock, DollarSign, Info } from 'lucide-react';
import { taskAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const LogHoursModal = ({ isOpen, onClose, task, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    log_date: new Date().toISOString().split('T')[0],
    hours_logged: '',
    description: '',
    is_billable: true
  });
  const [saving, setSaving] = useState(false);

  const userHourlyRate = user?.hourly_rate || 0;

  const calculateCost = () => {
    return (parseFloat(formData.hours_logged) || 0) * userHourlyRate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.hours_logged || parseFloat(formData.hours_logged) <= 0) {
      toast.error('Hours must be greater than 0');
      return;
    }

    if (parseFloat(formData.hours_logged) > 24) {
      toast.error('Hours cannot exceed 24 per day');
      return;
    }

    try {
      setSaving(true);
      await taskAPI.logTimesheet(task.id, formData);
      toast.success('Hours logged successfully');
      if (onSuccess) onSuccess();
      onClose();
      // Reset form
      setFormData({
        log_date: new Date().toISOString().split('T')[0],
        hours_logged: '',
        description: '',
        is_billable: true
      });
    } catch (error) {
      console.error('Error logging hours:', error);
      toast.error(error.response?.data?.message || 'Failed to log hours');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Log Hours - ${task?.title || 'Task'}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={formData.log_date}
            onChange={(e) => setFormData({...formData, log_date: e.target.value})}
            required
          />
        </div>

        {/* Hours */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hours Worked <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            step="0.25"
            min="0.01"
            max="24"
            value={formData.hours_logged}
            onChange={(e) => setFormData({...formData, hours_logged: e.target.value})}
            placeholder="4.5"
            required
          />
          <div className="flex items-start mt-1">
            <Info className="h-3 w-3 text-gray-400 mr-1 mt-0.5" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enter in decimal format (e.g., 1.5 = 1 hour 30 minutes, 0.25 = 15 minutes)
            </p>
          </div>
        </div>

        {/* Billable Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Billable to Customer?
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={formData.is_billable === true}
                onChange={() => setFormData({...formData, is_billable: true})}
                className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-900 dark:text-white">
                ✅ Yes - Billable (Can invoice customer)
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={formData.is_billable === false}
                onChange={() => setFormData({...formData, is_billable: false})}
                className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-900 dark:text-white">
                ⚪ No - Internal/Overhead
              </span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            What did you work on?
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Describe what you accomplished during this time..."
          />
        </div>

        {/* Cost Preview */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="font-medium text-gray-900 dark:text-white">Cost Calculation:</span>
            </div>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              ₹{calculateCost().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {formData.hours_logged || 0} hrs × ₹{userHourlyRate.toLocaleString('en-IN')}/hr
          </p>
          {formData.is_billable && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              ✅ This time can be billed to the customer
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Save Time Log
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LogHoursModal;

