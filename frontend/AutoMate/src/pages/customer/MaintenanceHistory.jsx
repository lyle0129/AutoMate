import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVehicles } from '../../hooks/useVehicles';
import { useMaintenance } from '../../hooks/useMaintenance';
import { parseDate, formatDate, daysBetween, daysAgo } from '../../utils/dateUtils';
import { formatInvoiceDescription, getServicesBreakdown, formatServicesList } from '../../utils/invoiceUtils';
import { 
  ArrowLeft, 
  Calendar, 
  Search, 
  Wrench, 
  DollarSign,
  User,
  AlertTriangle,
  Download
} from 'lucide-react';

/**
 * MaintenanceHistory component with chronological listing and filtering
 */
const MaintenanceHistory = () => {
  const { vehicleId } = useParams();
  const { getVehicleById, loading: vehicleLoading, error: vehicleError } = useVehicles();
  const { 
    getMaintenanceLogsByVehicleId, 
    fetchMaintenanceLogs,
    loading: maintenanceLoading, 
    error: maintenanceError 
  } = useMaintenance();
  
  const [vehicle, setVehicle] = useState(null);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load vehicle and maintenance data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (vehicleId) {
          // Fetch vehicle details
          const vehicleData = await getVehicleById(vehicleId);
          setVehicle(vehicleData);

          // Fetch maintenance logs for this vehicle
          const maintenanceData = await getMaintenanceLogsByVehicleId(vehicleId);
          setMaintenanceLogs(maintenanceData.maintenance_logs || []);
        } else {
          // If no vehicleId, fetch all maintenance logs for customer
          const allLogs = await fetchMaintenanceLogs();
          setMaintenanceLogs(allLogs || []);
        }
      } catch (error) {
        console.error('Error loading maintenance data:', error);
      }
    };

    loadData();
  }, [vehicleId, getVehicleById, getMaintenanceLogsByVehicleId]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...maintenanceLogs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log => {
        const description = formatInvoiceDescription(log.description);
        const services = getServicesBreakdown(log.description);
        const servicesList = formatServicesList(services);
        
        return (
          (description && description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (servicesList && servicesList.toLowerCase().includes(searchTerm.toLowerCase())) ||
          log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.cost && log.cost.toString().includes(searchTerm))
        );
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      let filterDays;
      
      switch (dateFilter) {
        case 'week':
          filterDays = 7;
          break;
        case 'month':
          filterDays = 30;
          break;
        case 'quarter':
          filterDays = 90;
          break;
        case 'year':
          filterDays = 365;
          break;
        default:
          filterDays = null;
          break;
      }
      
      if (filterDays) {
        filtered = filtered.filter(log => {
          const logDate = parseDate(log.created_at);
          if (!logDate) return false;
          const daysOld = daysBetween(logDate);
          return daysOld !== null && daysOld <= filterDays;
        });
      }
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => {
        if (statusFilter === 'paid') return log.paid_at;
        if (statusFilter === 'unpaid') return !log.paid_at;
        return true;
      });
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = parseDate(a.created_at);
      const dateB = parseDate(b.created_at);
      if (!dateA || !dateB) return 0;
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredLogs(filtered);
  }, [maintenanceLogs, searchTerm, dateFilter, statusFilter, sortOrder]);

  const calculateTotalCost = () => {
    return filteredLogs
      .filter(log => log.cost)
      .reduce((total, log) => total + parseFloat(log.cost), 0);
  };

  const getPaymentStatusColor = (log) => {
    return log.paid_at ? 
      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
  };

  if (vehicleLoading || maintenanceLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (vehicleError || maintenanceError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg">
            {vehicleError || maintenanceError}
          </p>
          <Link
            to={vehicleId ? `/customer/vehicles/${vehicleId}` : "/customer/vehicles"}
            className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to={vehicleId ? `/customer/vehicles/${vehicleId}` : "/customer/vehicles"}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {vehicleId ? 'Back to Vehicle Details' : 'Back to Vehicles'}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {vehicleId && vehicle ? 
            `Maintenance History - ${vehicle.year} ${vehicle.make} ${vehicle.model}` :
            'All Maintenance History'
          }
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {vehicleId && vehicle ? 
            `Complete service records for ${vehicle.plate_no}` :
            'Complete service records for all your vehicles'
          }
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {filteredLogs.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Services Found</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${calculateTotalCost().toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {filteredLogs.filter(log => !log.paid_at).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Unpaid</p>
          </div>
        </div>
      </div>

      {/* Maintenance History List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No maintenance records found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || dateFilter !== 'all' || statusFilter !== 'all' ? 
                'Try adjusting your filters' : 
                'No maintenance history available'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLogs.map((log) => {
              const logDate = parseDate(log.created_at);
              const paidDate = log.paid_at ? parseDate(log.paid_at) : null;
              
              return (
                <div key={log.log_id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Service Header */}
                      <div className="flex flex-col mb-2">
                        <div className="flex items-center">
                          <Wrench className="h-5 w-5 text-gray-400 mr-2" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {formatInvoiceDescription(log.description)}
                          </h3>
                        </div>

                        {(() => {
                          const services = getServicesBreakdown(log.description);
                          if (services.length > 0) {
                            return (
                              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-medium flex flex-wrap items-center">
                                <span className="text-gray-500 dark:text-gray-500 mr-1">Service Breakdown:</span>
                                {services.map((service, index) => (
                                  <span key={index} className="mr-3">
                                    {service.service_name} — ${parseFloat(service.price || 0).toFixed(2)}
                                    {index < services.length - 1 ? ',' : ''}
                                  </span>
                                ))}
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>


                      {/* Service Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {logDate ? formatDate(logDate) : 'Invalid Date'}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <User className="h-4 w-4 mr-2" />
                          <span>Performed by: {log.user_name}</span>
                        </div>

                        {log.cost && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span>Cost: ${parseFloat(log.cost).toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {/* Payment Information */}
                      {paidDate && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Paid on: {formatDate(paidDate)}
                          {log.paid_using && (
                            <span className="ml-2">via {log.paid_using.replace('_', ' ')}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 text-xs rounded-full ${getPaymentStatusColor(log)}`}>
                        {log.paid_at ? 'Paid' : 'Unpaid'}
                      </span>
                      
                      {log.cost && !log.paid_at && (
                        <Link
                          to={`/customer/invoices?log=${log.log_id}`}
                          className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          View Invoice
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export Actions */}
      {filteredLogs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Export Options
          </h3>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <Download className="h-4 w-4 mr-2" />
              Export to PDF
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceHistory;