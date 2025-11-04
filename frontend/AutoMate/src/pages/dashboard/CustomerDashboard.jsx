import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useVehicles } from '../../hooks/useVehicles';
import { useMaintenance } from '../../hooks/useMaintenance';
import { parseDate, daysBetween, formatDate } from '../../utils/dateUtils';
import { Car, Calendar, Receipt, AlertTriangle, Eye, FileText, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Customer Dashboard component showing owned vehicles and maintenance overview
 */
const CustomerDashboard = () => {
  const { user } = useAuth();
  const { vehicles, loading: vehiclesLoading, error: vehiclesError, fetchVehicles } = useVehicles();
  const { loading: maintenanceLoading, error: maintenanceError, getUnpaidMaintenanceLogs, fetchMaintenanceLogs } = useMaintenance();
  
  const [recentMaintenanceLogs, setRecentMaintenanceLogs] = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalVehicles: 0,
    recentServices: 0,
    pendingInvoices: 0,
    serviceAlerts: 0
  });

  // Load dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch vehicles
        await fetchVehicles();
        
        // Fetch recent maintenance logs
        const maintenanceData = await fetchMaintenanceLogs();
        setRecentMaintenanceLogs(maintenanceData || []);
        
        // Fetch unpaid invoices
        const unpaidData = await getUnpaidMaintenanceLogs();
        setUnpaidInvoices(unpaidData.unpaid_maintenance_logs || []);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadDashboardData();
  }, [fetchVehicles, fetchMaintenanceLogs, getUnpaidMaintenanceLogs]);

  // Update dashboard stats when data changes
  useEffect(() => {
    // Calculate recent services (last 30 days)
    const recentServices = recentMaintenanceLogs.filter(log => {
      const logDate = parseDate(log.created_at);
      if (!logDate) return false;
      const daysAgo = daysBetween(logDate);
      return daysAgo !== null && daysAgo <= 30;
    }).length;

    // Calculate service alerts (vehicles with no maintenance in 90+ days)
    const vehiclesNeedingService = vehicles.filter(vehicle => {
      const lastService = recentMaintenanceLogs
        .filter(log => log.vehicle_id === vehicle.vehicle_id)
        .sort((a, b) => {
          const dateA = parseDate(a.created_at);
          const dateB = parseDate(b.created_at);
          if (!dateA || !dateB) return 0;
          return dateB - dateA;
        })[0];
      
      if (!lastService) return true; // No service history
      const daysSinceService = daysBetween(parseDate(lastService.created_at));
      return daysSinceService === null || daysSinceService > 90;
    }).length;

    setDashboardStats({
      totalVehicles: vehicles.length,
      recentServices,
      pendingInvoices: unpaidInvoices.length,
      serviceAlerts: vehiclesNeedingService
    });
  }, [vehicles, recentMaintenanceLogs, unpaidInvoices]);

  const vehicleStats = [
    {
      name: 'My Vehicles',
      value: dashboardStats.totalVehicles.toString(),
      icon: Car,
      color: 'blue',
      description: 'Registered vehicles'
    },
    {
      name: 'Recent Services',
      value: dashboardStats.recentServices.toString(),
      icon: Calendar,
      color: 'green',
      description: 'Last 30 days'
    },
    {
      name: 'Pending Invoices',
      value: dashboardStats.pendingInvoices.toString(),
      icon: Receipt,
      color: 'yellow',
      description: 'Awaiting payment'
    },
    {
      name: 'Service Alerts',
      value: dashboardStats.serviceAlerts.toString(),
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            My Vehicles
          </h2>
          <Link 
            to="/customer/vehicles" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        
        {vehiclesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : vehiclesError ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">{vehiclesError}</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-8">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No vehicles registered</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.slice(0, 4).map((vehicle) => {
              // Calculate last service date
              const lastService = recentMaintenanceLogs
                .filter(log => log.vehicle_id === vehicle.vehicle_id)
                .sort((a, b) => {
                  const dateA = parseDate(a.created_at);
                  const dateB = parseDate(b.created_at);
                  if (!dateA || !dateB) return 0;
                  return dateB - dateA;
                })[0];
              
              const lastServiceDate = lastService ? parseDate(lastService.created_at) : null;
              const daysSinceService = lastServiceDate ? daysBetween(lastServiceDate) : null;
              
              // Determine status
              let status = 'Good Condition';
              let statusColor = 'green';
              
              if (!lastServiceDate) {
                status = 'No Service History';
                statusColor = 'gray';
              } else if (daysSinceService > 90) {
                status = 'Service Due';
                statusColor = 'yellow';
              } else if (daysSinceService > 180) {
                status = 'Overdue';
                statusColor = 'red';
              }
              
              return (
                <div key={vehicle.vehicle_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      statusColor === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                      statusColor === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                      statusColor === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                      'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
                    }`}>
                      {status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Plate: {vehicle.plate_no} • {vehicle.vehicle_type}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {lastServiceDate ? 
                      `Last service: ${daysSinceService} days ago` : 
                      'No service history'
                    }
                  </p>
                  <div className="mt-3 flex space-x-2">
                    <Link
                      to={`/customer/vehicles/${vehicle.vehicle_id}`}
                      className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent maintenance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Maintenance
          </h2>
          <Link 
            to="/customer/maintenance" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        
        {maintenanceLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : maintenanceError ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">{maintenanceError}</p>
          </div>
        ) : recentMaintenanceLogs.length === 0 ? (
          <div className="text-center py-8">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No maintenance history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentMaintenanceLogs.slice(0, 5).map((log) => {
              const vehicle = vehicles.find(v => v.vehicle_id === log.vehicle_id);
              const logDate = parseDate(log.created_at);
              
              return (
                <div key={log.log_id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {typeof log.description === 'string' ? log.description : 
                       typeof log.description === 'object' && log.description?.custom_description ? 
                       log.description.custom_description : 'Maintenance Service'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.plate_no})` : 'Unknown Vehicle'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {logDate ? formatDate(logDate) : 'Invalid Date'}
                    </p>
                  </div>
                  <div className="text-right">
                    {log.cost && (
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${parseFloat(log.cost).toFixed(2)}
                      </p>
                    )}
                    <span className={`text-xs ${
                      log.paid_at ? 
                        'text-green-600 dark:text-green-400' : 
                        'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {log.paid_at ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            to="/customer/vehicles" 
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors block"
          >
            <div className="flex items-center mb-2">
              <Car className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">View All Vehicles</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">See detailed vehicle information</p>
          </Link>
          
          <Link 
            to="/customer/maintenance" 
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors block"
          >
            <div className="flex items-center mb-2">
              <Wrench className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">Maintenance History</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">View complete service records</p>
          </Link>
          
          <Link 
            to="/customer/invoices" 
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors block"
          >
            <div className="flex items-center mb-2">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
              <h3 className="font-medium text-gray-900 dark:text-white">View Invoices</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Download and print invoices</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;