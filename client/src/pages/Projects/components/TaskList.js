import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Clock,
  MessageSquare,
  Paperclip,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Card, CardContent } from '../../../components/UI/Card';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import Badge from '../../../components/UI/Badge';
import LoadingSpinner from '../../../components/UI/LoadingSpinner';
import Modal from '../../../components/UI/Modal';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';
import { taskAPI } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const TaskList = ({ projectId }) => {
  const { user, hasRole } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'my'
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    assignee: ''
  });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getByProject(projectId, {
        ...filters,
        assigneeId: viewMode === 'my' ? user.id : filters.assignee
      });
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Don't use mock data anymore - let it show empty state
      setTasks([]);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId, viewMode, filters, user.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowCreateModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskAPI.delete(taskId);
        toast.success('Task deleted successfully');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskAPI.update(taskId, { status: newStatus });
      toast.success('Task status updated');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'New': 'secondary',
      'In Progress': 'primary',
      'Blocked': 'warning',
      'Done': 'success'
    };
    return colors[status] || 'secondary';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'success',
      'Medium': 'warning',
      'High': 'danger'
    };
    return colors[priority] || 'secondary';
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  const canEditTask = (task) => {
    return hasRole(['Admin', 'Project Manager']) || task.assignee_id === user.id;
  };

  const canEditTaskDetails = (task) => {
    // Only admins and project managers can edit task details (name, description, assignee, etc.)
    return hasRole(['Admin', 'Project Manager']);
  };

  const canChangeTaskStatus = (task) => {
    // Assignees can change status, plus admins and project managers
    return hasRole(['Admin', 'Project Manager']) || task.assignee_id === user.id;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  const filteredTasks = tasks.filter(task => {
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h3>
          <Badge variant="outline">
            {filteredTasks.length} of {tasks.length}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white'
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setViewMode('my')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'my'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white'
              }`}
            >
              My Tasks
            </button>
          </div>

          {hasRole(['Admin', 'Project Manager']) && (
            <Button onClick={handleCreateTask}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                icon={Search}
              />
            </div>
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ search: '', status: '', priority: '', assignee: '' })}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Grid - New Design Matching Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12 text-center">
              <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tasks found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {viewMode === 'my' ? 'No tasks assigned to you' : 'Get started by creating your first task'}
              </p>
              {hasRole(['Admin', 'Project Manager']) && (
                <Button onClick={handleCreateTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Task
                </Button>
              )}
            </div>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const daysUntilDue = getDaysUntilDue(task.due_date);
            const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
            const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 3;

            return (
              <div 
                key={task.id} 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-200 cursor-pointer"
                onClick={() => handleViewTask(task)}
              >
                <div className="p-6">
                  {/* Task Name, Status, and Priority - Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white flex-1 mr-2">
                      {task.title}
                    </h4>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Badge variant={getStatusColor(task.status)} size="sm">
                        {task.status}
                      </Badge>
                      <Badge variant={getPriorityColor(task.priority)} size="sm">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>

                  {/* Separator Line */}
                  <div className="border-t border-gray-200 dark:border-gray-700 mb-4"></div>

                  {/* Edit and Delete Buttons */}
                  {canEditTaskDetails(task) && (
                    <div className="flex items-center space-x-2 mb-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTask(task);
                        }}
                        className="flex items-center px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      {hasRole(['Admin', 'Project Manager']) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="flex items-center px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}

                  {/* Assigned Members */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        Assigned:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {task.assignee ? 
                          (task.assignee.firstName && task.assignee.lastName 
                            ? `${task.assignee.firstName} ${task.assignee.lastName}`.trim()
                            : task.assignee.name || 'Assigned')
                          : 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due Date:
                      </span>
                      <span className={`font-medium ${
                        isOverdue ? 'text-red-600 dark:text-red-400' :
                        isDueSoon ? 'text-yellow-600 dark:text-yellow-400' : 
                        'text-gray-900 dark:text-white'
                      }`}>
                        {formatDate(task.due_date)}
                        {isOverdue && ' (Overdue)'}
                        {isDueSoon && !isOverdue && ` (${daysUntilDue}d)`}
                      </span>
                    </div>
                  </div>

                  {/* Task Progress Change */}
                  {canChangeTaskStatus(task) && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Change Status:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {task.status !== 'In Progress' && task.status !== 'Done' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(task.id, 'In Progress');
                            }}
                            className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-2 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors font-medium"
                          >
                            Start
                          </button>
                        )}
                        {task.status !== 'Done' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(task.id, 'Done');
                            }}
                            className="text-xs bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300 px-3 py-2 rounded-lg hover:bg-success-200 dark:hover:bg-success-800 transition-colors font-medium"
                          >
                            Complete
                          </button>
                        )}
                        {task.status === 'In Progress' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(task.id, 'Blocked');
                            }}
                            className="text-xs bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300 px-3 py-2 rounded-lg hover:bg-warning-200 dark:hover:bg-warning-800 transition-colors font-medium"
                          >
                            Block
                          </button>
                        )}
                        {task.status === 'Done' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(task.id, 'In Progress');
                            }}
                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Task"
          size="lg"
        >
          <TaskForm
            projectId={projectId}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchTasks();
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>
      )}

      {showEditModal && selectedTask && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Task"
          size="lg"
        >
          <TaskForm
            projectId={projectId}
            task={selectedTask}
            onSuccess={() => {
              setShowEditModal(false);
              fetchTasks();
            }}
            onCancel={() => setShowEditModal(false)}
          />
        </Modal>
      )}

      {showDetailModal && selectedTask && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={selectedTask.title}
          size="xl"
        >
          <TaskDetail
            task={selectedTask}
            onUpdate={fetchTasks}
            onClose={() => setShowDetailModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default TaskList;