import { useAuth } from '../../hooks/useAuth';
import { Users, Car, Wrench, BarChart3 } from 'lucide-react';

/**
 * Admin Dashboard component with system overview and statistics
 */
const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Total Users',
      value: '24',
      icon: Users,
      color: 'blue',
      description: 'Active system users'
    },
    {
      name: 'Total Vehicles',
      value: '156',
      icon: Car,
      color: 'green',
      description: 'Vehicles in system'
    },
    {
      name: 'Maintenance Logs',
      value: '89',
      icon: Wrench,
      color: 'yellow',
      description: 'This month'
    },
    {
      name: 'Revenue',
      value: '$12,450',
      icon: BarChart3,
      color: 'purple',
      description: 'This month'
    }
  ];

  const getStatCardClasses = (color) => {
    const colorClasses = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
    };
    return colorClasses[color] || colorClasses.blue;
  };

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
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className={`border rounded-lg p-6 ${getStatCardClasses(stat.color)}`}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
            <h3 className="font-medium text-gray-900 dark:text-white">Create New User</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Add a new user to the system</p>
          </button>
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
            <h3 className="font-medium text-gray-900 dark:text-white">Add Vehicle</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Register a new vehicle</p>
          </button>
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
            <h3 className="font-medium text-gray-900 dark:text-white">View Reports</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Generate system reports</p>
          </button>
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              New maintenance log created for Vehicle #VH-001
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              New user registered: John Mechanic
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400">4 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Invoice #INV-2024-001 generated
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;