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
  Trash2
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

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getById(id);
      
      // Use the actual project data from backend
      const projectData = response.data.project;
      
      // Only add mock financials if not present, but keep real task data
      if (!projectData.financials) {
        projectData.financials = {
          totalRevenue: 50000,
          totalCost: 30000,
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

  const getStatusColor = (status) => {
    const colors = {
      'Planned': 'secondary',
      'In Progress': 'primary',
      'Completed': 'success',
      'On Hold': 'warning'
    };
    return colors[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p>Project not found</p>
      </div>
    );
  }

  const canEdit = hasRole(['Admin', 'Project Manager']) || 
    (project.project_manager_id && project.project_manager_id.toString() === user?.id?.toString()) ||
    (project.members && project.members.some(member => member.id === user?.id));
  const canDelete = hasRole(['Admin']) || 
    (project.project_manager_id && project.project_manager_id.toString() === user?.id?.toString());

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'tasks', label: 'Tasks', icon: FileText },
    { id: 'links', label: 'Links', icon: DollarSign }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/projects')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <div className="flex items-center space-x-3 mt-2">
              <Badge variant={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <span className="text-sm text-gray-500">
                Manager: {project.projectManager?.name}
              </span>
            </div>
          </div>
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
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Project Description */}
      {project.description && (
        <Card className="mb-6">
          <CardContent>
            <p className="text-gray-700">{project.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="text-center">
            <Calendar className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="font-semibold">
              {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <Calendar className="h-8 w-8 mx-auto text-orange-500 mb-2" />
            <p className="text-sm text-gray-500">End Date</p>
            <p className="font-semibold">
              {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <DollarSign className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-sm text-gray-500">Budget</p>
            <p className="font-semibold">
              ${project.budget ? Number(project.budget).toLocaleString() : '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <Users className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="text-sm text-gray-500">Team Members</p>
            <p className="font-semibold">{project.members?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <ProgressBar project={project} className="mb-6" />

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
            {/* Team Members */}
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-700">Project Manager</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {project.projectManager?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{project.projectManager?.name}</p>
                        <p className="text-sm text-gray-500">{project.projectManager?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-700 mb-3">Team Members ({project.members?.length || 0})</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {project.members?.map((member) => (
                        <div key={member.id} className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
                            {member.name?.charAt(0)}
                          </div>
                          <span className="text-sm">{member.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Overview */}
            {project.financials && (
              <Card>
                <CardContent>
                  <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${project.financials.totalRevenue?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600">Cost</p>
                      <p className="text-2xl font-bold text-red-600">
                        ${project.financials.totalCost?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Profit</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${project.financials.profit?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <TaskList projectId={id} />
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
            <p className="text-gray-600">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
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