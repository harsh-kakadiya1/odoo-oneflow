import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, FolderKanban, Users, Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Badge from '../../components/UI/Badge';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import ProjectForm from './ProjectForm';
import Settings from '../Settings/Settings';
import { projectAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Projects = () => {
  const { user, hasRole } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll(filters);
      setProjects(response.data.projects);
    } catch (error) {
      toast.error('Failed to load projects');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProjects();
  };

  const getStatusColor = (status) => {
    const colors = {
      'Planned': 'secondary',
      'In Progress': 'primary',
      'Completed': 'success',
      'On Hold': 'warning'
    };
    return colors[status] || 'secondary';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search, Filter, and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Search Bar */}
        <div className="flex-1 w-full">
          <Input
            placeholder="Search projects..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters({ ...filters, status: e.target.value });
            fetchProjects();
          }}
          className="w-full sm:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        >
          <option value="">All Status</option>
          <option value="Planned">Planned</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Settings Button */}
          {hasRole(['Admin', 'Project Manager', 'Sales/Finance']) && (
            <Button 
              variant={showSettingsPanel ? "primary" : "outline"}
              onClick={() => setShowSettingsPanel(!showSettingsPanel)} 
              className="flex-1 sm:flex-none whitespace-nowrap"
            >
              <SettingsIcon className="h-4 w-4 mr-2" />
              {showSettingsPanel ? 'Hide Settings' : 'Settings'}
            </Button>
          )}
          
          {/* New Project Button */}
          {hasRole(['Admin', 'Project Manager']) && (
            <Button onClick={() => setShowCreateModal(true)} className="flex-1 sm:flex-none whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettingsPanel && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Documents</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowSettingsPanel(false)}
            >
              Close
            </Button>
          </div>
          <Settings />
        </div>
      )}

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            // Calculate project progress
            const totalTasks = project.tasks?.length || 0;
            const completedTasks = project.tasks?.filter(t => t.status === 'Done').length || 0;
            const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-200 cursor-pointer h-full">
                  <div className="p-6">
                    {/* Project Name and Status - Same Line */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {project.name}
                      </h3>
                      <Badge variant={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>

                    {/* Separator Line */}
                    <div className="border-t border-gray-200 dark:border-gray-700 mb-4"></div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Project Progress</span>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                          {progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {completedTasks}/{totalTasks} tasks completed
                      </p>
                    </div>

                    {/* Manager and Team */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Manager:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {project.projectManager ? 
                            `${project.projectManager.firstName || ''} ${project.projectManager.lastName || ''}`.trim() || 
                            project.projectManager.name || 
                            'Not assigned'
                            : 'Not assigned'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          Team:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {project.members?.length || 0} members
                        </span>
                      </div>
                    </div>

                    {/* Financial Details */}
                    {project.financials && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Revenue:</span>
                          <span className="font-medium text-success-600 dark:text-success-400">
                            {formatCurrency(project.financials.revenue)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Cost:</span>
                          <span className="font-medium text-error-600 dark:text-error-400">
                            {formatCurrency(project.financials.cost)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Profit:</span>
                          <span className={`font-semibold ${project.financials.profit >= 0 ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                            {formatCurrency(project.financials.profit)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="p-12 text-center">
            <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No projects found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {hasRole(['Admin', 'Project Manager'])
                ? 'Get started by creating your first project'
                : 'No projects have been assigned to you yet'}
            </p>
            {hasRole(['Admin', 'Project Manager']) && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Project"
          size="lg"
        >
          <ProjectForm
            onSuccess={() => {
              setShowCreateModal(false);
              fetchProjects();
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default Projects;

