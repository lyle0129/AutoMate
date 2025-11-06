import { useState, useEffect } from 'react';
import { Users, UserPlus, Edit, Trash2, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Form, { validators } from '../../components/forms/Form';
import apiClient from '../../services/apiClient';

/**
 * User Management page for admin users
 */
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/auth/users');
      setUsers(response.users || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle create user
  const handleCreateUser = async (formData) => {
    try {
      setSubmitting(true);
      await apiClient.post('/auth/register', formData);
      await fetchUsers();
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit user
  const handleEditUser = async (formData) => {
    try {
      setSubmitting(true);
      await apiClient.put(`/auth/users/${selectedUser.id}`, formData);
      await fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      setSubmitting(true);
      await apiClient.delete(`/auth/users/${selectedUser.id}`);
      await fetchUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  // Role options for select
  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'mechanic', label: 'Mechanic' },
    { value: 'customer', label: 'Customer' }
  ];

  // Form validation rules
  const createValidationRules = {
    user_name: [validators.required('Username is required')],
    password: [validators.required('Password is required'), validators.minLength(6)],
    role: [validators.required('Role is required')]
  };

  const editValidationRules = {
    user_name: [validators.required('Username is required')],
    role: [validators.required('Role is required')]
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'mechanic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'customer':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage system users and their roles
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by username or role..."
                value={searchTerm}
                onChange={(name, value) => setSearchTerm(value)}
                className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 w-full"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
            <span>
              Showing {filteredUsers.length} of {users.length} users
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            System Users
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Owner ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {user.user_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {user.user_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: #{user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                    {user.owner_id ? `#${user.owner_id}` : <span className="text-gray-400 dark:text-gray-500">Not assigned</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No matching users found.' : 'No users yet. Add one to get started.'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {user.user_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user.user_name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ID: #{user.id}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Role:</strong>{' '}
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                <strong>Owner ID:</strong>{' '}
                {user.owner_id ? `#${user.owner_id}` : 'Not assigned'}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                <strong>Created:</strong>{' '}
                {new Date(user.created_at).toLocaleDateString()}
              </p>

              <div className="flex justify-end space-x-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowEditModal(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowDeleteModal(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>



      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New User"
        size="md"
      >
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Admin panel - Create a new user account
          </p>
        </div>

        <Form
          onSubmit={handleCreateUser}
          validationRules={createValidationRules}
          loading={submitting}
          submitText="Create User"
          onCancel={() => setShowCreateModal(false)}
        >
          <Input
            name="user_name"
            label="Username"
            placeholder="Choose a username"
            required
          />

          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="Create a password"
            required
          />

          <Select
            name="role"
            label="Role"
            options={roleOptions}
            placeholder="Select role"
            required
          />

          <Input
            name="owner_id"
            type="number"
            label="Owner ID (Optional)"
            placeholder="Enter owner ID to associate with an owner"
          />
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        title={selectedUser ? `Edit User: ${selectedUser.user_name}` : "Edit User"}
        size="md"
      >
        {selectedUser && (
          <>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update user information and permissions
              </p>
            </div>

            <Form
                onSubmit={handleEditUser}
                initialValues={{
                  user_name: selectedUser.user_name,
                  role: selectedUser.role,
                  owner_id: selectedUser.owner_id || ''
                }}
                validationRules={editValidationRules}
                loading={submitting}
                submitText="Update User"
                onCancel={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="space-y-4"
              >
                <Input
                  name="user_name"
                  label="Username"
                  placeholder="Enter username"
                  required
                />

                <Select
                  name="role"
                  label="Role"
                  options={roleOptions}
                  placeholder="Select role"
                  required
                />

                <Input
                  name="owner_id"
                  type="number"
                  label="Owner ID (Optional)"
                  placeholder="Enter owner ID"
                />
            </Form>
          </>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        title="Delete User"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete User Account
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-900 dark:text-red-200 mb-3">
                User to be deleted:
              </h4>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {selectedUser.user_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-red-900 dark:text-red-200">
                    {selectedUser.user_name}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                    <span className="text-xs text-red-700 dark:text-red-300">
                      ID: #{selectedUser.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Warning: This action is permanent
                  </h4>
                  <ul className="mt-1 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                    <li>The user account will be permanently deleted</li>
                    <li>The user will lose access to the system immediately</li>
                    <li>Any associated data may be affected</li>
                    <li>This action cannot be reversed</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Confirmation */}
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you absolutely sure you want to delete the user account for <strong>"{selectedUser.user_name}"</strong>?
              </p>

              <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  disabled={submitting}
                  className="sm:order-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteUser}
                  loading={submitting}
                  className="sm:order-2"
                >
                  {submitting ? 'Deleting...' : 'Yes, Delete User'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;