import { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Filter,
    Calendar,
    Car,
    User,
    DollarSign,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import MaintenanceForm from '../../components/forms/MaintenanceForm';
import { useMaintenance } from '../../hooks/useMaintenance';
import { useSearch } from '../../hooks/useSearch';
import { formatDate } from '../../utils/dateUtils';
import { formatInvoiceDescription } from '../../utils/invoiceUtils';

/**
 * MaintenanceManagement page for admin CRUD operations on maintenance logs
 */
const MaintenanceManagement = () => {
    const {
        maintenanceLogs,
        loading,
        error,
        fetchMaintenanceLogs,
        updateMaintenanceLog,
        deleteMaintenanceLog,
        createMaintenanceLog
    } = useMaintenance();

    const [selectedLog, setSelectedLog] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'view', 'edit', 'create', 'delete'
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Search functionality
    const { searchTerm, setSearchTerm, filteredData } = useSearch(
        maintenanceLogs || [],
        ['vehicle_make', 'vehicle_model', 'vehicle_license_plate', 'plate_no', 'description', 'user_name']
    );

    // Load maintenance logs on component mount
    useEffect(() => {
        fetchMaintenanceLogs();
    }, [fetchMaintenanceLogs]);

    // Filter logs by payment status
    const getFilteredLogs = () => {
        let filtered = filteredData;

        if (filterStatus !== 'all') {
            filtered = filtered.filter(log => {
                if (filterStatus === 'paid') return !!log.paid_at;
                if (filterStatus === 'unpaid') return !log.paid_at;
                return true;
            });
        }

        return filtered;
    };

    // Pagination
    const paginatedLogs = () => {
        const filtered = getFilteredLogs();
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filtered.slice(startIndex, startIndex + itemsPerPage);
    };

    const totalPages = Math.ceil(getFilteredLogs().length / itemsPerPage);

    // Modal handlers
    const handleView = (log) => {
        setSelectedLog(log);
        setModalType('view');
        setShowModal(true);
    };

    const handleEdit = (log) => {
        setSelectedLog(log);
        setModalType('edit');
        setShowModal(true);
    };

    const handleCreate = () => {
        setSelectedLog(null);
        setModalType('create');
        setShowModal(true);
    };

    const handleDelete = (log) => {
        setSelectedLog(log);
        setModalType('delete');
        setShowModal(true);
    };

    const confirmDelete = async () => {
        if (selectedLog) {
            await deleteMaintenanceLog(selectedLog.log_id || selectedLog.id);
            setShowModal(false);
            setSelectedLog(null);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (modalType === 'create') {
                await createMaintenanceLog(formData);
            } else if (modalType === 'edit') {
                await updateMaintenanceLog(selectedLog.log_id || selectedLog.id, formData);
            }
            setShowModal(false);
            setSelectedLog(null);
        } catch (error) {
            console.error('Error saving maintenance log:', error);
        }
    };

    const getStatusIcon = (isPaid) => {
        return isPaid ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
            <XCircle className="w-5 h-5 text-red-500" />
        );
    };

    const getStatusText = (isPaid) => {
        return isPaid ? 'Paid' : 'Unpaid';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <p className="mt-2 text-sm text-red-700">{error}</p>
                    </div>
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
                    Maintenance Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage and track all maintenance logs
                </p>
                </div>
                <Button onClick={handleCreate} className="flex items-center gap-2 self-start sm:self-auto">
                <Plus className="w-4 h-4" />
                Add Maintenance Log
                </Button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Input
                    type="text"
                    placeholder="Search by vehicle, service, or mechanic..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={Search}
                    />
                </div>
                <div className="sm:w-48">
                    <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    options={[
                        { value: 'all', label: 'All Status', key: 'status-all' },
                        { value: 'paid', label: 'Paid', key: 'status-paid' },
                        { value: 'unpaid', label: 'Unpaid', key: 'status-unpaid' },
                    ]}
                    icon={Filter}
                    />
                </div>
                </div>
            </div>

            {/* Maintenance Logs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        {[
                        'Vehicle',
                        'Service',
                        'Mechanic',
                        'Date',
                        'Cost',
                        'Status',
                        'Actions',
                        ].map((header) => (
                        <th
                            key={header}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                            {header}
                        </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedLogs().map((log, index) => (
                        <tr key={log.log_id || log.id || `log-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {/* Vehicle */}
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                            <Car className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {log.vehicle_make && log.vehicle_model
                                    ? `${log.vehicle_make} ${log.vehicle_model}`
                                    : `Vehicle ID: ${log.vehicle_id || 'N/A'}`}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                {log.vehicle_license_plate || log.plate_no || 'No plate available'}
                                </div>
                            </div>
                            </div>
                        </td>

                        {/* Service */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatInvoiceDescription(log.description)}
                        </td>

                        {/* Mechanic */}
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-white">
                                {log.user_name || 'Unknown mechanic'}
                            </span>
                            </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-white">
                                {formatDate(log.created_at)}
                            </span>
                            </div>
                        </td>

                        {/* Cost */}
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900 dark:text-white">
                                ${parseFloat(log.cost || 0).toFixed(2)}
                            </span>
                            </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                            {getStatusIcon(!!log.paid_at)}
                            <span className={`ml-2 text-sm ${log.paid_at ? 'text-green-600' : 'text-red-600'}`}>
                                {getStatusText(!!log.paid_at)}
                            </span>
                            </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                            <button onClick={() => handleView(log)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEdit(log)} className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(log)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                <Trash2 className="w-4 h-4" />
                            </button>
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedLogs().map((log, index) => (
                    <div key={log.log_id || log.id || `mobile-log-${index}`} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-900 dark:text-white">
                        {log.vehicle_make && log.vehicle_model
                            ? `${log.vehicle_make} ${log.vehicle_model}`
                            : `Vehicle ID: ${log.vehicle_id || 'N/A'}`}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${log.paid_at ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                        {getStatusText(!!log.paid_at)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {log.vehicle_license_plate || log.plate_no || 'No plate available'}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Service:</strong> {formatInvoiceDescription(log.description)}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Mechanic:</strong> {log.user_name || 'Unknown mechanic'}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Date:</strong> {formatDate(log.created_at)}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Cost:</strong> ${parseFloat(log.cost || 0).toFixed(2)}
                    </p>
                    <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <button onClick={() => handleView(log)} className="text-blue-600 dark:text-blue-400">
                        <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(log)} className="text-yellow-600 dark:text-yellow-400">
                        <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(log)} className="text-red-600 dark:text-red-400">
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    </div>
                ))}

                {paginatedLogs().length === 0 && (
                    <div className="text-center py-12">
                    <Car className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        No maintenance logs found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm || filterStatus !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Get started by creating a new maintenance log'}
                    </p>
                    </div>
                )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    />
                </div>
                )}
            </div>



            {/* Modals */}
            {showModal && (
                <>
                    {/* View Modal */}
                    {modalType === 'view' && selectedLog && (
                        <Modal
                            isOpen={showModal}
                            onClose={() => setShowModal(false)}
                            title="Maintenance Log Details"
                        >
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Vehicle
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {selectedLog.vehicle_make && selectedLog.vehicle_model ?
                                                `${selectedLog.vehicle_make} ${selectedLog.vehicle_model} (${selectedLog.vehicle_license_plate || selectedLog.plate_no || 'N/A'})` :
                                                `Vehicle ID: ${selectedLog.vehicle_id || 'N/A'}`
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Service
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {formatInvoiceDescription(selectedLog.description)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Mechanic
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {selectedLog.user_name || 'Unknown mechanic'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Date
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {formatDate(selectedLog.created_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Cost
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            ${selectedLog.cost}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Payment Status
                                        </label>
                                        <p className={`mt-1 text-sm ${selectedLog.paid_at ? 'text-green-600' : 'text-red-600'}`}>
                                            {getStatusText(!!selectedLog.paid_at)}
                                        </p>
                                    </div>
                                </div>
                                {selectedLog.notes && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Notes
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {selectedLog.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Modal>
                    )}

                    {/* Create/Edit Modal */}
                    {(modalType === 'create' || modalType === 'edit') && (
                        <Modal
                            isOpen={showModal}
                            onClose={() => setShowModal(false)}
                            title={modalType === 'create' ? 'Create Maintenance Log' : 'Edit Maintenance Log'}
                        >
                            <MaintenanceForm
                                initialData={selectedLog}
                                onSubmit={handleFormSubmit}
                                onCancel={() => setShowModal(false)}
                            />
                        </Modal>
                    )}

                    {/* Delete Confirmation Modal */}
                    {modalType === 'delete' && selectedLog && (
                        <Modal
                            isOpen={showModal}
                            onClose={() => setShowModal(false)}
                            title="Confirm Delete"
                        >
                            <div className="space-y-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Are you sure you want to delete this maintenance log? This action cannot be undone.
                                </p>
                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {selectedLog.vehicle_make && selectedLog.vehicle_model ?
                                            `${selectedLog.vehicle_make} ${selectedLog.vehicle_model}` :
                                            `Vehicle ID: ${selectedLog.vehicle_id}`
                                        } - {formatInvoiceDescription(selectedLog.description)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {formatDate(selectedLog.created_at)}
                                    </p>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={confirmDelete}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </Modal>
                    )}
                </>
            )}
        </div>
    );
};

export default MaintenanceManagement;