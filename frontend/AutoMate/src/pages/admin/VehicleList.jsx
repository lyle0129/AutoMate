import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../../hooks/useVehicles';
import { useOwners } from '../../hooks/useOwners';
import { useSearch } from '../../hooks/useSearch';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import VehicleForm from '../../components/forms/VehicleForm';
import { 
  Car, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  AlertTriangle,
  Filter,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

/**
 * Vehicle List page for admin and mechanic roles
 */
const VehicleList = () => {
  const { 
    vehicles, 
    loading, 
    error, 
    fetchVehicles, 
    createVehicle, 
    updateVehicle, 
    deleteVehicle 
  } = useVehicles();
  const { owners, fetchOwners } = useOwners();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Search and filtering
  const searchFields = ['make', 'model', 'plate_no', 'year', 'vehicle_type'];
  const {
    data: paginatedVehicles,
    searchTerm,
    updateSearchTerm,
    filters,
    updateFilter,
    clearFilters,
    sortConfig,
    updateSort,
    paginationInfo,
    changePage,
    hasActiveFilters,
    isEmpty
  } = useSearch(vehicles, searchFields, { itemsPerPage: 10 });

  // Load data on component mount
  useEffect(() => {
    fetchVehicles();
    fetchOwners();
  }, [fetchVehicles, fetchOwners]);

  const handleCreateVehicle = async (vehicleData) => {
    setFormLoading(true);
    setFormError(null);
    try {
      await createVehicle(vehicleData);
      setShowCreateModal(false);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditVehicle = async (vehicleData) => {
    setFormLoading(true);
    setFormError(null);
    try {
      await updateVehicle(selectedVehicle.vehicle_id, vehicleData);
      setShowEditModal(false);
      setSelectedVehicle(null);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteVehicle = async () => {
    setFormLoading(true);
    setFormError(null);
    try {
      await deleteVehicle(selectedVehicle.vehicle_id);
      setShowDeleteModal(false);
      setSelectedVehicle(null);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowEditModal(true);
    setFormError(null);
  };

  const openDeleteModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDeleteModal(true);
    setFormError(null);
  };

  const handleFilterChange = (key, value) => {
    updateFilter(key, value);
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  const getOwnerName = (ownerId) => {
    if (!ownerId) return 'Unassigned';
    const owner = owners.find(o => o.owner_id === ownerId);
    return owner ? owner.name : 'Unknown Owner';
  };

  const vehicleTypes = [
    { value: '', label: 'All Types' },
    { value: 'Car', label: 'Car' },
    { value: 'Truck', label: 'Truck' },
    { value: 'Motorcycle', label: 'Motorcycle' },
    { value: 'SUV', label: 'SUV' },
    { value: 'Van', label: 'Van' },
    { value: 'Bus', label: 'Bus' },
    { value: 'Other', label: 'Other' }
  ];

  const ownerFilterOptions = [
    { value: '', label: 'All Owners' },
    { value: 'null', label: 'Unassigned' },
    ...owners.map(owner => ({
      value: owner.owner_id.toString(),
      label: owner.name
    }))
  ];

  if (loading && vehicles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Vehicle Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all vehicles in the system
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="sm:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by make, model, plate number, or year..."
                value={searchTerm}
                onChange={(e) => updateSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Vehicle Type Filter */}
          <div>
            <Select
              value={filters.vehicle_type || ''}
              onChange={(e) => handleFilterChange('vehicle_type', e.target.value)}
              options={vehicleTypes}
            />
          </div>

          {/* Owner Filter */}
          <div>
            <Select
              value={filters.owner_id || ''}
              onChange={(e) => handleFilterChange('owner_id', e.target.value)}
              options={ownerFilterOptions}
            />
          </div>
        </div>

        {/* Year Range Filter */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year From
            </label>
            <Input
              type="number"
              placeholder="e.g., 2010"
              value={filters.yearFrom || ''}
              onChange={(e) =>
                handleFilterChange('yearFrom', e.target.value ? parseInt(e.target.value) : '')
              }
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year To
            </label>
            <Input
              type="number"
              placeholder="e.g., 2024"
              value={filters.yearTo || ''}
              onChange={(e) =>
                handleFilterChange('yearTo', e.target.value ? parseInt(e.target.value) : '')
              }
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 gap-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Filter className="h-4 w-4 text-gray-500" />
              <span>
                Showing {paginationInfo.totalItems} of {vehicles.length} vehicles
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start sm:items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Vehicle Table or Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {isEmpty ? (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {hasActiveFilters ? 'No vehicles found' : 'No vehicles registered'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {hasActiveFilters
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first vehicle'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {['Vehicle', 'Plate Number', 'Type', 'Year', 'Owner', 'Actions'].map((header, i) => (
                      <th
                        key={i}
                        className={`${
                          header === 'Actions' ? 'text-right' : 'text-left'
                        } px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedVehicles.map((vehicle) => (
                    <tr key={vehicle.vehicle_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {vehicle.year}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {vehicle.plate_no}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          {vehicle.vehicle_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {vehicle.year}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {getOwnerName(vehicle.owner_id)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/admin/vehicles/${vehicle.vehicle_id}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => openEditModal(vehicle)}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(vehicle)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 p-4">
              {paginatedVehicles.map((vehicle) => (
                <div
                  key={vehicle.vehicle_id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {vehicle.year} • {vehicle.vehicle_type}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      #{vehicle.vehicle_id}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p>
                      <span className="font-medium">Plate:</span> {vehicle.plate_no}
                    </p>
                    <p>
                      <span className="font-medium">Owner:</span>{' '}
                      {getOwnerName(vehicle.owner_id)}
                    </p>
                  </div>
                  <div className="flex justify-end space-x-3 mt-3">
                    <Link
                      to={`/admin/vehicles/${vehicle.vehicle_id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => openEditModal(vehicle)}
                      className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(vehicle)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Pagination
                currentPage={paginationInfo.currentPage}
                totalPages={paginationInfo.totalPages}
                totalItems={paginationInfo.totalItems}
                itemsPerPage={paginationInfo.itemsPerPage}
                onPageChange={changePage}
              />
            </div>
          </>
        )}
      </div>



      {/* Summary Stats */}
      {vehicles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Fleet Summary
          </h3>

          <div className="
            grid 
            grid-cols-2 
            sm:grid-cols-4 
            gap-4 
            sm:gap-6 
            text-center
          ">
            {/* Total Vehicles */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {vehicles.length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Total Vehicles
              </p>
            </div>

            {/* Assigned */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                {vehicles.filter(v => v.owner_id).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Assigned
              </p>
            </div>

            {/* Unassigned */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              <p className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {vehicles.filter(v => !v.owner_id).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Unassigned
              </p>
            </div>

            {/* Vehicle Types */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                {new Set(vehicles.map(v => v.vehicle_type)).size}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Vehicle Types
              </p>
            </div>
          </div>
        </div>
      )}


      {/* Create Vehicle Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Vehicle"
        size="lg"
      >
        <VehicleForm
          onSubmit={handleCreateVehicle}
          onCancel={() => setShowCreateModal(false)}
          loading={formLoading}
          error={formError}
        />
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Vehicle"
        size="lg"
      >
        <VehicleForm
          vehicle={selectedVehicle}
          onSubmit={handleEditVehicle}
          onCancel={() => setShowEditModal(false)}
          loading={formLoading}
          error={formError}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Vehicle"
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700 dark:text-red-300">{formError}</p>
              </div>
            </div>
          )}
          
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this vehicle? This action cannot be undone.
          </p>
          
          {selectedVehicle && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Plate: {selectedVehicle.plate_no}
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteVehicle}
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Vehicle'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VehicleList;