import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentRole } from '../../hooks/useCurrentRole';
import { useVehicles } from '../../hooks/useVehicles';
import { useMaintenance } from '../../hooks/useMaintenance';
import { parseDate, formatDate, daysBetween } from '../../utils/dateUtils';
import { formatInvoiceDescription, getServicesBreakdown, formatServicesList } from '../../utils/invoiceUtils';
import { getVehiclesListPath, getInvoicesListPath } from '../../utils/routeUtils';
import {
  Car,
  Calendar,
  ArrowLeft,
  AlertTriangle,
  Wrench,
  Banknote,
  Clock,
  FileText
} from 'lucide-react';

/**
 * Customer Vehicle Detail component showing comprehensive vehicle information
 */
const VehicleDetail = () => {
  const { vehicleId } = useParams();
  const { user } = useAuth();
  const currentRole = useCurrentRole();
  const { getVehicleById, loading: vehicleLoading, error: vehicleError } = useVehicles();
  const {
    getMaintenanceLogsByVehicleId,
    getMaintenanceHistorySummary,
    loading: maintenanceLoading,
    error: maintenanceError
  } = useMaintenance();

  const [vehicle, setVehicle] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [maintenanceSummary, setMaintenanceSummary] = useState(null);

  // Load vehicle and maintenance data
  useEffect(() => {
    const loadVehicleData = async () => {
      try {
        // Fetch vehicle details
        const vehicleData = await getVehicleById(vehicleId);
        setVehicle(vehicleData);

        // Fetch maintenance logs for this vehicle
        const maintenanceLogsData = await getMaintenanceLogsByVehicleId(vehicleId);
        setMaintenanceData(maintenanceLogsData);

        // Fetch maintenance summary
        const summaryData = await getMaintenanceHistorySummary(vehicleId);
        setMaintenanceSummary(summaryData);

      } catch (error) {
        console.error('Error loading vehicle data:', error);
      }
    };

    if (vehicleId) {
      loadVehicleData();
    }
  }, [vehicleId, getVehicleById, getMaintenanceLogsByVehicleId, getMaintenanceHistorySummary]);

  const getVehicleStatus = () => {
    if (!maintenanceData?.maintenance_logs || maintenanceData.maintenance_logs.length === 0) {
      return { status: 'No Service History', color: 'gray' };
    }

    const lastService = maintenanceData.maintenance_logs
      .sort((a, b) => {
        const dateA = parseDate(a.created_at);
        const dateB = parseDate(b.created_at);
        if (!dateA || !dateB) return 0;
        return dateB - dateA;
      })[0];

    const daysSinceService = daysBetween(parseDate(lastService.created_at));

    if (daysSinceService === null) {
      return { status: 'No Service History', color: 'gray' };
    } else if (daysSinceService <= 30) {
      return { status: 'Recently Serviced', color: 'green' };
    } else if (daysSinceService <= 90) {
      return { status: 'Good Condition', color: 'blue' };
    } else if (daysSinceService <= 180) {
      return { status: 'Service Due', color: 'yellow' };
    } else {
      return { status: 'Overdue', color: 'red' };
    }
  };

  const getStatusColorClasses = (color) => {
    const colorClasses = {
      green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
      gray: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800'
    };
    return colorClasses[color] || colorClasses.gray;
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
            to={getVehiclesListPath(currentRole)}
            className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vehicles
          </Link>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Vehicle not found</p>
          <Link
            to={getVehiclesListPath(currentRole)}
            className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vehicles
          </Link>
        </div>
      </div>
    );
  }

  const { status, color } = getVehicleStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={getVehiclesListPath(currentRole)}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vehicles
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Plate: {vehicle.plate_no} • Type: {vehicle.vehicle_type}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg border ${getStatusColorClasses(color)}`}>
          <span className="font-medium">{status}</span>
        </div>
      </div>

      {/* Vehicle Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Vehicle Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Make</p>
            <p className="font-medium text-gray-900 dark:text-white">{vehicle.make}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Model</p>
            <p className="font-medium text-gray-900 dark:text-white">{vehicle.model}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Year</p>
            <p className="font-medium text-gray-900 dark:text-white">{vehicle.year}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Vehicle Type</p>
            <p className="font-medium text-gray-900 dark:text-white">{vehicle.vehicle_type}</p>
          </div>
        </div>
      </div>

      {/* Maintenance Summary */}
      {maintenanceSummary && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Maintenance Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Wrench className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {maintenanceSummary.maintenance_summary?.total_services || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Services</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Banknote className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₱{maintenanceSummary.maintenance_summary?.total_cost ?
                  parseFloat(maintenanceSummary.maintenance_summary.total_cost).toFixed(2) :
                  '0.00'
                }
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {maintenanceData?.maintenance_logs?.length > 0 ?
                  (() => {
                    const lastService = maintenanceData.maintenance_logs
                      .sort((a, b) => {
                        const dateA = parseDate(a.created_at);
                        const dateB = parseDate(b.created_at);
                        if (!dateA || !dateB) return 0;
                        return dateB - dateA;
                      })[0];
                    const days = daysBetween(parseDate(lastService.created_at));
                    return days !== null ? days : 'N/A';
                  })() :
                  'N/A'
                }
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {maintenanceData?.maintenance_logs?.length > 0 ? 'Days Since Last Service' : 'No Service History'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Maintenance History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Maintenance History
          </h2>
          <Link
            to={`/${currentRole}/vehicles/${vehicleId}/maintenance`}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
          >
            View All History
          </Link>
        </div>

        {!maintenanceData?.maintenance_logs || maintenanceData.maintenance_logs.length === 0 ? (
          <div className="text-center py-8">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No maintenance history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {maintenanceData.maintenance_logs
              .sort((a, b) => {
                const dateA = parseDate(a.created_at);
                const dateB = parseDate(b.created_at);
                if (!dateA || !dateB) return 0;
                return dateB - dateA;
              })
              .slice(0, 5)
              .map((log) => {
                const logDate = parseDate(log.created_at);
                return (
                  <div
                    key={log.log_id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="mb-2">
                        <div className="flex items-center">
                          <Wrench className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatInvoiceDescription(log.description)}
                          </p>
                        </div>

                        {(() => {
                          const services = getServicesBreakdown(log.description);
                          if (services.length > 0) {
                            return (
                              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                <span className="text-gray-500 dark:text-gray-500 font-medium">Services:</span>{' '}
                                {services
                                  .map(
                                    (service) =>
                                      `${service.service_name} — ₱${parseFloat(service.price || 0).toFixed(2)}`
                                  )
                                  .join(', ')}
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Performed by: {log.user_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {logDate ? formatDate(logDate) : 'Invalid Date'}
                      </p>
                    </div>
                    <div className="text-right">
                      {log.cost && (
                        <p className="font-medium text-gray-900 dark:text-white mb-1">
                          ₱{parseFloat(log.cost).toFixed(2)}
                        </p>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${log.paid_at ?
                        'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
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

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to={`/${currentRole}/vehicles/${vehicleId}/maintenance`}
            className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">View Full History</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                See complete maintenance records
              </p>
            </div>
          </Link>
          <Link
            to={getInvoicesListPath(currentRole)}
            className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FileText className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">View Invoices</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download and print invoices
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
