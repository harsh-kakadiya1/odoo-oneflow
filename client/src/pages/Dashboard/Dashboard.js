import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI, projectAPI, taskAPI } from '../../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleDataUpdated = () => {
      fetchDashboardData(); // Refresh dashboard data
    };
    
    // Listen for various events that should trigger dashboard refresh
    window.addEventListener('projectsUpdated', handleDataUpdated);
    window.addEventListener('expensesUpdated', handleDataUpdated);
    window.addEventListener('tasksUpdated', handleDataUpdated);
    window.addEventListener('invoicesUpdated', handleDataUpdated);
    window.addEventListener('dashboardUpdate', handleDataUpdated);
    
    return () => {
      window.removeEventListener('projectsUpdated', handleDataUpdated);
      window.removeEventListener('expensesUpdated', handleDataUpdated);
      window.removeEventListener('tasksUpdated', handleDataUpdated);
      window.removeEventListener('invoicesUpdated', handleDataUpdated);
      window.removeEventListener('dashboardUpdate', handleDataUpdated);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, projectsRes, tasksRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentProjects(),
        dashboardAPI.getRecentTasks()
      ]);

      setStats(statsRes.data.stats);
      setRecentProjects(projectsRes.data.projects);
      setRecentTasks(tasksRes.data.tasks);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      'Planned': 'secondary',
      'In Progress': 'primary',
      'Completed': 'success',
      'On Hold': 'warning',
      'New': 'secondary',
      'Blocked': 'error',
      'Done': 'success'
    };
    return colors[status] || 'secondary';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'Admin' || user?.role === 'Sales/Finance' ? (
          <>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.activeProjects || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FolderKanban className="h-6 w-6 text-primary-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hours Logged (Week)</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.hoursLoggedWeek || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-success-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-success-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue (Month)</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    ₹{(stats?.revenueBilledMonth || 0).toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 bg-warning-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-warning-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.overdueTasks || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-error-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-error-600" />
                </div>
              </CardContent>
            </Card>
          </>
        ) : user?.role === 'Project Manager' ? (
          <>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">My Projects</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.activeProjects || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FolderKanban className="h-6 w-6 text-primary-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Team Hours (Week)</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.teamHoursWeek || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-success-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-success-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Expenses</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.pendingExpenses || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-warning-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-warning-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.overdueTasks || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-error-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="h-6 w-6 text-error-600" />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">My Tasks</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.openTasks || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="h-6 w-6 text-primary-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hours (Week)</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.hoursLoggedWeek || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-success-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-success-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.overdueTasks || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-error-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-error-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Expenses</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats?.pendingExpenses || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-warning-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-warning-600" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Projects and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Projects</CardTitle>
              <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Link to={`/projects/${project.id}`} className="font-medium text-gray-900 hover:text-primary-600">
                        {project.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {project.projectManager?.name}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No recent projects</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Tasks</CardTitle>
              <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {task.project?.name}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No recent tasks</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

