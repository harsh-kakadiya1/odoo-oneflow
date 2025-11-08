import React, { useState } from 'react';
import { 
  ChevronUp,
  ChevronDown,
  Calendar,
  Star,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../../components/UI/Badge';
import TaskCardMenu from '../../components/UI/TaskCardMenu';
import { taskAPI } from '../../utils/api';

const TaskListView = ({ tasks: initialTasks, onEdit, onDelete, onStatusChange, onChangeCover }) => {
  const [tasks, setTasks] = useState(initialTasks || []);
  const [sortField, setSortField] = useState('priority_score');
  const [sortDirection, setSortDirection] = useState('desc');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Low': return <CheckCircle className="w-4 h-4" />;
      case 'Medium': return <Clock className="w-4 h-4" />;
      case 'High': return <AlertCircle className="w-4 h-4" />;
      case 'Critical': return <Star className="w-4 h-4 fill-current" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const sortTasks = (field) => {
    const direction = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortDirection(direction);

    const sorted = [...tasks].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      // Handle different data types
      if (field === 'due_date') {
        aVal = aVal ? new Date(aVal) : new Date('2099-12-31');
        bVal = bVal ? new Date(bVal) : new Date('2099-12-31');
      } else if (field === 'priority') {
        const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        aVal = priorityOrder[aVal] || 0;
        bVal = priorityOrder[bVal] || 0;
      } else if (field === 'status') {
        const statusOrder = { 'In Progress': 3, 'New': 2, 'Done': 1 };
        aVal = statusOrder[aVal] || 0;
        bVal = statusOrder[bVal] || 0;
      } else if (field === 'assignee_count') {
        aVal = a.assignees ? a.assignees.length : (a.assignee ? 1 : 0);
        bVal = b.assignees ? b.assignees.length : (b.assignee ? 1 : 0);
      } else if (field === 'project_name') {
        aVal = a.project ? a.project.name : '';
        bVal = b.project ? b.project.name : '';
      }

      if (direction === 'desc') {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      } else {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
    });

    setTasks(sorted);
  };

  const SortHeader = ({ field, children, className = '' }) => (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 ${className}`}
      onClick={() => sortTasks(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field && (
          sortDirection === 'desc' ? 
            <ChevronDown className="w-4 h-4" /> : 
            <ChevronUp className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistically update local state
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);

    try {
      // Update backend
      await taskAPI.updateStatus(taskId, newStatus);
      toast.success('Task status updated');
      if (onStatusChange) onStatusChange(taskId, newStatus);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
      // Revert on error
      setTasks(tasks);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortHeader field="title">Task Name</SortHeader>
              <SortHeader field="project_name">Project</SortHeader>
              <SortHeader field="priority">Priority</SortHeader>
              <SortHeader field="status">Status</SortHeader>
              <SortHeader field="assignee_count">Assignees</SortHeader>
              <SortHeader field="due_date">Due Date</SortHeader>
              <SortHeader field="priority_score">Score</SortHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                {/* Task Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {task.description}
                      </div>
                    )}
                  </div>
                </td>

                {/* Project */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {task.project ? task.project.name : '-'}
                  </div>
                </td>

                {/* Priority */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant="custom"
                    className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${getPriorityColor(task.priority)}`}
                  >
                    {getPriorityIcon(task.priority)}
                    {task.priority}
                  </Badge>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`text-xs px-3 py-1 rounded-full border-none outline-none cursor-pointer ${getStatusBadgeColor(task.status)}`}
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </td>

                {/* Assignees */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {task.assignees && task.assignees.length > 0 ? (
                      <div className="flex -space-x-1">
                        {task.assignees.slice(0, 3).map((assignee, i) => (
                          <div
                            key={assignee.id}
                            className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-white"
                            title={`${assignee.firstName} ${assignee.lastName}`}
                          >
                            {assignee.firstName?.[0]}{assignee.lastName?.[0]}
                          </div>
                        ))}
                        {task.assignees.length > 3 && (
                          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-white">
                            +{task.assignees.length - 3}
                          </div>
                        )}
                      </div>
                    ) : task.assignee ? (
                      <div 
                        className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium"
                        title={`${task.assignee.firstName} ${task.assignee.lastName}`}
                      >
                        {task.assignee.firstName?.[0]}{task.assignee.lastName?.[0]}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Unassigned</span>
                    )}
                  </div>
                </td>

                {/* Due Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {task.due_date && (
                      <>
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className={`text-sm ${
                          isOverdue(task.due_date) ? 'text-red-600 font-medium' : 'text-gray-900'
                        }`}>
                          {formatDate(task.due_date)}
                        </span>
                      </>
                    )}
                    {!task.due_date && (
                      <span className="text-gray-400 text-sm">No due date</span>
                    )}
                  </div>
                </td>

                {/* Priority Score */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">
                    {task.priority_score || 0}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <TaskCardMenu
                    onEdit={() => onEdit && onEdit(task)}
                    onDelete={() => onDelete && onDelete(task)}
                    onChangeCover={() => onChangeCover && onChangeCover(task)}
                    className="inline-block"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No tasks found</div>
        </div>
      )}
    </div>
  );
};

export default TaskListView;