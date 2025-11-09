import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  Calendar, 
  DollarSign, 
  BarChart3,
  Clock,
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import ProjectForm from './ProjectForm';
import TaskList from './components/TaskList';
import LinksPanel from './components/LinksPanel';
import ProgressBar from './components/ProgressBar';
import ProjectTimesheets from './components/ProjectTimesheets';
import { projectAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole, user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    const handleDataUpdated = () => {
      fetchProject(); // Refresh project data
    };
    
    // Listen for various events that should trigger project detail refresh
    window.addEventListener('projectsUpdated', handleDataUpdated);
    window.addEventListener('expensesUpdated', handleDataUpdated);
    window.addEventListener('tasksUpdated', handleDataUpdated);
    window.addEventListener('invoicesUpdated', handleDataUpdated);
    window.addEventListener('timesheetsUpdated', handleDataUpdated);
    window.addEventListener('dashboardUpdate', handleDataUpdated);
    
    return () => {
      window.removeEventListener('projectsUpdated', handleDataUpdated);
      window.removeEventListener('expensesUpdated', handleDataUpdated);
      window.removeEventListener('tasksUpdated', handleDataUpdated);
      window.removeEventListener('invoicesUpdated', handleDataUpdated);
      window.removeEventListener('timesheetsUpdated', handleDataUpdated);
      window.removeEventListener('dashboardUpdate', handleDataUpdated);
    };
  }, []);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getById(id);
      
      // Use the actual project data from backend
      const projectData = response.data.project;
      
      // Only add mock financials if not present, but keep real task data
      if (!projectData.financials) {
        projectData.financials = {
          revenue: 50000,
          cost: 30000,
          profit: 20000
        };
      }
      
      setProject(projectData);
    } catch (error) {
      toast.error('Failed to load project details');
      console.error('Error fetching project:', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectAPI.delete(id);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleCompleteProject = async () => {
    try {
      await projectAPI.update(id, { status: 'Completed' });
      toast.success('Project marked as completed!');
      fetchProject();
    } catch (error) {
      toast.error('Failed to complete project');
    }
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
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Project not found</p>
      </div>
    );
  }

  const canEdit = hasRole(['Admin', 'Project Manager']) || 
    (project.project_manager_id && project.project_manager_id.toString() === user?.id?.toString()) ||
    (project.members && project.members.some(member => member.id === user?.id));
  const canDelete = hasRole(['Admin']) || 
    (project.project_manager_id && project.project_manager_id.toString() === user?.id?.toString());

  // Calculate progress based on completed tasks
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(t => t.status === 'Done' || t.status === 'Completed').length || 0;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isProjectComplete = progressPercentage === 100 && totalTasks > 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'tasks', label: 'Tasks', icon: FileText },
    { id: 'timesheets', label: 'Timesheets', icon: Clock },
    { id: 'links', label: 'Links', icon: DollarSign }
  ];

  return (
    <div className="space-y-6">
      {/* Modern Header - Single Line */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/projects')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {project.name}
          </h1>
          <Badge variant={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>

        {(canEdit || canDelete) && (
          <div className="flex items-center space-x-2">
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                variant="error"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Project Manager - Below Header */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium">Manager:</span>{' '}
        <span className="text-gray-900 dark:text-white">
          {project.projectManager ? 
            `${project.projectManager.firstName || ''} ${project.projectManager.lastName || ''}`.trim() || 
            project.projectManager.name || 
            'Not assigned'
            : 'Not assigned'}
        </span>
      </div>

      {/* Project Description */}
      {project.description && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
        </div>
      )}

      {/* KPI Cards - Updated UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Start Date */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Start Date</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* End Date */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">End Date</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Budget</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(project.budget)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Team Members</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                {project.members?.length || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bars - Updated UI */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Progress */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Project Progress</h3>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {completedTasks}/{totalTasks} Tasks Complete
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {totalTasks - completedTasks} Remaining
              </span>
            </div>
          </div>

          {/* Budget Usage */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Budget Usage</h3>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                0%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: '0%' }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                ₹0 / {formatCurrency(project.budget)}
              </span>
              <span className="text-green-600 dark:text-green-400">
                {formatCurrency(project.budget)} Remaining
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Team Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Team</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Manager */}
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-3">Project Manager</p>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                        {project.projectManager?.firstName?.charAt(0) || project.projectManager?.name?.charAt(0) || 'P'}
                        {project.projectManager?.lastName?.charAt(0) || 'M'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {project.projectManager ? 
                          `${project.projectManager.firstName || ''} ${project.projectManager.lastName || ''}`.trim() || 
                          project.projectManager.name || 
                          'Not assigned'
                          : 'Not assigned'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {project.projectManager?.email || ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Team Members ({project.members?.length || 0})
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {project.members && project.members.length > 0 ? (
                      project.members.map((member) => {
                        const fullName = member.firstName && member.lastName 
                          ? `${member.firstName} ${member.lastName}`.trim()
                          : member.name || 'Unknown';
                        const initials = member.firstName && member.lastName
                          ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
                          : member.name?.substring(0, 2) || 'TM';
                        
                        return (
                          <div key={member.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">
                                {initials}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {fullName}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No team members assigned</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Financial Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue */}
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Revenue</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(project.financials?.revenue)}
                  </p>
                </div>

                {/* Cost */}
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Cost</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(project.financials?.cost)}
                  </p>
                </div>

                {/* Profit */}
                <div className={`text-center p-4 rounded-xl border ${
                  (project.financials?.profit || 0) >= 0 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900'
                }`}>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Profit</p>
                  <p className={`text-3xl font-bold ${
                    (project.financials?.profit || 0) >= 0 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(project.financials?.profit)}
                  </p>
                </div>
              </div>
            </div>

            {/* Complete Project Button */}
            {isProjectComplete && project.status !== 'Completed' && canEdit && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-300">All tasks completed!</h4>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        Mark this project as complete
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="success"
                    onClick={handleCompleteProject}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Project
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <TaskList projectId={id} onTaskUpdate={fetchProject} />
        )}

        {activeTab === 'timesheets' && (
          <ProjectTimesheets projectId={id} />
        )}

        {activeTab === 'links' && (
          <LinksPanel projectId={id} />
        )}
      </div>

      {/* Modals */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Project"
          size="lg"
        >
          <ProjectForm
            project={project}
            onSuccess={() => {
              setShowEditModal(false);
              fetchProject();
            }}
            onCancel={() => setShowEditModal(false)}
          />
        </Modal>
      )}

      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Project"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this project? This action cannot be undone and will delete all associated tasks.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="error"
                onClick={handleDeleteProject}
              >
                Delete Project
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectDetail;
