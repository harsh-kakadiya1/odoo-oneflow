import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  Clock, 
  DollarSign,
  AlertCircle,
  TrendingUp,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI } from '../../utils/api';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, projectsRes, tasksRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentProjects(),
        dashboardAPI.getRecentTasks()
      ]);

      console.log('✅ Dashboard API Response:', {
        stats: statsRes.data.stats,
        projectsCount: projectsRes.data.projects?.length || 0,
        tasksCount: tasksRes.data.tasks?.length || 0
      });

      // Check if user has company_id
      if (Object.keys(statsRes.data.stats || {}).length === 0) {
        console.warn('⚠️ Warning: Stats object is empty. User may not have company_id set!');
        console.warn('🔧 Fix: Run QUICK_DATABASE_FIX.sql script and logout/login');
      }

      setStats(statsRes.data.stats || {});
      setRecentProjects(projectsRes.data.projects || []);
      setRecentTasks(tasksRes.data.tasks || []);
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      console.error('Error details:', error.response?.data);
      // Set empty defaults on error
      setStats({});
      setRecentProjects([]);
      setRecentTasks([]);
    } finally {
      setLoading(false);
    }
  };

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

  const filterButtons = [
    { label: 'All', value: 'All' },
    { label: 'Planned', value: 'Planned' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
    { label: 'On Hold', value: 'On Hold' }
  ];

  const filteredProjects = activeFilter === 'All' 
    ? recentProjects 
    : recentProjects.filter(p => p.status === activeFilter);

  // Chart data - Project Status Distribution
  const projectStatusData = {
    labels: ['Planned', 'In Progress', 'Completed', 'On Hold'],
    datasets: [{
      label: 'Projects',
      data: [
        recentProjects.filter(p => p.status === 'Planned').length,
        recentProjects.filter(p => p.status === 'In Progress').length,
        recentProjects.filter(p => p.status === 'Completed').length,
        recentProjects.filter(p => p.status === 'On Hold').length
      ],
      backgroundColor: [
        'rgba(107, 114, 128, 0.8)',
        'rgba(147, 51, 234, 0.8)',  // Purple instead of blue
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)'
      ],
      borderColor: [
        'rgb(107, 114, 128)',
        'rgb(147, 51, 234)',  // Purple instead of blue
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)'
      ],
      borderWidth: 2,
      borderRadius: 8
    }]
  };

  // Chart data - Task Progress Over Time
  const taskProgressData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Tasks Completed',
      data: [12, 19, 15, 25, 22, 30, 28],
      fill: true,
      borderColor: 'rgb(147, 51, 234)',  // Purple instead of blue
      backgroundColor: 'rgba(147, 51, 234, 0.1)',  // Purple instead of blue
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: 'rgb(147, 51, 234)',  // Purple instead of blue
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6b7280'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6b7280'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check if user needs to fix company_id
  const hasNoData = !stats || Object.keys(stats).length === 0;

  return (
    <div className="space-y-6">
      

      {/* Filter Buttons */}
      <div className="flex items-center space-x-3">
        {filterButtons.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeFilter === filter.value
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:shadow-sm'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Projects */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.activeProjects || 0}
              </p>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{stats?.totalProjects || 0} total
              </p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FolderKanban className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        {/* Delayed Tasks */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Delayed Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.overdueTasks || 0}
              </p>
              <p className="text-sm text-red-600 mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Needs attention
              </p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <AlertCircle className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        {/* Hours Logged */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Hours Logged</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.hoursLoggedWeek || 0}
              </p>
              <p className="text-sm text-gray-600 mt-2 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                This week
              </p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        {/* Revenue Earned */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Revenue Earned</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ₹{(stats?.revenueBilledMonth || 0).toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                This month
              </p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Project Status Distribution</h3>
            <p className="text-sm text-gray-500 mt-1">Overview of all project statuses</p>
          </div>
          <div style={{ height: '280px' }}>
            <Bar data={projectStatusData} options={chartOptions} />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Updated just now
            </p>
          </div>
        </div>

        {/* Task Progress Over Time */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">Task Completion Trend</h3>
            <p className="text-sm text-gray-500 mt-1">
              <span className="text-green-600 font-semibold">+15%</span> increase in task completion
            </p>
          </div>
          <div style={{ height: '280px' }}>
            <Line data={taskProgressData} options={chartOptions} />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Updated 4 min ago
            </p>
          </div>
        </div>
      </div>

      {/* Recent Projects and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Projects</h3>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="text-green-600 font-semibold">✓ {recentProjects.filter(p => p.status === 'Completed').length}</span> completed this month
                </p>
              </div>
              <Link 
                to="/projects" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {filteredProjects.length > 0 ? (
              <div className="space-y-4">
                {filteredProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex-1">
                      <Link 
                        to={`/projects/${project.id}`} 
                        className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {project.name}
                      </Link>
                      <div className="flex items-center space-x-3 mt-2">
                        {project.projectManager && (
                          <p className="text-sm text-gray-500">
                            {project.projectManager.firstName} {project.projectManager.lastName}
                          </p>
                        )}
                        {project.start_date && (
                          <>
                            <span className="text-gray-300">•</span>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(project.start_date).toLocaleDateString()}
                            </p>
                          </>
                        )}
                        {project.budget && (
                          <>
                            <span className="text-gray-300">•</span>
                            <p className="text-sm text-gray-500">
                              ₹{parseFloat(project.budget).toLocaleString()}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No projects found</p>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Tasks</h3>
                <p className="text-sm text-gray-500 mt-1">Latest task activities</p>
              </div>
              <Link 
                to="/tasks" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                      task.status === 'Completed' ? 'bg-green-500' :
                      task.status === 'In Progress' ? 'bg-purple-500' :
                      task.status === 'Blocked' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        {task.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">
                          {task.project?.name || 'No project'}
                        </p>
                        {task.due_date && (
                          <>
                            <span className="text-gray-300">•</span>
                            <p className="text-xs text-gray-500">
                              {new Date(task.due_date).toLocaleDateString()}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(task.status)} className="flex-shrink-0">
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No recent tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
