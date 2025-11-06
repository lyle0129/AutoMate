import { useState, useEffect, useMemo } from 'react';
import { useMaintenance } from '../../hooks/useMaintenance';
import { useVehicles } from '../../hooks/useVehicles';
import { useOwners } from '../../hooks/useOwners';
import { parseDate, formatDate, formatDateShort } from '../../utils/dateUtils';
import { formatInvoiceDescription, getServicesBreakdown } from '../../utils/invoiceUtils';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import {
    BarChart3,
    Calendar,
    User,
    DollarSign,
    Wrench,
    FileText,
    Download,
    Filter,
    TrendingUp,
    Car,
    Clock
} from 'lucide-react';

/**
 * Reports page for admin with filtering and analytics
 */
const Reports = () => {
    const { fetchMaintenanceLogs, loading: maintenanceLoading, error: maintenanceError } = useMaintenance();
    const { vehicles, fetchVehicles, loading: vehiclesLoading } = useVehicles();
    const { owners, fetchOwners, loading: ownersLoading } = useOwners();

    const [maintenanceLogs, setMaintenanceLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);

    // Filter states
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        technician: '',
        vehicleId: '',
        ownerId: '',
        serviceType: '',
        paymentStatus: 'all'
    });

    // Load all data
    useEffect(() => {
        const loadData = async () => {
            try {
                const maintenanceData = await fetchMaintenanceLogs();
                await fetchVehicles();
                await fetchOwners();

                console.log('Loaded data - Maintenance:', maintenanceData?.length, 'Vehicles:', vehicles.length, 'Owners:', owners.length);
                setMaintenanceLogs(maintenanceData || []);
            } catch (error) {
                console.error('Error loading reports data:', error);
            }
        };

        loadData();
    }, [fetchMaintenanceLogs, fetchVehicles, fetchOwners]);

    // Get unique technicians from maintenance logs
    const technicians = useMemo(() => {
        console.log('Processing technicians from logs:', maintenanceLogs.length);
        const uniqueTechnicians = [...new Set(
            maintenanceLogs
                .map(log => log.user_name)
                .filter(name => name)
        )].sort();
        console.log('Found technicians:', uniqueTechnicians);
        return uniqueTechnicians;
    }, [maintenanceLogs]);

    // Get unique service types
    const serviceTypes = useMemo(() => {
        const allServices = maintenanceLogs
            .map(log => {
                const services = getServicesBreakdown(log.description);
                // If no services from breakdown, try to extract from string description
                if (services.length === 0 && typeof log.description === 'string') {
                    // Simple extraction - split by common delimiters and clean up
                    return log.description.split(/[,;]/).map(s => s.trim()).filter(s => s);
                }
                return services.map(service => service.service_name || service);
            })
            .flat()
            .filter(service => service && service.length > 0);

        const uniqueServices = [...new Set(allServices)].sort();
        console.log('Found service types:', uniqueServices);
        return uniqueServices;
    }, [maintenanceLogs]);

    // Apply filters
    useEffect(() => {

        let filtered = [...maintenanceLogs];

        // Date range filter
        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            filtered = filtered.filter(log => {
                const logDate = parseDate(log.created_at);
                return logDate && logDate >= startDate;
            });
        }

        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999); // Include the entire end date
            filtered = filtered.filter(log => {
                const logDate = parseDate(log.created_at);
                return logDate && logDate <= endDate;
            });
        }

        // Technician filter
        if (filters.technician) {
            filtered = filtered.filter(log => log.user_name === filters.technician);
        }

        // Vehicle filter
        if (filters.vehicleId) {
            filtered = filtered.filter(log => log.vehicle_id === filters.vehicleId);
        }

        // Owner filter
        if (filters.ownerId) {
            const ownerVehicles = vehicles.filter(v => v.owner_id === filters.ownerId);
            const ownerVehicleIds = ownerVehicles.map(v => v.vehicle_id);
            filtered = filtered.filter(log => ownerVehicleIds.includes(log.vehicle_id));
        }

        // Service type filter
        if (filters.serviceType) {
            filtered = filtered.filter(log => {
                const services = getServicesBreakdown(log.description);
                let serviceNames = services.map(service => service.service_name || service);

                // If no services from breakdown, try string description
                if (serviceNames.length === 0 && typeof log.description === 'string') {
                    serviceNames = log.description.split(/[,;]/).map(s => s.trim()).filter(s => s);
                }


                return serviceNames.includes(filters.serviceType);
            });
        }

        // Payment status filter
        if (filters.paymentStatus !== 'all') {
            if (filters.paymentStatus === 'paid') {
                filtered = filtered.filter(log => log.paid_at);
            } else if (filters.paymentStatus === 'unpaid') {
                filtered = filtered.filter(log => !log.paid_at);
            }
        }


        setFilteredLogs(filtered);
    }, [maintenanceLogs, vehicles, filters]);

    // Calculate summary statistics
    const summary = useMemo(() => {
        const totalRecords = filteredLogs.length;
        const totalRevenue = filteredLogs.reduce((sum, log) => sum + (parseFloat(log.cost) || 0), 0);
        const paidRevenue = filteredLogs
            .filter(log => log.paid_at)
            .reduce((sum, log) => sum + (parseFloat(log.cost) || 0), 0);
        const unpaidRevenue = totalRevenue - paidRevenue;

        const uniqueVehicles = new Set(filteredLogs.map(log => log.vehicle_id)).size;
        const uniqueOwners = new Set(
            filteredLogs.map(log => {
                const vehicle = vehicles.find(v => v.vehicle_id === log.vehicle_id);
                return vehicle?.owner_id;
            }).filter(id => id)
        ).size;

        // Technician performance
        const technicianStats = {};
        filteredLogs.forEach(log => {
            if (!technicianStats[log.user_name]) {
                technicianStats[log.user_name] = {
                    count: 0,
                    revenue: 0
                };
            }
            technicianStats[log.user_name].count++;
            technicianStats[log.user_name].revenue += parseFloat(log.cost) || 0;
        });

        // Service type breakdown
        const serviceStats = {};
        filteredLogs.forEach(log => {
            const services = getServicesBreakdown(log.description);

            if (services.length > 0) {
                // Use individual service prices from the services array
                services.forEach(service => {
                    const serviceName = service.service_name || service;
                    const servicePrice = parseFloat(service.price) || 0;

                    if (!serviceStats[serviceName]) {
                        serviceStats[serviceName] = {
                            count: 0,
                            revenue: 0
                        };
                    }
                    serviceStats[serviceName].count++;
                    serviceStats[serviceName].revenue += servicePrice;
                });
            } else if (typeof log.description === 'string') {
                // Fallback for string descriptions - split total cost evenly
                const serviceNames = log.description.split(/[,;]/).map(s => s.trim()).filter(s => s);
                const totalCost = parseFloat(log.cost) || 0;
                const costPerService = serviceNames.length > 0 ? totalCost / serviceNames.length : 0;

                serviceNames.forEach(serviceName => {
                    if (!serviceStats[serviceName]) {
                        serviceStats[serviceName] = {
                            count: 0,
                            revenue: 0
                        };
                    }
                    serviceStats[serviceName].count++;
                    serviceStats[serviceName].revenue += costPerService;
                });
            }
        });

        return {
            totalRecords,
            totalRevenue,
            paidRevenue,
            unpaidRevenue,
            uniqueVehicles,
            uniqueOwners,
            technicianStats,
            serviceStats
        };
    }, [filteredLogs, vehicles]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            technician: '',
            vehicleId: '',
            ownerId: '',
            serviceType: '',
            paymentStatus: 'all'
        });
    };

    const exportToCSV = () => {
        const headers = [
            'Date',
            'Technician',
            'Vehicle',
            'Owner',
            'Service Description',
            'Cost',
            'Payment Status',
            'Paid Date'
        ];

        const csvData = filteredLogs.map(log => {
            const vehicle = vehicles.find(v => v.vehicle_id === log.vehicle_id);
            const owner = owners.find(o => o.owner_id === vehicle?.owner_id);
            const logDate = parseDate(log.created_at);
            const paidDate = log.paid_at ? parseDate(log.paid_at) : null;

            return [
                logDate ? formatDate(logDate) : 'Invalid Date',
                log.user_name || 'Unknown',
                vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.plate_no})` : 'Unknown Vehicle',
                owner?.name || 'Unknown Owner',
                formatInvoiceDescription(log.description),
                `$${parseFloat(log.cost || 0).toFixed(2)}`,
                log.paid_at ? 'Paid' : 'Unpaid',
                paidDate ? formatDate(paidDate) : ''
            ];
        });

        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `maintenance_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    if (maintenanceLoading || vehiclesLoading || ownersLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">Loading reports data...</p>
                </div>
            </div>
        );
    }

    // Don't render until we have some data
    if (maintenanceLogs.length === 0 && !maintenanceLoading) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">No maintenance data available for reports.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Reports & Analytics
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Maintenance logs analysis and business insights
                    </p>
                </div>
                <Button
                    onClick={exportToCSV}
                    className="flex items-center"
                    disabled={filteredLogs.length === 0}
                >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                    <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start Date
                        </label>
                        <Input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            End Date
                        </label>
                        <Input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Technician
                        </label>
                        <Select
                            value={filters.technician}
                            onChange={(e) => handleFilterChange('technician', e.target.value)}
                            placeholder="All Technicians"
                            options={technicians.map(tech => ({
                                value: tech,
                                label: tech
                            }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Payment Status
                        </label>
                        <Select
                            value={filters.paymentStatus}
                            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                            placeholder="All Status"
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'paid', label: 'Paid' },
                                { value: 'unpaid', label: 'Unpaid' }
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Vehicle
                        </label>
                        <Select
                            value={filters.vehicleId}
                            onChange={(e) => handleFilterChange('vehicleId', e.target.value)}
                            placeholder="All Vehicles"
                            options={vehicles.map(vehicle => ({
                                value: vehicle.vehicle_id,
                                label: `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.plate_no})`
                            }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Owner
                        </label>
                        <Select
                            value={filters.ownerId}
                            onChange={(e) => handleFilterChange('ownerId', e.target.value)}
                            placeholder="All Owners"
                            options={owners.map(owner => ({
                                value: owner.owner_id,
                                label: owner.name
                            }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Service Type
                        </label>
                        <Select
                            value={filters.serviceType}
                            onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                            placeholder="All Services"
                            options={serviceTypes.map(service => ({
                                value: service,
                                label: service
                            }))}
                        />
                    </div>

                    <div className="flex items-end">
                        <Button
                            onClick={clearFilters}
                            variant="outline"
                            className="w-full"
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {filteredLogs.length} of {maintenanceLogs.length} maintenance records
                    <br />
                    Debug: {technicians.length} technicians, {vehicles.length} vehicles, {owners.length} owners, {serviceTypes.length} service types
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {summary.totalRecords}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${summary.totalRevenue.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <Car className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Vehicles</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {summary.uniqueVehicles}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <User className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Owners</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {summary.uniqueOwners}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Revenue Breakdown
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Paid Revenue</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                ${summary.paidRevenue.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Unpaid Revenue</span>
                            <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                                ${summary.unpaidRevenue.toFixed(2)}
                            </span>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-900 dark:text-white">Total Revenue</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    ${summary.totalRevenue.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Payment Status
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Paid Records</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                {filteredLogs.filter(log => log.paid_at).length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Unpaid Records</span>
                            <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                                {filteredLogs.filter(log => !log.paid_at).length}
                            </span>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-900 dark:text-white">Payment Rate</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {summary.totalRecords > 0
                                        ? ((filteredLogs.filter(log => log.paid_at).length / summary.totalRecords) * 100).toFixed(1)
                                        : 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Technician Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Technician Performance
                </h3>
                {Object.keys(summary.technicianStats).length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No technician data available</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Technician
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Jobs Completed
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Revenue Generated
                                    </th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Avg. Job Value
                                    </th> */}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {Object.entries(summary.technicianStats)
                                    .sort(([, a], [, b]) => b.revenue - a.revenue)
                                    .map(([technician, stats]) => (
                                        <tr key={technician}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {technician}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {stats.count}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                ${stats.revenue.toFixed(2)}
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                ${(stats.revenue / stats.count).toFixed(2)}
                                            </td> */}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Service Type Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Service Type Analysis
                </h3>
                {Object.keys(summary.serviceStats).length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No service data available</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Service Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Frequency
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Avg. Cost
                                    </th> */}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {Object.entries(summary.serviceStats)
                                    .sort(([, a], [, b]) => b.count - a.count)
                                    .map(([service, stats]) => (
                                        <tr key={service}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {service}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {stats.count}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                ${stats.revenue.toFixed(2)}
                                            </td>
                                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                ${(stats.revenue / stats.count).toFixed(2)}
                                            </td> */}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;