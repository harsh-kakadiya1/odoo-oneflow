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
  AlertCircle
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
          <h3 className="text-xl font-semibold text-gray-900">Tasks</h3>
          <Badge variant="outline">
            {filteredTasks.length} of {tasks.length}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'all'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setViewMode('my')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'my'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">
              {viewMode === 'my' ? 'No tasks assigned to you' : 'No tasks found'}
            </p>
            {hasRole(['Admin', 'Project Manager']) && (
              <Button
                variant="outline"
                onClick={handleCreateTask}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Task
              </Button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const daysUntilDue = getDaysUntilDue(task.due_date);
            const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
            const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 3;

            return (
              <Card 
                key={task.id} 
                className={`group hover:shadow-md transition-shadow cursor-pointer ${
                  isOverdue ? 'border-red-200 bg-red-50' : 
                  isDueSoon ? 'border-yellow-200 bg-yellow-50' : ''
                }`}
                onClick={() => handleViewTask(task)}
              >
                <CardContent>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={getStatusColor(task.status)} size="sm">
                          {task.status}
                        </Badge>
                        <Badge variant={getPriorityColor(task.priority)} size="sm">
                          {task.priority}
                        </Badge>
                      </div>
                    </div>

                    {canEditTaskDetails(task) && (
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTask(task);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {hasRole(['Admin', 'Project Manager']) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    {/* Assignee */}
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {task.assignee?.name || 'Unassigned'}
                      </span>
                    </div>

                    {/* Due Date */}
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className={`${
                        isOverdue ? 'text-red-600 font-medium' :
                        isDueSoon ? 'text-yellow-600 font-medium' : 'text-gray-600'
                      }`}>
                        {formatDate(task.due_date)}
                        {isOverdue && (
                          <span className="ml-1">
                            <AlertCircle className="h-3 w-3 inline" />
                            Overdue
                          </span>
                        )}
                        {isDueSoon && !isOverdue && (
                          <span className="ml-1 text-yellow-600">
                            Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Task Meta */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        {task.comments_count > 0 && (
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{task.comments_count}</span>
                          </div>
                        )}
                        {task.attachments_count > 0 && (
                          <div className="flex items-center space-x-1">
                            <Paperclip className="h-3 w-3" />
                            <span>{task.attachments_count}</span>
                          </div>
                        )}
                        {task.logged_hours > 0 && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.logged_hours}h</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Status Actions */}
                      {canChangeTaskStatus(task) && (
                        <div className="flex space-x-1">
                          {task.status === 'New' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task.id, 'In Progress');
                              }}
                              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                            >
                              Start
                            </button>
                          )}
                          {task.status === 'In Progress' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(task.id, 'Done');
                                }}
                                className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                              >
                                Complete
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(task.id, 'Blocked');
                                }}
                                className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
                              >
                                Block
                              </button>
                            </>
                          )}
                          {task.status === 'Blocked' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(task.id, 'In Progress');
                                }}
                                className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                              >
                                Resume
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(task.id, 'Done');
                                }}
                                className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                              >
                                Complete
                              </button>
                            </>
                          )}
                          {task.status === 'Done' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task.id, 'In Progress');
                              }}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
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