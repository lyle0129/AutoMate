import { useState, useEffect } from 'react';
import { FileText, Banknote, Printer, Eye } from 'lucide-react';
import Button from '../ui/Button';
import { useMaintenance } from '../../hooks/useMaintenance';
import { useVehicles } from '../../hooks/useVehicles';
import { formatDate } from '../../utils/dateUtils';
import { printInvoice } from '../../utils/invoiceUtils';

/**
 * InvoiceForm component for creating invoices from maintenance logs
 */
const InvoiceForm = ({ onSubmit, onCancel, loading = false, initialData = null }) => {
  const { maintenanceLogs, loading: maintenanceLoading, fetchMaintenanceLogs } = useMaintenance();
  const { vehicles, loading: vehiclesLoading, fetchVehicles } = useVehicles();

  const [formData, setFormData] = useState({
    maintenance_log_id: '',
    payment_method: '',
    notes: ''
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [errors, setErrors] = useState({});

  // Payment method options
  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'check', label: 'Check' },
    { value: 'bank_transfer', label: 'Bank Transfer' }
  ];

  // Load initial data
  useEffect(() => {
    fetchMaintenanceLogs();
    fetchVehicles();
  }, [fetchMaintenanceLogs, fetchVehicles]);

  // Set initial form data if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        maintenance_log_id: initialData.maintenance_log_id || '',
        payment_method: initialData.payment_method || '',
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  // Load available services
  const loadServices = async () => {
    try {
      setServicesLoading(true);
      const data = await serviceService.getAllServices();
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setServicesLoading(false);
    }
  };

  // Handle maintenance log selection
  const handleLogSelection = (logId) => {
    const log = maintenanceLogs.find(l => l.log_id === parseInt(logId));
    setSelectedLog(log);

    if (log) {
      // Find associated vehicle
      const vehicle = vehicles.find(v => v.vehicle_id === log.vehicle_id);
      setSelectedVehicle(vehicle);

      // Parse services from description if available
      let logServices = [];
      if (typeof log.description === 'object' && log.description?.services) {
        logServices = log.description.services;
      }
      setSelectedServices(logServices);

      // Set total cost
      setTotalCost(parseFloat(log.cost) || 0);
    }

    setFormData(prev => ({ ...prev, maintenance_log_id: logId }));

    // Clear validation error
    if (errors.maintenance_log_id) {
      setErrors(prev => ({ ...prev, maintenance_log_id: null }));
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.maintenance_log_id) {
      newErrors.maintenance_log_id = 'Please select a maintenance log';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      maintenance_log: selectedLog,
      vehicle: selectedVehicle,
      services: selectedServices,
      total_cost: totalCost
    };

    onSubmit(submitData);
  };

  // Handle print invoice - same as task 7
  const handlePrint = () => {
    if (!selectedLog || !selectedVehicle) {
      return;
    }
    printInvoice(selectedLog, selectedVehicle);
  };

  // Handle download PDF - same as task 7
  const handleDownloadPDF = () => {
    if (!selectedLog || !selectedVehicle) {
      return;
    }
    printInvoice(selectedLog, selectedVehicle);
  };

  // Get unpaid maintenance logs
  const getUnpaidLogs = () => {
    return maintenanceLogs.filter(log => !log.paid_at);
  };

  const unpaidLogs = getUnpaidLogs();

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Maintenance Log Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Select Maintenance Log *
          </label>
          <select
            value={formData.maintenance_log_id}
            onChange={(e) => handleLogSelection(e.target.value)}
            disabled={maintenanceLoading}
            className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 cursor-pointer ${errors.maintenance_log_id
                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/10 dark:border-red-600 dark:text-red-100'
                : 'border-gray-300 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-800'
              }`}
          >
            <option value="">
              {maintenanceLoading ? 'Loading maintenance logs...' : 'Choose a maintenance log'}
            </option>
            {unpaidLogs.map((log) => {
              const vehicle = vehicles.find(v => v.vehicle_id === log.vehicle_id);
              return (
                <option key={log.log_id} value={log.log_id}>
                  #{log.log_id} - {vehicle ? `${vehicle.plate_no} (${vehicle.make} ${vehicle.model})` : 'Unknown Vehicle'} -
                  ₱{parseFloat(log.cost || 0).toFixed(2)} - {formatDate(log.created_at)}
                </option>
              );
            })}
          </select>
          {errors.maintenance_log_id && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maintenance_log_id}</p>
          )}

          {unpaidLogs.length === 0 && !maintenanceLoading && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              No unpaid maintenance logs found. All maintenance work has been invoiced.
            </p>
          )}
        </div>

        {/* Selected Log Details */}
        {selectedLog && selectedVehicle && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-3">
              Selected Maintenance Log Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Log ID:</span> #{selectedLog.log_id}
              </div>
              <div>
                <span className="font-medium">Date:</span> {formatDate(selectedLog.date)}
              </div>
              <div>
                <span className="font-medium">Vehicle:</span> {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
              </div>
              <div>
                <span className="font-medium">Plate:</span> {selectedVehicle.plate_no}
              </div>
              <div>
                <span className="font-medium">Technician:</span> {selectedLog.user_name}
              </div>
              <div>
                <span className="font-medium">Cost:</span> ₱{parseFloat(selectedLog.cost || 0).toFixed(2)}
              </div>
            </div>

            <div className="mt-3">
              <span className="font-medium">Description:</span>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                {typeof selectedLog.description === 'string'
                  ? selectedLog.description
                  : selectedLog.description?.custom_description || 'Maintenance Service'}
              </p>
            </div>

            {selectedServices.length > 0 && (
              <div className="mt-3">
                <span className="font-medium">Services Performed:</span>
                <div className="mt-1 space-y-1">
                  {selectedServices.map((service, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>• {service.service_name}</span>
                      <span>₱{parseFloat(service.price || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedVehicle.owner && (
              <div className="mt-3">
                <span className="font-medium">Owner:</span> {selectedVehicle.owner.name}
                {selectedVehicle.owner.contact && ` (${selectedVehicle.owner.contact})`}
              </div>
            )}
          </div>
        )}

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Banknote className="inline h-4 w-4 mr-1" />
            Payment Method *
          </label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleInputChange}
            className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 cursor-pointer ${errors.payment_method
                ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/10 dark:border-red-600 dark:text-red-100'
                : 'border-gray-300 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-800'
              }`}
          >
            <option value="">Select payment method</option>
            {paymentMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
          {errors.payment_method && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.payment_method}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Add any additional notes for this invoice..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Invoice Actions - Same as task 7 */}
        {selectedLog && selectedVehicle && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Invoice Actions
            </h4>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadPDF}
              >
                <Eye className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading || !selectedLog}
          >
            Generate Invoice & Mark as Paid
          </Button>
        </div>
      </form>


    </>
  );
};

export default InvoiceForm;