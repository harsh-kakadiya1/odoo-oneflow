import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { Clock, DollarSign, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { timesheetAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import toast from 'react-hot-toast';

const MyTimesheets = () => {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('thisWeek');

  const periods = {
    today: {
      label: 'Today',
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    thisWeek: {
      label: 'This Week',
      start: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      end: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    },
    lastWeek: {
      label: 'Last Week',
      start: format(startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      end: format(endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    },
    thisMonth: {
      label: 'This Month',
      start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, [period]);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const selectedPeriod = periods[period];
      const response = await timesheetAPI.getUserAnalytics(user.id, {
        startDate: selectedPeriod.start,
        endDate: selectedPeriod.end
      });
      setAnalytics(response.data.analytics);
      setTimesheets(response.data.timesheets || []);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      toast.error('Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  };

  // Group timesheets by date
  const timesheetsByDate = timesheets.reduce((acc, timesheet) => {
    const date = timesheet.log_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(timesheet);
    return acc;
  }, {});

  const dates = Object.keys(timesheetsByDate).sort((a, b) => new Date(b) - new Date(a));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Timesheets</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your working hours and earnings</p>
        </div>
        
        {/* Period Selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          {Object.entries(periods).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Hours */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Hours</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {analytics.totalHours.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {analytics.entriesCount} entries
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billable Hours */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Billable Hours</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {analytics.billableHours.toFixed(1)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {analytics.billablePercentage.toFixed(0)}% billable
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Earnings */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    ₹{analytics.totalEarnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    @ ₹{user.hourly_rate}/hr
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Hours/Day */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg Hours/Day</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {analytics.avgHoursPerDay.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {analytics.workingDays} working days
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Breakdown */}
      <Card>
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily Breakdown</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your logged hours for {periods[period].label.toLowerCase()}</p>
        </div>
        <CardContent className="p-6">
          {dates.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No time logged for this period</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start logging hours on your tasks to see them here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {dates.map((date) => {
                const dayTimesheets = timesheetsByDate[date];
                const dayTotal = dayTimesheets.reduce((sum, t) => sum + parseFloat(t.hours_logged), 0);
                const dayCost = dayTimesheets.reduce((sum, t) => sum + parseFloat(t.cost), 0);
                
                return (
                  <div key={date} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                    {/* Date Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {format(new Date(date), 'EEEE, MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Total: <span className="font-bold text-gray-900 dark:text-white">{dayTotal.toFixed(1)} hrs</span>
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Cost: <span className="font-bold text-gray-900 dark:text-white">₹{dayCost.toLocaleString('en-IN')}</span>
                        </span>
                      </div>
                    </div>

                    {/* Time Entries for this day */}
                    <div className="space-y-3">
                      {dayTimesheets.map((timesheet) => (
                        <div 
                          key={timesheet.id}
                          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {/* Task Name */}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {timesheet.task?.title || 'Unknown Task'}
                                </span>
                                {timesheet.task?.project && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    • {timesheet.task.project.name}
                                  </span>
                                )}
                              </div>

                              {/* Description */}
                              {timesheet.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">
                                  "{timesheet.description}"
                                </p>
                              )}

                              {/* Hours and Billable */}
                              <div className="flex items-center gap-3 text-sm">
                                <span className="flex items-center text-gray-700 dark:text-gray-300">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span className="font-semibold">{timesheet.hours_logged} hrs</span>
                                </span>
                                <Badge variant={timesheet.is_billable ? 'success' : 'secondary'} size="sm">
                                  {timesheet.is_billable ? '✅ Billable' : '⚪ Internal'}
                                </Badge>
                                <span className="flex items-center text-gray-700 dark:text-gray-300">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  <span className="font-semibold">₹{parseFloat(timesheet.cost).toLocaleString('en-IN')}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hours by Project */}
      {analytics && analytics.byProject && analytics.byProject.length > 0 && (
        <Card>
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hours by Project</h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-3">
              {analytics.byProject.map((proj, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">{proj.projectName}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {proj.hours.toFixed(1)} hrs
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{proj.earnings.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyTimesheets;

