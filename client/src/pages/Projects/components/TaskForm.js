import React, { useState, useEffect } from 'react';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import { taskAPI, userAPI, projectAPI } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const TaskForm = ({ projectId, task, onSuccess, onCancel }) => {
  const { hasRole, user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee_id: '', // Keep for backward compatibility
    assignee_ids: [], // New field for multiple assignees
    due_date: '',
    priority: 'Medium',
    status: 'New',
    project_id: projectId || ''
  });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Check if current user can edit task details
  const canEditDetails = hasRole(['Admin', 'Project Manager']);
  const isAssignee = task && task.assignee_id === user?.id;

  useEffect(() => {
    fetchUsers();
    if (!projectId) {
      fetchProjects();
    }
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignee_id: task.assignee_id || '',
        assignee_ids: task.assignee_id ? [task.assignee_id] : [], // Convert single assignee to array
        due_date: task.due_date || '',
        priority: task.priority || 'Medium',
        status: task.status || 'New',
        project_id: task.project_id || projectId || ''
      });
    }
  }, [task, projectId]);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleAssigneeToggle = (userId) => {
    const currentAssignees = formData.assignee_ids || [];
    const isAssigned = currentAssignees.includes(userId);
    
    let newAssignees;
    if (isAssigned) {
      newAssignees = currentAssignees.filter(id => id !== userId);
    } else {
      newAssignees = [...currentAssignees, userId];
    }
    
    setFormData({ 
      ...formData, 
      assignee_ids: newAssignees,
      assignee_id: newAssignees.length > 0 ? newAssignees[0] : '' // For backward compatibility
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Task title is required';
    if (!formData.project_id && !projectId) newErrors.project_id = 'Project is required';
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
        project_id: formData.project_id || projectId,
        // Send both for backward compatibility
        assignee_id: formData.assignee_ids.length > 0 ? formData.assignee_ids[0] : null,
        assignee_ids: formData.assignee_ids
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

      {/* Project Selection - Only show when no projectId is provided */}
      {!projectId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project *
          </label>
          <select
            name="project_id"
            value={formData.project_id}
            onChange={handleChange}
            required
            disabled={!canEditDetails}
            className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              !canEditDetails ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          >
            <option value="">Select a project...</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {errors.project_id && (
            <p className="text-sm text-red-600 mt-1">{errors.project_id}</p>
          )}
        </div>
      )}

      {/* Assignees - Checkbox Selection for Multiple Users */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Assign To ({formData.assignee_ids.length} selected)
        </label>
        <div className={`border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-60 overflow-y-auto ${
          !canEditDetails ? 'bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60' : 'bg-white dark:bg-gray-800'
        }`}>
          {users.length > 0 ? (
            <div className="space-y-2">
              {users.map((userItem) => (
                <label
                  key={userItem.id}
                  className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !canEditDetails ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.assignee_ids.includes(userItem.id)}
                    onChange={() => handleAssigneeToggle(userItem.id)}
                    disabled={!canEditDetails}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 font-medium text-xs">
                        {userItem.firstName?.charAt(0)}{userItem.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {userItem.firstName} {userItem.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{userItem.role}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No users available</p>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Select one or more users to assign to this task
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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