import { useState, useEffect } from 'react';
import { Wrench, Plus, Edit, Trash2, Search, DollarSign, Car } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Form, { validators } from '../../components/forms/Form';
import apiClient from '../../services/apiClient';

/**
 * Service Management page for admin users
 */
const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Common vehicle types
  const commonVehicleTypes = [
    'Car', 'Truck', 'Motorcycle', 'SUV', 'Van', 'Bus', 'Trailer'
  ];

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/services');
      setServices(response || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filter services based on search term
  const filteredServices = services.filter(service =>
    service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.vehicle_types?.some(type => 
      type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Handle create service
  const handleCreateService = async (formData) => {
    try {
      setSubmitting(true);
      
      // Parse vehicle types from comma-separated string
      const vehicleTypes = formData.vehicle_types
        ? formData.vehicle_types.split(',').map(type => type.trim()).filter(type => type)
        : [];

      const serviceData = {
        service_name: formData.service_name,
        price: parseFloat(formData.price),
        vehicle_types: vehicleTypes
      };

      await apiClient.post('/services', serviceData);
      await fetchServices();
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating service:', err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit service
  const handleEditService = async (formData) => {
    try {
      setSubmitting(true);
      
      // Parse vehicle types from comma-separated string
      const vehicleTypes = formData.vehicle_types
        ? formData.vehicle_types.split(',').map(type => type.trim()).filter(type => type)
        : [];

      const serviceData = {
        service_name: formData.service_name,
        price: parseFloat(formData.price),
        vehicle_types: vehicleTypes
      };

      await apiClient.put(`/services/${selectedService.service_id}`, serviceData);
      await fetchServices();
      setShowEditModal(false);
      setSelectedService(null);
    } catch (err) {
      console.error('Error updating service:', err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete service
  const handleDeleteService = async () => {
    try {
      setSubmitting(true);
      await apiClient.delete(`/services/${selectedService.service_id}`);
      await fetchServices();
      setShowDeleteModal(false);
      setSelectedService(null);
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Failed to delete service');
    } finally {
      setSubmitting(false);
    }
  };

  // Form validation rules
  const validationRules = {
    service_name: [validators.required('Service name is required')],
    price: [
      validators.required('Price is required'),
      validators.number('Price must be a valid number'),
      validators.min(0, 'Price must be positive')
    ],
    vehicle_types: [validators.required('At least one vehicle type is required')]
  };

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Service Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage repair services and pricing
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.length === 0 ? (
          <div className="col-span-full">
            <div className="text-center py-12">
              <Wrench className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No services found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating a new service.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.service_id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Wrench className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {service.service_name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatPrice(service.price)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Car className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Compatible Vehicles:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {service.vehicle_types && service.vehicle_types.length > 0 ? (
                        service.vehicle_types.map((type, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full"
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          All vehicle types
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ID: {service.service_id}
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedService(service);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setSelectedService(service);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Service Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Service"
        size="md"
      >
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Admin panel - Add a new repair service
          </p>
        </div>

        <Form
          onSubmit={handleCreateService}
          validationRules={validationRules}
          loading={submitting}
          submitText="Create Service"
          onCancel={() => setShowCreateModal(false)}
        >
          <Input
            name="service_name"
            label="Service Name"
            placeholder="Enter service name"
            required
          />

          <Input
            name="price"
            type="number"
            step="0.01"
            label="Price ($)"
            placeholder="Enter price"
            required
          />

          <Input
            name="vehicle_types"
            label="Compatible Vehicle Types"
            placeholder="Enter vehicle types separated by commas (e.g., Car, Truck, SUV)"
            required
          />
        </Form>
      </Modal>

      {/* Edit Service Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedService(null);
        }}
        title={selectedService ? `Edit Service: ${selectedService.service_name}` : "Edit Service"}
        size="md"
      >
        {selectedService && (
          <>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update service information and pricing
              </p>
            </div>

            <Form
                onSubmit={handleEditService}
                initialValues={{
                  service_name: selectedService.service_name,
                  price: selectedService.price.toString(),
                  vehicle_types: selectedService.vehicle_types?.join(', ') || ''
                }}
                validationRules={validationRules}
                loading={submitting}
                submitText="Update Service"
                onCancel={() => {
                  setShowEditModal(false);
                  setSelectedService(null);
                }}
                className="space-y-4"
              >
                <Input
                  name="service_name"
                  label="Service Name"
                  placeholder="Enter service name"
                  required
                />

                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  label="Price ($)"
                  placeholder="Enter price"
                  required
                />

                <Input
                  name="vehicle_types"
                  label="Compatible Vehicle Types"
                  placeholder="Enter vehicle types separated by commas (e.g., Car, Truck, SUV)"
                  required
                />
            </Form>
          </>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedService(null);
        }}
        title="Delete Service"
      >
        {selectedService && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete the service "{selectedService.service_name}"? This action cannot be undone.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Warning:</strong> Deleting this service may affect existing maintenance logs that reference it.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedService(null);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteService}
                loading={submitting}
              >
                Delete Service
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ServiceManagement;