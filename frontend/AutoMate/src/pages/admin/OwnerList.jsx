import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useOwners } from '../../hooks/useOwners';
import { useVehicles } from '../../hooks/useVehicles';
import { useSearch } from '../../hooks/useSearch';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import OwnerForm from '../../components/forms/OwnerForm';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Car,
  Phone,
  X,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

/**
 * Owner List page for admin role
 */
const OwnerList = () => {
  const {
    owners,
    loading,
    error,
    fetchOwners,
    createOwner,
    updateOwner,
    deleteOwner
  } = useOwners();
  const { vehicles, fetchVehicles } = useVehicles();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Search and filtering
  const searchFields = ['name', 'contact'];
  const [vehicleCountFilter, setVehicleCountFilter] = useState('');

  // Pre-filter owners based on vehicle count
  const preFilteredOwners = useMemo(() => {
    if (!vehicleCountFilter) return owners;

    return owners.filter(owner => {
      const vehicleCount = getOwnerVehicleCount(owner.owner_id);
      if (vehicleCountFilter === 'has_vehicles') {
        return vehicleCount > 0;
      }
      if (vehicleCountFilter === 'no_vehicles') {
        return vehicleCount === 0;
      }
      return true;
    });
  }, [owners, vehicles, vehicleCountFilter]);

  const {
    data: paginatedOwners,
    searchTerm,
    updateSearchTerm,
    filters,
    updateFilter,
    clearFilters: baseClearFilters,
    sortConfig,
    updateSort,
    paginationInfo,
    changePage,
    hasActiveFilters,
    isEmpty
  } = useSearch(preFilteredOwners, searchFields, { itemsPerPage: 12 });

  const handleFilterChange = (key, value) => {
    if (key === 'vehicle_count_filter') {
      setVehicleCountFilter(value);
    } else {
      updateFilter(key, value);
    }
  };

  const clearFilters = () => {
    setVehicleCountFilter('');
    baseClearFilters();
  };

  // Load data on component mount
  useEffect(() => {
    fetchOwners();
    fetchVehicles();
  }, [fetchOwners, fetchVehicles]);

  const handleCreateOwner = async (ownerData) => {
    setFormLoading(true);
    setFormError(null);
    try {
      await createOwner(ownerData);
      setShowCreateModal(false);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditOwner = async (ownerData) => {
    setFormLoading(true);
    setFormError(null);
    try {
      await updateOwner(selectedOwner.owner_id, ownerData);
      setShowEditModal(false);
      setSelectedOwner(null);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteOwner = async () => {
    setFormLoading(true);
    setFormError(null);
    try {
      await deleteOwner(selectedOwner.owner_id);
      setShowDeleteModal(false);
      setSelectedOwner(null);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (owner) => {
    setSelectedOwner(owner);
    setShowEditModal(true);
    setFormError(null);
  };

  const openDeleteModal = (owner) => {
    setSelectedOwner(owner);
    setShowDeleteModal(true);
    setFormError(null);
  };

  const getOwnerVehicleCount = (ownerId) => {
    return vehicles.filter(vehicle => vehicle.owner_id === ownerId).length;
  };

  const getOwnerVehicles = (ownerId) => {
    return vehicles.filter(vehicle => vehicle.owner_id === ownerId);
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ?
      <ArrowUp className="h-4 w-4" /> :
      <ArrowDown className="h-4 w-4" />;
  };

  const contactFilterOptions = [
    { value: '', label: 'All Owners' },
    { value: 'has_contact', label: 'Has Contact Info' },
    { value: 'no_contact', label: 'No Contact Info' }
  ];

  const vehicleCountFilterOptions = [
    { value: '', label: 'All Vehicle Counts' },
    { value: 'has_vehicles', label: 'Has Vehicles' },
    { value: 'no_vehicles', label: 'No Vehicles' }
  ];

  if (loading && owners.length === 0) {
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Owner Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage vehicle owners and their information
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Owner
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by name or contact..."
                value={searchTerm}
                onChange={(e) => updateSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Contact Filter */}
          <div>
            <Select
              value={filters.contact_filter || ''}
              onChange={(e) => handleFilterChange('contact_filter', e.target.value)}
              options={contactFilterOptions}
            />
          </div>

          {/* Vehicle Count Filter */}
          <div>
            <Select
              value={filters.vehicle_count_filter || ''}
              onChange={(e) => handleFilterChange('vehicle_count_filter', e.target.value)}
              options={vehicleCountFilterOptions}
            />
          </div>
        </div>

        {/* Active Filters */}
        {(hasActiveFilters || vehicleCountFilter) && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {paginationInfo.totalItems} of {owners.length} owners
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Owner Cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {isEmpty ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {(hasActiveFilters || vehicleCountFilter) ? 'No owners found' : 'No owners registered'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {(hasActiveFilters || vehicleCountFilter) ?
                'Try adjusting your search or filters' :
                'Get started by adding your first owner'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedOwners.map((owner) => {
                const vehicleCount = getOwnerVehicleCount(owner.owner_id);
                const ownerVehicles = getOwnerVehicles(owner.owner_id);

                return (
                  <div
                    key={owner.owner_id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    {/* Owner Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {owner.name}
                        </h3>
                        {owner.contact && (
                          <div className="flex items-center mt-1 text-gray-600 dark:text-gray-400">
                            <Phone className="h-4 w-4 mr-1" />
                            <span className="text-sm">{owner.contact}</span>
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${vehicleCount > 0
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
                        }`}>
                        {vehicleCount} {vehicleCount === 1 ? 'Vehicle' : 'Vehicles'}
                      </span>
                    </div>

                    {/* Vehicle List */}
                    {vehicleCount > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Vehicles:
                        </h4>
                        <div className="space-y-1">
                          {ownerVehicles.slice(0, 3).map((vehicle) => (
                            <div key={vehicle.vehicle_id} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <Car className="h-3 w-3 mr-2" />
                              <span>
                                {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.plate_no})
                              </span>
                            </div>
                          ))}
                          {vehicleCount > 3 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 ml-5">
                              +{vehicleCount - 3} more vehicles
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Owner Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Owner ID:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          #{owner.owner_id}
                        </span>
                      </div>
                      {!owner.contact && (
                        <div className="text-sm text-yellow-600 dark:text-yellow-400">
                          No contact information
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/admin/owners/${owner.owner_id}`}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                      <button
                        onClick={() => openEditModal(owner)}
                        className="flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(owner)}
                        className="flex items-center justify-center px-3 py-2 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-6">
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
      {owners.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Owner Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {owners.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Owners</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {owners.filter(o => getOwnerVehicleCount(o.owner_id) > 0).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">With Vehicles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {owners.filter(o => !o.contact).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">No Contact Info</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {vehicles.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Vehicles</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Owner Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Owner"
      >
        <OwnerForm
          onSubmit={handleCreateOwner}
          onCancel={() => setShowCreateModal(false)}
          loading={formLoading}
          error={formError}
        />
      </Modal>

      {/* Edit Owner Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Owner"
      >
        <OwnerForm
          owner={selectedOwner}
          onSubmit={handleEditOwner}
          onCancel={() => setShowEditModal(false)}
          loading={formLoading}
          error={formError}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Owner"
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
            Are you sure you want to delete this owner? This action cannot be undone.
          </p>

          {selectedOwner && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedOwner.name}
              </p>
              {selectedOwner.contact && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contact: {selectedOwner.contact}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vehicles: {getOwnerVehicleCount(selectedOwner.owner_id)}
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
              onClick={handleDeleteOwner}
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Owner'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OwnerList;