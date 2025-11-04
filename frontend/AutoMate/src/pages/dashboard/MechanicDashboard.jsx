import { useAuth } from '../../hooks/useAuth';
import { Car, Wrench, Clock, CheckCircle } from 'lucide-react';

/**
 * Mechanic Dashboard component with work queue and activities
 */
const MechanicDashboard = () => {
  const { user } = useAuth();

  const workStats = [
    {
      name: 'Pending Jobs',
      value: '8',
      icon: Clock,
      color: 'yellow',
      description: 'Awaiting your attention'
    },
    {
      name: 'In Progress',
      value: '3',
      icon: Wrench,
      color: 'blue',
      description: 'Currently working on'
    },
    {
      name: 'Completed Today',
      value: '5',
      icon: CheckCircle,
      color: 'green',
      description: 'Jobs finished today'
    },
    {
      name: 'Vehicles Serviced',
      value: '12',
      icon: Car,
      color: 'purple',
      description: 'This week'
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
          Mechanic Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.user_name}! Here's your work overview.
        </p>
      </div>

      {/* Work statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {workStats.map((stat) => {
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

      {/* Work queue */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Today's Work Queue
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 bg-red-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Oil Change - Honda Civic</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Plate: ABC-123 | Owner: John Doe</p>
              </div>
            </div>
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">High Priority</span>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Brake Inspection - Toyota Camry</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Plate: XYZ-789 | Owner: Jane Smith</p>
              </div>
            </div>
            <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Medium Priority</span>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Tire Rotation - Ford F-150</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Plate: DEF-456 | Owner: Mike Johnson</p>
              </div>
            </div>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Low Priority</span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
            <h3 className="font-medium text-gray-900 dark:text-white">New Maintenance Log</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Create a new service record</p>
          </button>
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
            <h3 className="font-medium text-gray-900 dark:text-white">Search Vehicle</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Find vehicle by plate or owner</p>
          </button>
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
            <h3 className="font-medium text-gray-900 dark:text-white">Generate Invoice</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Create invoice for completed work</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;