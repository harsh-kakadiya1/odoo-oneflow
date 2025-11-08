import React from 'react';
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
  ResponsiveContainer,
  ProgressBar
} from 'recharts';
import { Card } from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const ChartCard = ({ title, children, className = "" }) => (
  <Card className={`p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div style={{ width: '100%', height: 300 }}>
      {children}
    </div>
  </Card>
);

const ProjectProgressChart = ({ data }) => {
  if (!data || !data.length) {
    return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="projectName" 
          angle={-45}
          textAnchor="end"
          height={100}
          fontSize={12}
        />
        <YAxis 
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          formatter={(value) => [`${value}%`, 'Progress']}
          labelStyle={{ color: '#374151' }}
        />
        <Legend />
        <Bar 
          dataKey="progress" 
          fill="#3B82F6" 
          name="Project Progress %"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

const ResourceUtilizationChart = ({ data }) => {
  if (!data || !data.length) {
    return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="userName" 
          angle={-45}
          textAnchor="end"
          height={100}
          fontSize={12}
        />
        <YAxis 
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          formatter={(value) => [`${value}%`, 'Utilization']}
          labelStyle={{ color: '#374151' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="utilization" 
          stroke="#10B981" 
          strokeWidth={3}
          dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
          name="Resource Utilization %"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const ProjectCostRevenueChart = ({ data }) => {
  if (!data || !data.length) {
    return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="projectName" 
          angle={-45}
          textAnchor="end"
          height={100}
          fontSize={12}
        />
        <YAxis 
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
          labelStyle={{ color: '#374151' }}
        />
        <Legend />
        <Bar 
          dataKey="cost" 
          fill="#EF4444" 
          name="Project Cost"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="revenue" 
          fill="#10B981" 
          name="Project Revenue"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

const TaskStatusDistribution = ({ data }) => {
  if (!data || !data.length) {
    return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
  }

  const COLORS = {
    'To Do': '#6B7280',
    'In Progress': '#3B82F6',
    'In Review': '#F59E0B',
    'Completed': '#10B981'
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#6B7280'} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

const ProjectStatusOverview = ({ data }) => {
  if (!data) {
    return <div className="flex items-center justify-center h-full text-gray-500">No data available</div>;
  }

  const statusData = [
    { status: 'Planned', count: data.planned || 0, color: 'bg-gray-500' },
    { status: 'In Progress', count: data.inProgress || 0, color: 'bg-blue-500' },
    { status: 'Completed', count: data.completed || 0, color: 'bg-green-500' },
    { status: 'On Hold', count: data.onHold || 0, color: 'bg-yellow-500' }
  ];

  const total = statusData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-4">
      {statusData.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
            <span className="text-sm font-medium text-gray-700">{item.status}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">{item.count}</span>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${item.color}`}
                style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">
              {total > 0 ? Math.round((item.count / total) * 100) : 0}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const AnalyticsCharts = ({ data }) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <ChartCard key={i} title="Loading...">
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" />
            </div>
          </ChartCard>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics Charts</h2>
      
      {/* Project Progress and Resource Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Project Progress %">
          <ProjectProgressChart data={data.projectProgress} />
        </ChartCard>
        
        <ChartCard title="Resource Utilization %">
          <ResourceUtilizationChart data={data.resourceUtilization} />
        </ChartCard>
      </div>

      {/* Cost vs Revenue and Task Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Project Cost vs Revenue">
          <ProjectCostRevenueChart data={data.costRevenue} />
        </ChartCard>
        
        <ChartCard title="Task Status Distribution">
          <TaskStatusDistribution data={data.taskDistribution} />
        </ChartCard>
      </div>

      {/* Project Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Project Status Overview" className="lg:col-span-1">
          <ProjectStatusOverview data={data.projectStatus} />
        </ChartCard>
        
        {/* Monthly Hours Trend */}
        <ChartCard title="Monthly Hours Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlyHours || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value}h`} />
              <Tooltip formatter={(value) => [`${value}h`, 'Hours']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="billable" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Billable Hours"
              />
              <Line 
                type="monotone" 
                dataKey="nonBillable" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Non-billable Hours"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default AnalyticsCharts;