import { useState, useEffect } from 'react';
import { useOwners } from '../../hooks/useOwners';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import LoadingSpinner from '../ui/LoadingSpinner';
import { AlertTriangle } from 'lucide-react';

/**
 * Vehicle form component for creating and editing vehicles
 */
const VehicleForm = ({ 
  vehicle = null, 
  onSubmit, 
  onCancel, 
  loading = false,
  error = null 
}) => {
  const { owners, loading: ownersLoading, fetchOwners } = useOwners();
  const [formData, setFormData] = useState({
    plate_no: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vehicle_type: '',
    owner_id: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Load owners on component mount
  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  // Populate form with vehicle data when editing
  useEffect(() => {
    if (vehicle) {
      setFormData({
        plate_no: vehicle.plate_no || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        vehicle_type: vehicle.vehicle_type || '',
        owner_id: vehicle.owner_id || ''
      });
    }
  }, [vehicle]);

  const vehicleTypes = [
    { value: 'Car', label: 'Car' },
    { value: 'Truck', label: 'Truck' },
    { value: 'Motorcycle', label: 'Motorcycle' },
    { value: 'SUV', label: 'SUV' },
    { value: 'Van', label: 'Van' },
    { value: 'Bus', label: 'Bus' },
    { value: 'Other', label: 'Other' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.plate_no.trim()) {
      errors.plate_no = 'Plate number is required';
    }

    if (!formData.make.trim()) {
      errors.make = 'Make is required';
    }

    if (!formData.model.trim()) {
      errors.model = 'Model is required';
    }

    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      errors.year = 'Please enter a valid year';
    }

    if (!formData.vehicle_type) {
      errors.vehicle_type = 'Vehicle type is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      year: parseInt(formData.year),
      owner_id: formData.owner_id ? parseInt(formData.owner_id) : null
    };

    onSubmit(submitData);
  };

  const ownerOptions = [
    { value: '', label: 'No Owner (Unassigned)' },
    ...owners.map(owner => ({
      value: owner.owner_id.toString(),
      label: `${owner.name}${owner.contact ? ` (${owner.contact})` : ''}`
    }))
  ];

  if (ownersLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plate Number */}
        <div>
          <Input
            label="Plate Number"
            name="plate_no"
            value={formData.plate_no}
            onChange={handleInputChange}
            error={formErrors.plate_no}
            placeholder="Enter plate number"
            required
          />
        </div>

        {/* Owner */}
        <div>
          <Select
            label="Owner"
            name="owner_id"
            value={formData.owner_id}
            onChange={handleInputChange}
            options={ownerOptions}
            error={formErrors.owner_id}
          />
        </div>

        {/* Make */}
        <div>
          <Input
            label="Make"
            name="make"
            value={formData.make}
            onChange={handleInputChange}
            error={formErrors.make}
            placeholder="e.g., Toyota, Ford, Honda"
            required
          />
        </div>

        {/* Model */}
        <div>
          <Input
            label="Model"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            error={formErrors.model}
            placeholder="e.g., Camry, F-150, Civic"
            required
          />
        </div>

        {/* Year */}
        <div>
          <Input
            label="Year"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleInputChange}
            error={formErrors.year}
            min="1900"
            max={new Date().getFullYear() + 1}
            required
          />
        </div>

        {/* Vehicle Type */}
        <div>
          <Select
            label="Vehicle Type"
            name="vehicle_type"
            value={formData.vehicle_type}
            onChange={handleInputChange}
            options={vehicleTypes}
            error={formErrors.vehicle_type}
            required
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
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
          disabled={loading}
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {vehicle ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            vehicle ? 'Update Vehicle' : 'Create Vehicle'
          )}
        </Button>
      </div>
    </form>
  );
};

export default VehicleForm;