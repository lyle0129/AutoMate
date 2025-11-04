import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../../hooks/useVehicles';
import { useMaintenance } from '../../hooks/useMaintenance';
import { parseDate, daysBetween } from '../../utils/dateUtils';
import { Car, Eye, Calendar, AlertTriangle, Search } from 'lucide-react';

/**
 * Customer Vehicle List component showing all owned vehicles
 */
const VehicleList = () => {
  const { vehicles, loading, error, fetchVehicles } = useVehicles();
  const { fetchMaintenanceLogs } = useMaintenance();
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVehicles, setFilteredVehicles] = useState([]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchVehicles();
        const logs = await fetchMaintenanceLogs();
        setMaintenanceLogs(logs || []);
      } catch (error) {
        console.error('Error loading vehicle data:', error);
      }
    };

    loadData();
  }, [fetchVehicles, fetchMaintenanceLogs]);

  // Filter vehicles based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredVehicles(vehicles);
    } else {
      const filtered = vehicles.filter(vehicle =>
        vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.plate_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.vehicle_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.year.toString().includes(searchTerm)
      );
      setFilteredVehicles(filtered);
    }
  }, [vehicles, searchTerm]);

  const getVehicleStatus = (vehicle) => {
    const vehicleLogs = maintenanceLogs.filter(log => log.vehicle_id === vehicle.vehicle_id);
    
    if (vehicleLogs.length === 0) {
      return { status: 'No Service History', color: 'gray', daysAgo: null };
    }

    const lastService = vehicleLogs
      .sort((a, b) => {
        const dateA = parseDate(a.created_at);
        const dateB = parseDate(b.created_at);
        if (!dateA || !dateB) return 0;
        return dateB - dateA;
      })[0];
    
    const daysSinceService = daysBetween(parseDate(lastService.created_at));

    if (daysSinceService === null) {
      return { status: 'No Service History', color: 'gray', daysAgo: null };
    } else if (daysSinceService <= 30) {
      return { status: 'Recently Serviced', color: 'green', daysAgo: daysSinceService };
    } else if (daysSinceService <= 90) {
      return { status: 'Good Condition', color: 'blue', daysAgo: daysSinceService };
    } else if (daysSinceService <= 180) {
      return { status: 'Service Due', color: 'yellow', daysAgo: daysSinceService };
    } else {
      return { status: 'Overdue', color: 'red', daysAgo: daysSinceService };
    }
  };

  const getStatusColorClasses = (color) => {
    const colorClasses = {
      green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      gray: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
    };
    return colorClasses[color] || colorClasses.gray;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Vehicles
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and view details of your registered vehicles
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search vehicles by make, model, plate number, or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No vehicles found' : 'No vehicles registered'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 
                'Try adjusting your search terms' : 
                'Contact your service provider to register vehicles'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => {
              const { status, color, daysAgo } = getVehicleStatus(vehicle);
              const vehicleMaintenanceCount = maintenanceLogs.filter(
                log => log.vehicle_id === vehicle.vehicle_id
              ).length;

              return (
                <div
                  key={vehicle.vehicle_id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Vehicle Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {vehicle.year} {vehicle.make}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {vehicle.model}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColorClasses(color)}`}>
                      {status}
                    </span>
                  </div>

                  {/* Vehicle Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Plate Number:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {vehicle.plate_no}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Vehicle Type:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {vehicle.vehicle_type}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Service Records:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {vehicleMaintenanceCount} services
                      </span>
                    </div>
                    {daysAgo !== null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Last Service:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {daysAgo} days ago
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Link
                      to={`/customer/vehicles/${vehicle.vehicle_id}`}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                    <Link
                      to={`/customer/vehicles/${vehicle.vehicle_id}/maintenance`}
                      className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      <Calendar className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredVehicles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Fleet Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredVehicles.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Vehicles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {filteredVehicles.filter(v => getVehicleStatus(v).color === 'green').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recently Serviced</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {filteredVehicles.filter(v => ['yellow', 'red'].includes(getVehicleStatus(v).color)).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Need Service</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {maintenanceLogs.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Services</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleList;