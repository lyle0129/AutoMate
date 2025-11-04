import { useAuth } from '../../hooks/useAuth';
import { Car, Calendar, Receipt, AlertTriangle } from 'lucide-react';

/**
 * Customer Dashboard component showing owned vehicles and maintenance overview
 */
const CustomerDashboard = () => {
  const { user } = useAuth();

  const vehicleStats = [
    {
      name: 'My Vehicles',
      value: '2',
      icon: Car,
      color: 'blue',
      description: 'Registered vehicles'
    },
    {
      name: 'Recent Services',
      value: '3',
      icon: Calendar,
      color: 'green',
      description: 'Last 30 days'
    },
    {
      name: 'Pending Invoices',
      value: '1',
      icon: Receipt,
      color: 'yellow',
      description: 'Awaiting payment'
    },
    {
      name: 'Service Alerts',
      value: '1',
      icon: AlertTriangle,
      color: 'red',
      description: 'Maintenance due'
    }
  ];

  const getStatCardClasses = (color) => {
    const colorClasses = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
    };
    return colorClasses[color] || colorClasses.blue;
  };

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.user_name}! Here's your vehicle overview.
        </p>
      </div>

      {/* Vehicle statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {vehicleStats.map((stat) => {
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

      {/* My vehicles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          My Vehicles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white">2020 Honda Civic</h3>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                Good Condition
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Plate: ABC-123</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Last service: 2 weeks ago</p>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white">2018 Toyota Camry</h3>
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">
                Service Due
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Plate: XYZ-789</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Last service: 3 months ago</p>
          </div>
        </div>
      </div>

      {/* Recent maintenance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Maintenance
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Oil Change</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Honda Civic (ABC-123)</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">November 1, 2024</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900 dark:text-white">$45.00</p>
              <span className="text-xs text-green-600 dark:text-green-400">Paid</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Brake Inspection</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toyota Camry (XYZ-789)</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">October 15, 2024</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900 dark:text-white">$85.00</p>
              <span className="text-xs text-green-600 dark:text-green-400">Paid</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Tire Rotation</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Honda Civic (ABC-123)</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">September 28, 2024</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900 dark:text-white">$35.00</p>
              <span className="text-xs text-green-600 dark:text-green-400">Paid</span>
            </div>
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
            <h3 className="font-medium text-gray-900 dark:text-white">View All Vehicles</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">See detailed vehicle information</p>
          </button>
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
            <h3 className="font-medium text-gray-900 dark:text-white">Maintenance History</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">View complete service records</p>
          </button>
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors">
            <h3 className="font-medium text-gray-900 dark:text-white">View Invoices</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Download and print invoices</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;