import React from 'react';
import { Card, CardContent } from '../../../components/UI/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const ProgressBar = ({ project, className = '' }) => {
  // Calculate progress based on completed tasks
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(task => task.status === 'Done').length || 0;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate budget usage
  const budgetUsed = project.financials?.totalCost || 0;
  const totalBudget = project.budget || 0;
  const budgetPercentage = totalBudget > 0 ? Math.round((budgetUsed / totalBudget) * 100) : 0;
  const isOverBudget = budgetPercentage > 100;

  return (
    <Card className={className}>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Project Progress</h3>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {completedTasks}/{totalTasks} Tasks
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {progressPercentage}% Complete
              </span>
              <div className="flex items-center space-x-1">
                {progressPercentage > 0 && (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                )}
                <span className="text-xs text-gray-400">
                  {totalTasks - completedTasks} remaining
                </span>
              </div>
            </div>
          </div>

          {/* Budget Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Budget Usage</h3>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                ${budgetUsed.toLocaleString()} / ${totalBudget.toLocaleString()}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full transition-all duration-300 ease-in-out ${
                  isOverBudget ? 'bg-red-500' : budgetPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              ></div>
              {isOverBudget && (
                <div
                  className="bg-red-300 h-3 rounded-full -mt-3 opacity-50"
                  style={{ width: '100%' }}
                ></div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isOverBudget ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`}>
                {budgetPercentage}% Used
                {isOverBudget && ' (Over Budget)'}
              </span>
              <div className="flex items-center space-x-1">
                {isOverBudget ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : budgetPercentage > 80 ? (
                  <TrendingUp className="h-4 w-4 text-yellow-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                )}
                <span className="text-xs text-gray-400">
                  ${(totalBudget - budgetUsed).toLocaleString()} remaining
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Warning for over budget */}
        {isOverBudget && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ This project is over budget by ${(budgetUsed - totalBudget).toLocaleString()}
            </p>
          </div>
        )}

        {/* Warning for approaching deadline */}
        {project.end_date && new Date(project.end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700 font-medium">
              📅 Project deadline is approaching in less than a week
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressBar;