import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useMaintenance } from '../../hooks/useMaintenance';
import { useVehicles } from '../../hooks/useVehicles';
import { Car, Wrench, Clock, CheckCircle, Search, Plus, FileText, Calendar, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../utils/dateUtils';

/**
 * Mechanic Dashboard component with work queue and activities
 */
const MechanicDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { maintenanceLogs, loading: maintenanceLoading, fetchMaintenanceLogs } = useMaintenance();
  const { vehicles, loading: vehiclesLoading, fetchVehicles } = useVehicles();

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [workStats, setWorkStats] = useState([
    {
      name: 'Pending Jobs',
      value: '0',
      icon: Clock,
      color: 'yellow',
      description: 'Awaiting your attention'
    },
    {
      name: 'In Progress',
      value: '0',
      icon: Wrench,
      color: 'blue',
      description: 'Currently working on'
    },
    {
      name: 'Completed Today',
      value: '0',
      icon: CheckCircle,
      color: 'green',
      description: 'Jobs finished today'
    },
    {
      name: 'Vehicles Serviced',
      value: '0',
      icon: Car,
      color: 'purple',
      description: 'This week'
    }
  ]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchMaintenanceLogs(),
          fetchVehicles()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadData();
  }, [fetchMaintenanceLogs, fetchVehicles]);

  // Calculate work statistics
  useEffect(() => {
    if (maintenanceLogs.length > 0) {
      const today = new Date().toDateString();
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // For demo purposes, we'll simulate different job statuses
      // In a real app, you'd have status fields in your maintenance logs
      const todayLogs = maintenanceLogs.filter(log =>
        new Date(log.date).toDateString() === today
      );

      const weekLogs = maintenanceLogs.filter(log =>
        new Date(log.date) >= oneWeekAgo
      );

      // Get unique vehicles serviced this week
      const uniqueVehicles = new Set(weekLogs.map(log => log.vehicle_id));

      setWorkStats([
        {
          name: 'Pending Jobs',
          value: Math.max(0, 8 - todayLogs.length).toString(),
          icon: Clock,
          color: 'yellow',
          description: 'Awaiting your attention'
        },
        {
          name: 'In Progress',
          value: Math.min(3, Math.floor(todayLogs.length / 2)).toString(),
          icon: Wrench,
          color: 'blue',
          description: 'Currently working on'
        },
        {
          name: 'Completed Today',
          value: todayLogs.length.toString(),
          icon: CheckCircle,
          color: 'green',
          description: 'Jobs finished today'
        },
        {
          name: 'Vehicles Serviced',
          value: uniqueVehicles.size.toString(),
          icon: Car,
          color: 'purple',
          description: 'This week'
        }
      ]);
    }
  }, [maintenanceLogs]);

  // Filter vehicles based on search term
  useEffect(() => {
    if (vehicles.length > 0) {
      const filtered = vehicles.filter(vehicle =>
        vehicle.plate_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle.owner_name && vehicle.owner_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredVehicles(filtered.slice(0, 5)); // Show top 5 results
    }
  }, [vehicles, searchTerm]);

  // Get recent maintenance logs for work queue
  const getRecentWorkQueue = () => {
    if (maintenanceLogs.length === 0) return [];

    // Sort by date and get recent ones
    const sortedLogs = [...maintenanceLogs]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    return sortedLogs.map((log, index) => {
      // Safely handle description that might be an object
      let title = 'Maintenance Service';
      if (typeof log.description === 'string') {
        title = log.description;
      } else if (typeof log.description === 'object' && log.description?.custom_description) {
        title = log.description.custom_description;
      }

      return {
        id: log.log_id,
        title: title,
        vehicle: log.vehicle ? `${log.vehicle.make} ${log.vehicle.model}` : 'Unknown Vehicle',
        plate: log.vehicle?.plate_no || 'N/A',
        owner: log.vehicle?.owner?.name || 'Unknown Owner',
        priority: index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low',
        color: index === 0 ? 'red' : index === 1 ? 'yellow' : 'green',
        date: log.date
      };
    });
  };

  const getStatCardClasses = (color) => {
    const colorClasses = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
    };
    return colorClasses[color] || colorClasses.blue;
  };

  const workQueue = getRecentWorkQueue();
  const loading = maintenanceLoading || vehiclesLoading;

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
          Mechanic Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.user_name}! Here's your work overview.
        </p>
      </div>

      {/* Vehicle Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Vehicle Search
        </h2>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by plate number, make, model, or owner name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {searchTerm && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle.vehicle_id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <Car className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {vehicle.make} {vehicle.model} ({vehicle.year})
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Plate: {vehicle.plate_no} | Owner: {vehicle.owner_name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Select
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No vehicles found matching your search.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="p-4 h-auto text-left justify-start"
            onClick={() => navigate('/mechanic/maintenance/new')}
          >
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Plus className="h-4 w-4" />
                <h3 className="font-medium">New Maintenance Log</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create a new service record
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="p-4 h-auto text-left justify-start"
          >
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Search className="h-4 w-4" />
                <h3 className="font-medium">Search Vehicle</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Find vehicle by plate or owner
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="p-4 h-auto text-left justify-start"
            onClick={() => navigate('/mechanic/invoices/new')}
          >
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <FileText className="h-4 w-4" />
                <h3 className="font-medium">Generate Invoice</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create invoice for completed work
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="p-4 h-auto text-left justify-start"
            onClick={() => navigate('/mechanic/settings')}
          >
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <User className="h-4 w-4" />
                <h3 className="font-medium">Account Settings</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update username and password
              </p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;