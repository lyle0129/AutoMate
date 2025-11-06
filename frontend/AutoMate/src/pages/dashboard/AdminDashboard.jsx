import { useAuth } from '../../hooks/useAuth';
import { Users, Car, Wrench, BarChart3, Settings, UserPlus, Plus, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

/**
 * Admin Dashboard component with system overview and statistics
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch data from multiple endpoints
        const [vehiclesRes, ownersRes, servicesRes, usersRes] = await Promise.all([
          apiClient.get('/vehicles'),
          apiClient.get('/owners'),
          apiClient.get('/services'),
          apiClient.get('/auth/users')
        ]);

        // Calculate statistics based on actual API response structures
        // Services, vehicles, and owners return arrays directly
        // Users return an object with users array
        const vehicleCount = Array.isArray(vehiclesRes) ? vehiclesRes.length : (vehiclesRes.vehicles?.length || 0);
        const ownerCount = Array.isArray(ownersRes) ? ownersRes.length : (ownersRes.owners?.length || 0);
        const serviceCount = Array.isArray(servicesRes) ? servicesRes.length : (servicesRes.services?.length || 0);
        const userCount = usersRes.users?.length || 0;

        setStats([
          {
            name: 'Total Vehicles',
            value: vehicleCount.toString(),
            icon: Car,
            color: 'blue',
            description: 'Registered vehicles',
            path: '/admin/vehicles'
          },
          {
            name: 'Vehicle Owners',
            value: ownerCount.toString(),
            icon: Users,
            color: 'green',
            description: 'Registered owners',
            path: '/admin/owners'
          },
          {
            name: 'Available Services',
            value: serviceCount.toString(),
            icon: Wrench,
            color: 'yellow',
            description: 'Service offerings',
            path: '/admin/services'
          },
          {
            name: 'System Users',
            value: userCount.toString(),
            icon: BarChart3,
            color: 'purple',
            description: 'Active users',
            path: '/admin/users'
          }
        ]);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard statistics');
        // Set default stats on error
        setStats([
          {
            name: 'Total Vehicles',
            value: '0',
            icon: Car,
            color: 'blue',
            description: 'Registered vehicles',
            path: '/admin/vehicles'
          },
          {
            name: 'Vehicle Owners',
            value: '0',
            icon: Users,
            color: 'green',
            description: 'Registered owners',
            path: '/admin/owners'
          },
          {
            name: 'Available Services',
            value: '0',
            icon: Wrench,
            color: 'yellow',
            description: 'Service offerings',
            path: '/admin/services'
          },
          {
            name: 'System Users',
            value: '0',
            icon: BarChart3,
            color: 'purple',
            description: 'Active users',
            path: '/admin/users'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getStatCardClasses = (color) => {
    const colorClasses = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
    };
    return colorClasses[color] || colorClasses.blue;
  };

  const handleStatClick = (path) => {
    navigate(path);
  };

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Create and manage system users',
      icon: UserPlus,
      action: () => navigate('/admin/users'),
      color: 'blue'
    },
    {
      title: 'Generate Invoices',
      description: 'Create invoices for completed work',
      icon: FileText,
      action: () => navigate('/admin/invoices/new'),
      color: 'green'
    },
    {
      title: 'Manage Services',
      description: 'Configure repair services and pricing',
      icon: Settings,
      action: () => navigate('/admin/services'),
      color: 'yellow'
    },
    {
      title: 'Account Settings',
      description: 'Update your username and password',
      icon: Users,
      action: () => navigate('/admin/settings'),
      color: 'purple'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.user_name}! Here's your system overview.
        </p>
        {error && (
          <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">{error}</p>
          </div>
        )}
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              onClick={() => handleStatClick(stat.path)}
              className={`border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all duration-200 ${getStatCardClasses(stat.color)}`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium opacity-75">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold">
                    {stat.value}
                  </p>
                  <p className="text-xs opacity-60">
                    {stat.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={action.action}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  <Icon className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Status */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
        {/* Recent Activity */}
        {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  New maintenance log created
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  New vehicle registered
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">4 hours ago</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Service updated
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">6 hours ago</span>
              </div>
            </div>
          </div>
        </div> */}

        {/* System Health */}
        {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Health
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 dark:text-green-400">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">API Server</span>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 dark:text-green-400">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Backup</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">2 hours ago</span>
            </div>
          </div>
        </div> */}
      {/* </div> */}
    </div>
  );
};

export default AdminDashboard;