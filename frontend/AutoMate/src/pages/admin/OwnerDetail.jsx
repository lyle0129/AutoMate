import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOwners } from '../../hooks/useOwners';
import { useVehicles } from '../../hooks/useVehicles';
import { useMaintenance } from '../../hooks/useMaintenance';
import { parseDate, formatDate, daysBetween } from '../../utils/dateUtils';
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    Car,
    Calendar,
    Wrench,
    DollarSign,
    AlertTriangle,
    Eye,
    Edit,
    Plus
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import OwnerForm from '../../components/forms/OwnerForm';

/**
 * Owner Detail page showing owner information and all their vehicles
 */
const OwnerDetail = () => {
    const { ownerId } = useParams();
    const { getOwnerById, updateOwner, loading: ownerLoading, error: ownerError } = useOwners();
    const { vehicles, fetchVehicles, loading: vehiclesLoading } = useVehicles();
    const { fetchMaintenanceLogs, loading: maintenanceLoading } = useMaintenance();

    const [owner, setOwner] = useState(null);
    const [ownerVehicles, setOwnerVehicles] = useState([]);
    const [maintenanceLogs, setMaintenanceLogs] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [stats, setStats] = useState({
        totalVehicles: 0,
        totalMaintenanceRecords: 0,
        totalSpent: 0,
        lastServiceDate: null
    });

    // Load owner data
    useEffect(() => {
        const loadOwnerData = async () => {
            if (!ownerId) return;

            try {
                const ownerData = await getOwnerById(ownerId);
                setOwner(ownerData);
            } catch (error) {
                console.error('Error loading owner data:', error);
            }
        };

        loadOwnerData();
    }, [ownerId, getOwnerById]);

    // Load vehicles and maintenance data
    useEffect(() => {
        const loadVehicleData = async () => {
            try {
                await fetchVehicles();
                const maintenanceData = await fetchMaintenanceLogs();
                setMaintenanceLogs(maintenanceData || []);
            } catch (error) {
                console.error('Error loading vehicle data:', error);
            }
        };

        loadVehicleData();
    }, [fetchVehicles, fetchMaintenanceLogs]);

    // Filter vehicles for this owner
    useEffect(() => {
        if (owner && vehicles.length > 0) {
            const filteredVehicles = vehicles.filter(vehicle => vehicle.owner_id === owner.owner_id);
            setOwnerVehicles(filteredVehicles);
        }
    }, [owner, vehicles]);

    // Calculate statistics
    useEffect(() => {
        if (ownerVehicles.length > 0 && maintenanceLogs.length > 0) {
            const vehicleIds = ownerVehicles.map(v => v.vehicle_id);
            const ownerMaintenanceLogs = maintenanceLogs.filter(log =>
                vehicleIds.includes(log.vehicle_id)
            );

            const totalSpent = ownerMaintenanceLogs.reduce((sum, log) =>
                sum + (parseFloat(log.cost) || 0), 0
            );

            const lastService = ownerMaintenanceLogs
                .map(log => parseDate(log.created_at))
                .filter(date => date)
                .sort((a, b) => b - a)[0];

            setStats({
                totalVehicles: ownerVehicles.length,
                totalMaintenanceRecords: ownerMaintenanceLogs.length,
                totalSpent,
                lastServiceDate: lastService
            });
        }
    }, [ownerVehicles, maintenanceLogs]);

    const handleEditOwner = async (ownerData) => {
        try {
            await updateOwner(owner.owner_id, ownerData);
            setOwner({ ...owner, ...ownerData });
            setShowEditModal(false);
        } catch (error) {
            console.error('Error updating owner:', error);
        }
    };

    const getVehicleStatus = (vehicle) => {
        const vehicleLogs = maintenanceLogs.filter(log => log.vehicle_id === vehicle.vehicle_id);
        if (vehicleLogs.length === 0) return { status: 'No Service History', color: 'gray' };

        const lastService = vehicleLogs
            .map(log => parseDate(log.created_at))
            .filter(date => date)
            .sort((a, b) => b - a)[0];

        if (!lastService) return { status: 'No Service History', color: 'gray' };

        const daysSince = daysBetween(lastService);
        if (daysSince <= 30) return { status: 'Recently Serviced', color: 'green' };
        if (daysSince <= 90) return { status: 'Good Condition', color: 'blue' };
        if (daysSince <= 180) return { status: 'Service Due Soon', color: 'yellow' };
        return { status: 'Service Overdue', color: 'red' };
    };

    if (ownerLoading || vehiclesLoading || maintenanceLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (ownerError || !owner) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 dark:text-red-400 text-lg">
                        {ownerError || 'Owner not found'}
                    </p>
                    <Link
                        to="/admin/owners"
                        className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Owners
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        to="/admin/owners"
                        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Owners
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {owner.user_name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Owner Details and Vehicle Management
                    </p>
                </div>
                <Button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center"
                >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Owner
                </Button>
            </div>

            {/* Owner Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                        <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Owner Information
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Personal details and contact information
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                            <p className="font-medium text-gray-900 dark:text-white">{owner.user_name}</p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                            <p className="font-medium text-gray-900 dark:text-white">{owner.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {owner.phone_number || 'Not provided'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {owner.address || 'Not provided'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <Car className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Vehicles</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.totalVehicles}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <Wrench className="h-8 w-8 text-green-600 dark:text-green-400" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Service Records</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.totalMaintenanceRecords}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${stats.totalSpent.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Service</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats.lastServiceDate ? formatDate(stats.lastServiceDate) : 'Never'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Owner's Vehicles */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Car className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Owner's Vehicles
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                All vehicles registered to this owner
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/admin/vehicles"
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vehicle
                    </Link>
                </div>

                {ownerVehicles.length === 0 ? (
                    <div className="text-center py-12">
                        <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No vehicles registered
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            This owner doesn't have any vehicles registered yet.
                        </p>
                        <Link
                            to="/admin/vehicles"
                            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Register First Vehicle
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ownerVehicles.map((vehicle) => {
                            const vehicleStatus = getVehicleStatus(vehicle);
                            const vehicleLogs = maintenanceLogs.filter(log => log.vehicle_id === vehicle.vehicle_id);
                            const totalSpent = vehicleLogs.reduce((sum, log) => sum + (parseFloat(log.cost) || 0), 0);

                            return (
                                <div key={vehicle.vehicle_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            {vehicle.year} {vehicle.make} {vehicle.model}
                                        </h3>
                                        <span className={`px-2 py-1 text-xs rounded-full ${vehicleStatus.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                            vehicleStatus.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                                                vehicleStatus.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                                    vehicleStatus.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                                        'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
                                            }`}>
                                            {vehicleStatus.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        <p>Plate: {vehicle.plate_no}</p>
                                        <p>Type: {vehicle.vehicle_type}</p>
                                        <p>Service Records: {vehicleLogs.length}</p>
                                        <p>Total Spent: ${totalSpent.toFixed(2)}</p>
                                    </div>

                                    <Link
                                        to={`/admin/vehicles/${vehicle.vehicle_id}`}
                                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Edit Owner Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Owner"
            >
                <OwnerForm
                    owner={owner}
                    onSubmit={handleEditOwner}
                    onCancel={() => setShowEditModal(false)}
                />
            </Modal>
        </div>
    );
};

export default OwnerDetail;