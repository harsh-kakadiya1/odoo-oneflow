import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/UI/Card';
import Badge from '../../../components/UI/Badge';
import LoadingSpinner from '../../../components/UI/LoadingSpinner';
import { Clock, IndianRupee, Users, BarChart3, CheckCircle, Calendar } from 'lucide-react';
import { timesheetAPI } from '../../../utils/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ProjectTimesheets = ({ projectId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState('user'); // 'user', 'task', or 'date'

  useEffect(() => {
    fetchTimesheets();
  }, [projectId]);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const response = await timesheetAPI.getProjectAnalytics(projectId);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching project timesheets:', error);
      toast.error('Failed to load project timesheets');
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

  if (!data || !data.analytics) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No timesheets logged for this project yet</p>
      </div>
    );
  }

  const { analytics } = data;

  // Safely get values with defaults
  const totalHours = analytics?.totalHours ?? 0;
  const billableHours = analytics?.billableHours ?? 0;
  const billableUtilization = analytics?.billableUtilization ?? 0;
  const totalCost = analytics?.totalCost ?? 0;
  const avgHoursPerDay = analytics?.avgHoursPerDay ?? 0;
  const byUser = analytics?.byUser ?? [];
  const byTask = analytics?.byTask ?? [];
  const byDate = analytics?.byDate ?? {};

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalHours.toFixed(1)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{billableHours.toFixed(1)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Billable Hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{billableUtilization.toFixed(0)}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <IndianRupee className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Cost</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgHoursPerDay.toFixed(1)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Hrs/Day</p>
          </CardContent>
        </Card>
      </div>

      {/* Group By Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Group by:</span>
        <div className="flex gap-2">
          {['user', 'task', 'date'].map((group) => (
            <button
              key={group}
              onClick={() => setGroupBy(group)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                groupBy === group
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {group.charAt(0).toUpperCase() + group.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Data Display */}
      <Card>
        <CardContent className="p-6">
          {groupBy === 'user' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Hours by Team Member</h4>
              {byUser.length > 0 ? (
                byUser.map((userStat, index) => {
                  const totalHours = userStat?.totalHours ?? 0;
                  const billableHours = userStat?.billableHours ?? 0;
                  const nonBillableHours = userStat?.nonBillableHours ?? 0;
                  const cost = userStat?.cost ?? 0;
                  const entries = userStat?.entries ?? 0;
                  
                  return (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary-600 dark:text-primary-400 font-medium">
                              {userStat?.userName?.split(' ').map(n => n[0]).join('') || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{userStat?.userName || 'Unknown User'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{userStat?.email || ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalHours.toFixed(1)} hrs</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{entries} entries</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Billable</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">{billableHours.toFixed(1)} hrs</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Non-Billable</p>
                          <p className="font-semibold text-gray-600 dark:text-gray-400">{nonBillableHours.toFixed(1)} hrs</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Labor Cost</p>
                          <p className="font-semibold text-purple-600 dark:text-purple-400">₹{cost.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No user data available</p>
              )}
            </div>
          )}

          {groupBy === 'task' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Hours by Task</h4>
              {byTask.length > 0 ? (
                byTask.map((taskStat, index) => {
                  const totalHours = taskStat?.totalHours ?? 0;
                  const cost = taskStat?.cost ?? 0;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{taskStat?.taskTitle || 'Unknown Task'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{taskStat?.userCount ?? 0} team members</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{totalHours.toFixed(1)} hrs</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">₹{cost.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No task data available</p>
              )}
            </div>
          )}

          {groupBy === 'date' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Hours by Date</h4>
              {Object.keys(byDate).length > 0 ? (
                Object.entries(byDate).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([date, stats]) => {
                  const hours = stats?.hours ?? 0;
                  const billableHours = stats?.billableHours ?? 0;
                  const cost = stats?.cost ?? 0;
                  
                  return (
                    <div key={date} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {format(new Date(date), 'EEEE, MMM dd, yyyy')}
                      </span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Total: <span className="font-bold text-gray-900 dark:text-white">{hours.toFixed(1)} hrs</span>
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          Billable: <span className="font-bold text-green-600 dark:text-green-400">{billableHours.toFixed(1)} hrs</span>
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          Cost: <span className="font-bold text-purple-600 dark:text-purple-400">₹{cost.toLocaleString('en-IN')}</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No date data available</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTimesheets;

