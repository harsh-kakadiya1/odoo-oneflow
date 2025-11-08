import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  User, 
  Clock, 
  MessageSquare, 
  Paperclip,
  Send,
  Download,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '../../../components/UI/Card';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import Badge from '../../../components/UI/Badge';
import LoadingSpinner from '../../../components/UI/LoadingSpinner';
import LogHoursModal from '../../../components/UI/LogHoursModal';
import { taskAPI } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TaskDetail = ({ task, onUpdate }) => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [showLogHoursModal, setShowLogHoursModal] = useState(false);

  // Permission checks
  const canEditDetails = hasRole(['Admin', 'Project Manager']);
  const canLogTime = true; // All users can log time on tasks they're assigned to
  const canComment = true; // Everyone can comment
  const canUploadFiles = hasRole(['Admin', 'Project Manager']) || task.assignee?.id === user?.id;

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getComments(task.id);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [task.id]);

  const fetchTimesheets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getTimesheets(task.id);
      setTimesheets(response.data.timesheets || []);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      toast.error('Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  }, [task.id]);

  const fetchAttachments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getAttachments(task.id);
      setAttachments(response.data.attachments);
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setLoading(false);
    }
  }, [task.id]);

  useEffect(() => {
    if (activeTab === 'comments') {
      fetchComments();
    } else if (activeTab === 'timesheets') {
      fetchTimesheets();
    } else if (activeTab === 'attachments') {
      fetchAttachments();
    }
  }, [activeTab, fetchComments, fetchTimesheets, fetchAttachments]);

  const handleTimesheetSuccess = () => {
    fetchTimesheets();
    if (onUpdate) onUpdate();
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await taskAPI.addComment(task.id, { comment });
      toast.success('Comment added');
      setComment('');
      fetchComments();
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setFileUploading(true);
      await taskAPI.uploadAttachment(task.id, formData);
      toast.success('File uploaded successfully');
      fetchAttachments();
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setFileUploading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'New': 'secondary',
      'In Progress': 'primary',
      'Blocked': 'warning',
      'Done': 'success'
    };
    return colors[status] || 'secondary';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'success',
      'Medium': 'warning',
      'High': 'danger'
    };
    return colors[priority] || 'secondary';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString();
  };

  const tabs = [
    { id: 'details', label: 'Details', icon: Calendar },
    { id: 'timesheets', label: 'Time Logs', icon: Clock },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'attachments', label: 'Attachments', icon: Paperclip }
  ];

  const totalHours = timesheets.reduce((sum, entry) => sum + parseFloat(entry.hours_logged || 0), 0);
  const billableHours = timesheets.filter(entry => entry.is_billable).reduce((sum, entry) => sum + parseFloat(entry.hours_logged || 0), 0);
  const totalCost = timesheets.reduce((sum, entry) => sum + parseFloat(entry.cost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Task Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <Badge variant={getStatusColor(task.status)}>
              {task.status}
            </Badge>
            <Badge variant={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>
          
          {task.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">{task.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span>Assignee: {task.assignee?.name || 'Unassigned'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Due: {task.due_date ? formatDate(task.due_date) : 'Not set'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Summary */}
      <Card>
        <CardContent>
          <h4 className="font-semibold mb-3">Time Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalHours}h</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Hours</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{billableHours}h</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Billable Hours</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{totalHours - billableHours}h</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Non-billable Hours</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.id === 'comments' && comments.length > 0 && (
                  <Badge variant="outline" size="sm">{comments.length}</Badge>
                )}
                {tab.id === 'timesheets' && timesheets.length > 0 && (
                  <Badge variant="outline" size="sm">{timesheets.length}</Badge>
                )}
                {tab.id === 'attachments' && attachments.length > 0 && (
                  <Badge variant="outline" size="sm">{attachments.length}</Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'details' && (
          <Card>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Task Information</h4>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{formatDateTime(task.created_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{formatDateTime(task.updated_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Project</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{task.project?.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">{task.creator?.name || 'Unknown'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'timesheets' && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
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
                  <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Cost</p>
                </CardContent>
              </Card>
            </div>

            {/* Log Hours Button */}
            <Button onClick={() => setShowLogHoursModal(true)}>
              <Clock className="h-4 w-4 mr-2" />
              Log Hours
            </Button>

            {/* Time Entries */}
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-3">
                {timesheets.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No time logged yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click "Log Hours" to record your work time</p>
                    </CardContent>
                  </Card>
                ) : (
                  timesheets.map((timesheet) => (
                    <Card key={timesheet.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg font-bold text-gray-900 dark:text-white">{timesheet.hours_logged} hrs</span>
                              <Badge variant={timesheet.is_billable ? 'success' : 'secondary'} size="sm">
                                {timesheet.is_billable ? '✅ Billable' : '⚪ Internal'}
                              </Badge>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {format(new Date(timesheet.log_date), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            
                            {timesheet.description && (
                              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 italic">"{timesheet.description}"</p>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                <User className="h-4 w-4 inline mr-1" />
                                {timesheet.user ? `${timesheet.user.firstName} ${timesheet.user.lastName}` : 'Unknown'}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                <DollarSign className="h-4 w-4 inline mr-1" />
                                ₹{parseFloat(timesheet.cost).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
            {/* Add Comment Form */}
            <Card>
              <CardContent>
                <form onSubmit={handleAddComment} className="space-y-4">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a comment..."
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={!comment.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Add Comment
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Comments List */}
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="py-4">
                        <div className="flex space-x-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {comment.user?.name?.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold">{comment.user?.name}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDateTime(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{comment.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'attachments' && (
          <div className="space-y-4">
            {/* Upload Form */}
            {canUploadFiles ? (
              <Card>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="w-full"
                        disabled={fileUploading}
                      />
                    </div>
                    {fileUploading && <LoadingSpinner size="sm" />}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent>
                  <div className="text-center py-4">
                    <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">File uploads are restricted to task assignees and project managers</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attachments List */}
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attachments.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4 col-span-full">No attachments</p>
                ) : (
                  attachments.map((attachment) => (
                    <Card key={attachment.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Paperclip className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{attachment.filename}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {(attachment.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(attachment.url)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Log Hours Modal */}
      <LogHoursModal
        isOpen={showLogHoursModal}
        onClose={() => setShowLogHoursModal(false)}
        task={task}
        onSuccess={handleTimesheetSuccess}
      />
    </div>
  );
};

export default TaskDetail;