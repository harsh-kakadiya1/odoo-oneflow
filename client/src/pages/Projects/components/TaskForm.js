import React, { useState, useEffect } from 'react';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import { taskAPI, userAPI } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const TaskForm = ({ projectId, task, onSuccess, onCancel }) => {
  const { hasRole, user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee_id: '',
    due_date: '',
    priority: 'Medium',
    status: 'New'
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Check if current user can edit task details
  const canEditDetails = hasRole(['Admin', 'Project Manager']);
  const isAssignee = task && task.assignee_id === user?.id;

  useEffect(() => {
    fetchUsers();
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignee_id: task.assignee_id || '',
        due_date: task.due_date || '',
        priority: task.priority || 'Medium',
        status: task.status || 'New'
      });
    }
  }, [task]);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Task title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const taskData = {
        ...formData,
        project_id: projectId
      };

      if (task) {
        await taskAPI.update(task.id, taskData);
        toast.success('Task updated successfully');
      } else {
        await taskAPI.create(taskData);
        toast.success('Task created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Task Title - Only editable by admins/PMs */}
      <Input
        label="Task Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
        disabled={!canEditDetails}
      />

      {/* Description - Only editable by admins/PMs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          disabled={!canEditDetails}
          className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            !canEditDetails ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          placeholder="Task description (optional)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assignee - Only editable by admins/PMs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assignee
          </label>
          <select
            name="assignee_id"
            value={formData.assignee_id}
            onChange={handleChange}
            disabled={!canEditDetails}
            className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              !canEditDetails ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          >
            <option value="">Select Assignee</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>

        {/* Due Date - Only editable by admins/PMs */}
        <Input
          label="Due Date"
          name="due_date"
          type="date"
          value={formData.due_date}
          onChange={handleChange}
          disabled={!canEditDetails}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority - Only editable by admins/PMs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            disabled={!canEditDetails}
            className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              !canEditDetails ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Status - Editable by assignee and admins/PMs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={!canEditDetails && !isAssignee}
            className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              (!canEditDetails && !isAssignee) ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          >
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>

      {/* Permission notice for team members */}
      {!canEditDetails && isAssignee && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> As a team member, you can only update the task status. 
            Contact your project manager to modify other task details.
          </p>
        </div>
      )}

      {/* No edit permission notice */}
      {!canEditDetails && !isAssignee && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-700">
            <strong>Access Denied:</strong> You don't have permission to edit this task.
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={!canEditDetails && !isAssignee}
        >
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;