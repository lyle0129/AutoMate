import { useState, useEffect } from 'react';
import { Car, Wrench, DollarSign, User, Calendar } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useVehicles } from '../../hooks/useVehicles';
import serviceService from '../../services/serviceService';
import { formatDate } from '../../utils/dateUtils';

/**
 * MaintenanceForm component for creating new maintenance entries
 */
const MaintenanceForm = ({ onSubmit, onCancel, loading = false, initialData = null }) => {
  const { vehicles, loading: vehiclesLoading, fetchVehicles } = useVehicles();

  const [formData, setFormData] = useState({
    vehicle_id: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    description: '',
    cost: '',
    services: []
  });

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [errors, setErrors] = useState({});

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchVehicles();
        await loadServices();
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };
    loadData();
  }, [fetchVehicles]);

  // Set initial form data if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        vehicle_id: initialData.vehicle_id || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: initialData.description || '',
        cost: initialData.cost?.toString() || '',
        services: initialData.services || []
      });
      setSelectedServices(initialData.services || []);
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

  // Handle vehicle selection
  const handleVehicleChange = (vehicleId) => {
    const vehicle = vehicles.find(v => v.vehicle_id === parseInt(vehicleId));
    setSelectedVehicle(vehicle);
    setFormData(prev => ({ ...prev, vehicle_id: vehicleId }));

    // Clear validation error for vehicle
    if (errors.vehicle_id) {
      setErrors(prev => ({ ...prev, vehicle_id: null }));
    }
  };

  // Handle service selection
  const handleServiceToggle = (service) => {
    const isSelected = selectedServices.some(s => s.service_id === service.service_id);

    if (isSelected) {
      // Remove service
      const newServices = selectedServices.filter(s => s.service_id !== service.service_id);
      setSelectedServices(newServices);
    } else {
      // Add service
      const newServices = [...selectedServices, service];
      setSelectedServices(newServices);
    }
  };

  // Calculate total cost from selected services
  useEffect(() => {
    const total = selectedServices.reduce((sum, service) => sum + parseFloat(service.price || 0), 0);
    setTotalCost(total);
    setFormData(prev => ({
      ...prev,
      cost: total.toString(),
      services: selectedServices.map(s => s.service_id)
    }));
  }, [selectedServices]);

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

    if (!formData.vehicle_id) {
      newErrors.vehicle_id = 'Please select a vehicle';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a description';
    }

    if (selectedServices.length === 0 && !formData.cost) {
      newErrors.services = 'Please select services or enter a cost';
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
      vehicle_id: parseInt(formData.vehicle_id),
      date: formData.date,
      description: formData.description, // Send as string - backend will structure it
      cost: parseFloat(formData.cost) || 0,
      service_ids: selectedServices.map(s => s.service_id) // Send service IDs for backend processing
    };

    onSubmit(submitData);
  };

  // Filter services compatible with selected vehicle
  const getCompatibleServices = () => {
    if (!selectedVehicle) return services;

    return services.filter(service => {
      if (!service.vehicle_types || service.vehicle_types.length === 0) {
        return true; // Service compatible with all vehicles
      }
      return service.vehicle_types.includes(selectedVehicle.vehicle_type);
    });
  };

  const compatibleServices = getCompatibleServices();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Vehicle Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Car className="inline h-4 w-4 mr-1" />
          Select Vehicle *
        </label>
        <select
          value={formData.vehicle_id}
          onChange={(e) => handleVehicleChange(e.target.value)}
          disabled={vehiclesLoading}
          className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 cursor-pointer ${errors.vehicle_id
            ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/10 dark:border-red-600 dark:text-red-100'
            : 'border-gray-300 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-800'
            }`}
        >
          <option value="">
            {vehiclesLoading ? 'Loading vehicles...' : vehicles.length === 0 ? 'No vehicles available' : 'Choose a vehicle'}
          </option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
              {vehicle.plate_no} - {vehicle.make} {vehicle.model} ({vehicle.year})
              {vehicle.owner_name && ` - ${vehicle.owner_name}`}
            </option>
          ))}
        </select>
        {errors.vehicle_id && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.vehicle_id}</p>
        )}
      </div>

      {/* Selected Vehicle Info */}
      {selectedVehicle && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
            Selected Vehicle Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Vehicle:</span> {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
            </div>
            <div>
              <span className="font-medium">Plate:</span> {selectedVehicle.plate_no}
            </div>
            <div>
              <span className="font-medium">Type:</span> {selectedVehicle.vehicle_type || 'Not specified'}
            </div>
            {selectedVehicle.owner_name && (
              <div>
                <span className="font-medium">Owner:</span> {selectedVehicle.owner_name}
                {selectedVehicle.owner_contact && ` (${selectedVehicle.owner_contact})`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Calendar className="inline h-4 w-4 mr-1" />
          Service Date *
        </label>
        <Input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          error={errors.date}
          required
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Wrench className="inline h-4 w-4 mr-1" />
          Service Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe the maintenance work performed..."
          rows={3}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
        )}
      </div>

      {/* Service Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Wrench className="inline h-4 w-4 mr-1" />
          Select Services
        </label>

        {servicesLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading services...</span>
          </div>
        ) : compatibleServices.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-3">
            {compatibleServices.map((service) => {
              const isSelected = selectedServices.some(s => s.service_id === service.service_id);
              return (
                <label
                  key={service.service_id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleServiceToggle(service)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {service.service_name}
                      </p>
                      {service.vehicle_types && service.vehicle_types.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Compatible: {service.vehicle_types.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    ${parseFloat(service.price || 0).toFixed(2)}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 border border-gray-300 dark:border-gray-600 rounded-md">
            <Wrench className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedVehicle ? 'No services available for this vehicle type' : 'Select a vehicle to see available services'}
            </p>
          </div>
        )}

        {errors.services && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.services}</p>
        )}
      </div>

      {/* Cost Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Cost Summary
          </span>
        </div>

        {selectedServices.length > 0 && (
          <div className="space-y-1 mb-3">
            {selectedServices.map((service) => (
              <div key={service.service_id} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{service.service_name}</span>
                <span className="text-gray-900 dark:text-white">${parseFloat(service.price || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
          <span className="font-semibold text-gray-900 dark:text-white">Total Cost:</span>
          <span className="text-xl font-bold text-green-600 dark:text-green-400">
            ${totalCost.toFixed(2)}
          </span>
        </div>

        {/* Manual cost override */}
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Manual Cost Override (optional)
          </label>
          <Input
            type="number"
            step="0.01"
            name="cost"
            value={formData.cost}
            onChange={handleInputChange}
            placeholder="Enter custom cost"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Leave empty to use calculated cost from selected services
          </p>
        </div>
      </div>

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
          disabled={loading}
        >
          {initialData ? 'Update' : 'Create'} Maintenance Log
        </Button>
      </div>
    </form>
  );
};

export default MaintenanceForm;