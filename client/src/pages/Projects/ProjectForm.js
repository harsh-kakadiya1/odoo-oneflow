import React, { useState, useEffect } from 'react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { projectAPI, userAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const ProjectForm = ({ project, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'Planned',
    project_manager_id: '',
    member_ids: [],
    budget: ''
  });
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers();
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        status: project.status || 'Planned',
        project_manager_id: project.project_manager_id || '',
        member_ids: project.members?.map(m => m.id) || [],
        budget: project.budget || ''
      });
    }
  }, [project]);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      const allUsers = response.data.users;
      setUsers(allUsers.filter(u => u.role === 'Team Member' || u.role === 'Project Manager'));
      setManagers(allUsers.filter(u => u.role === 'Project Manager' || u.role === 'Admin'));
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

  const handleMemberToggle = (userId) => {
    const newMembers = formData.member_ids.includes(userId)
      ? formData.member_ids.filter(id => id !== userId)
      : [...formData.member_ids, userId];
    setFormData({ ...formData, member_ids: newMembers });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.project_manager_id) newErrors.project_manager_id = 'Project manager is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Format the data before sending
      const dataToSend = {
        ...formData,
        // Convert empty date strings to null
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        // Ensure budget is a number or null
        budget: formData.budget ? parseFloat(formData.budget) : null
      };

      if (project) {
        await projectAPI.update(project.id, dataToSend);
        toast.success('Project updated successfully');
      } else {
        await projectAPI.create(dataToSend);
        toast.success('Project created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Project Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        placeholder="Enter project name"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter project description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          name="start_date"
          type="date"
          value={formData.start_date}
          onChange={handleChange}
        />
        <Input
          label="End Date"
          name="end_date"
          type="date"
          value={formData.end_date}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-error-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Manager <span className="text-error-500">*</span>
          </label>
          <select
            name="project_manager_id"
            value={formData.project_manager_id}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select Manager</option>
            {managers.map(manager => (
              <option key={manager.id} value={manager.id}>
                {manager.name} ({manager.role})
              </option>
            ))}
          </select>
          {errors.project_manager_id && (
            <p className="mt-1 text-sm text-error-600">{errors.project_manager_id}</p>
          )}
        </div>
      </div>

      <Input
        label="Budget (₹)"
        name="budget"
        type="number"
        value={formData.budget}
        onChange={handleChange}
        placeholder="Enter budget amount"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Team Members
        </label>
        <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
          {users.length > 0 ? (
            <div className="space-y-2">
              {users.map(user => (
                <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.member_ids.includes(user.id)}
                    onChange={() => handleMemberToggle(user.id)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-900">
                    {user.name} ({user.role})
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No users available</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={loading}>
          {project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;

