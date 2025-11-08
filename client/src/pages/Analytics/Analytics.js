import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign,
  FolderKanban,
  CheckCircle2,
  Filter,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { userAPI } from '../../utils/api';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedManager, setSelectedManager] = useState('all');
  const [selectedMember, setSelectedMember] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchAnalyticsData();
    }
  }, [selectedManager, selectedMember]);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedManager !== 'all') params.managerId = selectedManager;
      if (selectedMember !== 'all') params.memberId = selectedMember;
      
      const response = await api.get('/dashboard/analytics', { params });
      setAnalyticsData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const managers = users.filter(u => u.role === 'Project Manager' || u.role === 'Admin');
  const members = users.filter(u => u.role === 'Team Member');

  const kpiData = analyticsData?.kpis || {};
  const chartsData = analyticsData?.charts || {};

  // Chart colors matching purple theme
  const COLORS = {
    'Planned': '#6B7280',
    'In Progress': '#9333EA',
    'Completed': '#10B981',
    'On Hold': '#F59E0B',
    'Blocked': '#EF4444',
    'New': '#6B7280',
    'Done': '#10B981'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
          <AlertCircle className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors shadow-md"
          >
            Retry
          </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Manager Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Manager
            </label>
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            >
              <option value="all">All Managers</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.firstName} {manager.lastName} ({manager.role})
                </option>
              ))}
            </select>
          </div>

          {/* Member Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Team Member
            </label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            >
              <option value="all">All Members</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Projects */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {kpiData.totalProjects || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {kpiData.activeProjects || 0} active, {kpiData.completedProjects || 0} completed
              </p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FolderKanban className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tasks Completed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {kpiData.tasksCompleted || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {kpiData.totalTasks || 0} total tasks
              </p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle2 className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        {/* Hours Logged */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Hours Logged</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {kpiData.totalHoursLogged || 0}h
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {kpiData.avgHoursPerDay || 0}h avg/day
              </p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        {/* Billable Percentage */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Billable</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {kpiData.billablePercentage || 0}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {kpiData.billableHours || 0}h billable
              </p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Project Progress</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Completion percentage by project</p>
          </div>
          <div style={{ height: '280px' }}>
            {chartsData.projectProgress && chartsData.projectProgress.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.projectProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="projectName" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#9333EA" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No data available</div>
            )}
          </div>
        </div>

        {/* Resource Utilization */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Resource Utilization</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Team member utilization percentage</p>
          </div>
          <div style={{ height: '280px' }}>
            {chartsData.resourceUtilization && chartsData.resourceUtilization.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartsData.resourceUtilization}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="userName" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="utilization" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Cost vs Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Project Cost vs Revenue</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Financial overview by project</p>
          </div>
          <div style={{ height: '280px' }}>
            {chartsData.costRevenue && chartsData.costRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartsData.costRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="projectName" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="cost" fill="#EF4444" name="Cost" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="revenue" fill="#10B981" name="Revenue" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No data available</div>
            )}
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Task Status Distribution</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Breakdown of task statuses</p>
          </div>
          <div style={{ height: '280px' }}>
            {chartsData.taskDistribution && chartsData.taskDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartsData.taskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartsData.taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6B7280'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Project Status Overview</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Distribution of project statuses</p>
          </div>
          <div className="space-y-4">
            {chartsData.projectStatus ? (
              <>
                {[
                  { status: 'Planned', count: chartsData.projectStatus.planned || 0, color: 'bg-gray-500' },
                  { status: 'In Progress', count: chartsData.projectStatus.inProgress || 0, color: 'bg-purple-500' },
                  { status: 'Completed', count: chartsData.projectStatus.completed || 0, color: 'bg-green-500' },
                  { status: 'On Hold', count: chartsData.projectStatus.onHold || 0, color: 'bg-amber-500' }
                ].map((item, index) => {
                  const total = (chartsData.projectStatus.planned || 0) + 
                               (chartsData.projectStatus.inProgress || 0) + 
                               (chartsData.projectStatus.completed || 0) + 
                               (chartsData.projectStatus.onHold || 0);
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.status}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.count}</span>
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                          {total > 0 ? Math.round((item.count / total) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No data available</div>
            )}
          </div>
        </div>

        {/* Monthly Hours Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Hours Trend</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Billable vs non-billable hours</p>
          </div>
          <div style={{ height: '280px' }}>
            {chartsData.monthlyHours && chartsData.monthlyHours.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartsData.monthlyHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `${value}h`} />
                  <Legend />
                  <Line type="monotone" dataKey="billable" stroke="#10B981" strokeWidth={3} name="Billable Hours" dot={{ fill: '#10B981', r: 4 }} />
                  <Line type="monotone" dataKey="nonBillable" stroke="#EF4444" strokeWidth={3} name="Non-billable Hours" dot={{ fill: '#EF4444', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
