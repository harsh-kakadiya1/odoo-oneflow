import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Edit, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Badge from '../../components/UI/Badge';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Modal from '../../components/UI/Modal';
import UserForm from './UserForm';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    // Check if Project Manager has permission
    if (user?.role === 'Project Manager') {
      console.log('PM Permission Check:', {
        role: user.role,
        can_manage_users: user.can_manage_users,
        hasPermission: user.can_manage_users === true
      });
      
      // Explicitly check if can_manage_users is true
      if (user.can_manage_users !== true) {
        setHasPermission(false);
        setLoading(false);
        return;
      }
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll({ search });
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...users];

    // Apply role filter
    if (roleFilter) {
      result = result.filter(u => u.role === roleFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'name-asc':
        result.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
        break;
      case 'name-desc':
        result.sort((a, b) => `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`));
        break;
      case 'manager-first':
        result.sort((a, b) => {
          if (a.role === 'Project Manager' && b.role !== 'Project Manager') return -1;
          if (a.role !== 'Project Manager' && b.role === 'Project Manager') return 1;
          return 0;
        });
        break;
      case 'member-first':
        result.sort((a, b) => {
          if (a.role === 'Team Member' && b.role !== 'Team Member') return -1;
          if (a.role !== 'Team Member' && b.role === 'Team Member') return 1;
          return 0;
        });
        break;
      case 'hourly-rate-high':
        result.sort((a, b) => parseFloat(b.hourly_rate || 0) - parseFloat(a.hourly_rate || 0));
        break;
      case 'hourly-rate-low':
        result.sort((a, b) => parseFloat(a.hourly_rate || 0) - parseFloat(b.hourly_rate || 0));
        break;
      default:
        break;
    }

    setFilteredUsers(result);
  }, [users, roleFilter, sortBy]);

  const handleEdit = (userToEdit) => {
    setEditingUser(userToEdit);
    setShowEditModal(true);
  };

  const handleDelete = async (userId) => {
    const confirmMessage = 'Are you sure you want to PERMANENTLY DELETE this user? This action cannot be undone, and the user will receive an email notification.';
    if (!window.confirm(confirmMessage)) return;

    try {
      await userAPI.delete(userId);
      toast.success('User deleted successfully. Notification email sent.');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      'Admin': 'error',
      'Project Manager': 'primary',
      'Team Member': 'success',
      'Sales/Finance': 'warning'
    };
    return colors[role] || 'secondary';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show access denied message for PMs without permission
  if (!hasPermission && user?.role === 'Project Manager') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your team members</p>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You do not have permission to manage users. 
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Please contact your administrator to request user management permissions.
            </p>
            <div className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 p-3 rounded mt-4">
              <p><strong>Debug Info:</strong></p>
              <p>User Role: {user?.role}</p>
              <p>can_manage_users value: {JSON.stringify(user?.can_manage_users)}</p>
              <p>Permission Check Result: {user?.can_manage_users === true ? '✅ TRUE - Should have access' : user?.can_manage_users === false ? '❌ FALSE - No permission' : '⚠️ UNDEFINED - Need to logout/login'}</p>
              <p className="mt-2 font-semibold">Action Required:</p>
              <p>1. Admin must run SQL: UPDATE users SET can_manage_users = TRUE WHERE email = 'your-pm-email@example.com';</p>
              <p>2. Then LOGOUT completely</p>
              <p>3. Then LOGIN again</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search, Filters and Action Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Search Bar */}
        <div className="flex-1 w-full">
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full lg:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Project Manager">Project Manager</option>
          <option value="Team Member">Team Member</option>
          <option value="Sales/Finance">Sales/Finance</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full lg:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="manager-first">Managers First</option>
          <option value="member-first">Members First</option>
          <option value="hourly-rate-high">Hourly Rate (High-Low)</option>
          <option value="hourly-rate-low">Hourly Rate (Low-High)</option>
        </select>

        {/* Add User Button */}
        <Button onClick={() => setShowCreateModal(true)} className="w-full lg:w-auto whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          {user?.role === 'Project Manager' ? 'Add Team Member' : 'Add User'}
        </Button>
      </div>

      {/* Info Row */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredUsers.length} of {users.length} users
              {roleFilter && ` • Filtered by: ${roleFilter}`}
              {sortBy && ` • Sorted by: ${sortBy.replace(/-/g, ' ')}`}
            </div>
            <Button variant="secondary" size="sm" onClick={fetchUsers}>
              <Search className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {user?.role === 'Project Manager' ? 'Your Team Members' : 'All Users'} ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hourly Rate
                  </th>
                  {user?.role === 'Admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Permissions
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No users found. Try adjusting your filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50 dark:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {userItem.firstName?.charAt(0).toUpperCase() || userItem.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {userItem.firstName} {userItem.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{userItem.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getRoleBadgeColor(userItem.role)}>
                        {userItem.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ₹{parseFloat(userItem.hourly_rate || 0).toFixed(2)}/hr
                    </td>
                    {user?.role === 'Admin' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {userItem.role === 'Project Manager' && userItem.can_manage_users && (
                          <Badge variant="success">Can Manage Users</Badge>
                        )}
                        {userItem.role === 'Project Manager' && !userItem.can_manage_users && (
                          <Badge variant="secondary">No Permissions</Badge>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={userItem.is_active ? 'success' : 'error'}>
                        {userItem.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(userItem)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(userItem.id)}
                        className="text-error-600 hover:text-error-900 ml-4"
                        title="Delete user permanently"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title={user?.role === 'Project Manager' ? 'Add New Team Member' : 'Add New User'}
          size="md"
        >
          <UserForm
            onSuccess={() => {
              setShowCreateModal(false);
              fetchUsers();
            }}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          title="Edit User"
          size="md"
        >
          <UserForm
            editMode={true}
            existingUser={editingUser}
            onSuccess={() => {
              setShowEditModal(false);
              setEditingUser(null);
              fetchUsers();
            }}
            onCancel={() => {
              setShowEditModal(false);
              setEditingUser(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default Users;

