import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Grid3X3, List, X } from 'lucide-react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Modal from '../../components/UI/Modal';
import CoverImageDialog from '../../components/UI/CoverImageDialog';
import TaskKanbanView from './TaskKanbanView';
import TaskListView from './TaskListView';
import TaskForm from '../../pages/Projects/components/TaskForm';
import { taskAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const Tasks = () => {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [tasks, setTasks] = useState({
    'New': [],
    'In Progress': [],
    'Done': []
  });
  const [filteredTasks, setFilteredTasks] = useState({
    'New': [],
    'In Progress': [],
    'Done': []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [coverImageDialog, setCoverImageDialog] = useState({ isOpen: false, task: null });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await taskAPI.getAll();
      const tasksData = response.data.tasks || [];

      // Group tasks by status
      const groupedTasks = {
        'New': tasksData.filter(task => task.status === 'New'),
        'In Progress': tasksData.filter(task => task.status === 'In Progress'),
        'Done': tasksData.filter(task => task.status === 'Done')
      };

      setTasks(groupedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = { ...tasks };

    // Apply search filter
    if (searchTerm) {
      Object.keys(filtered).forEach(status => {
        filtered[status] = filtered[status].filter(task =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.project?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply priority filter
    if (priorityFilter) {
      Object.keys(filtered).forEach(status => {
        filtered[status] = filtered[status].filter(task =>
          task.priority === priorityFilter
        );
      });
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, priorityFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowCreateModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowCreateModal(true);
  };

  const handleTaskFormClose = () => {
    setShowCreateModal(false);
    setEditingTask(null);
  };

  const handleTaskFormSuccess = () => {
    setShowCreateModal(false);
    setEditingTask(null);
    fetchTasks();
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      try {
        await taskAPI.delete(task.id);
        toast.success('Task deleted successfully');
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      }
    }
  };

  const handleChangeCover = (task) => {
    setCoverImageDialog({ isOpen: true, task });
  };

  const handleSaveCoverImage = async (imageUrl) => {
    try {
      const { task } = coverImageDialog;
      await taskAPI.update(task.id, { cover_image: imageUrl });
      toast.success(imageUrl ? 'Cover image updated' : 'Cover image removed');
      fetchTasks();
    } catch (error) {
      console.error('Error updating cover image:', error);
      toast.error('Failed to update cover image');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('');
  };

  const totalTasks = Object.values(tasks).flat().length;
  const hasFilters = searchTerm || priorityFilter;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">
              {totalTasks} total tasks across all projects
            </p>
          </div>
          <Button onClick={handleCreateTask} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Filters and View Toggle */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tasks or projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          {/* Clear Filters */}
          {hasFilters && (
            <Button variant="outline" onClick={clearFilters} className="text-gray-600">
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 ml-auto">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="w-4 h-4 mr-1 inline" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4 mr-1 inline" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <div className="h-full p-6">
            <TaskKanbanView
              tasks={filteredTasks}
              onTasksUpdate={fetchTasks}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onChangeCover={handleChangeCover}
            />
          </div>
        ) : (
          <div className="h-full">
            <TaskListView
              tasks={Object.values(filteredTasks).flat()}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={fetchTasks}
              onChangeCover={handleChangeCover}
            />
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      <Modal isOpen={showCreateModal} onClose={handleTaskFormClose}>
        <TaskForm
          task={editingTask}
          onClose={handleTaskFormClose}
          onSuccess={handleTaskFormSuccess}
        />
      </Modal>

      {/* Cover Image Dialog */}
      <CoverImageDialog
        isOpen={coverImageDialog.isOpen}
        onClose={() => setCoverImageDialog({ isOpen: false, task: null })}
        onSave={handleSaveCoverImage}
        currentImage={coverImageDialog.task?.cover_image}
      />
    </div>
  );
};

export default Tasks;
