import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useVehicles } from '../../hooks/useVehicles';
import { useMaintenance } from '../../hooks/useMaintenance';
import { parseDate, formatDate, formatDateShort, daysBetween, daysAgo } from '../../utils/dateUtils';
import { printInvoice, formatInvoiceDescription } from '../../utils/invoiceUtils';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

/**
 * Customer Invoice List component showing all invoices for customer-owned vehicles
 */
const InvoiceList = () => {
  const [searchParams] = useSearchParams();
  const { vehicles, loading: vehiclesLoading, fetchVehicles } = useVehicles();
  const { 
    getPaidMaintenanceLogs, 
    getUnpaidMaintenanceLogs,
    loading: maintenanceLoading, 
    error: maintenanceError 
  } = useMaintenance();
  
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load data on component mount
  useEffect(() => {
    const loadInvoiceData = async () => {
      try {
        await fetchVehicles();
        
        // Fetch both paid and unpaid maintenance logs (which serve as invoices)
        const [paidData, unpaidData] = await Promise.all([
          getPaidMaintenanceLogs(),
          getUnpaidMaintenanceLogs()
        ]);
        
        const allInvoices = [
          ...(paidData.paid_maintenance_logs || []),
          ...(unpaidData.unpaid_maintenance_logs || [])
        ].filter(log => log.cost); // Only include logs with cost (invoiceable items)
        
        setInvoices(allInvoices);
        
        // Check if we need to highlight a specific log from URL params
        const highlightLogId = searchParams.get('log');
        if (highlightLogId) {
          // Scroll to and highlight the specific invoice
          setTimeout(() => {
            const element = document.getElementById(`invoice-${highlightLogId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
              element.classList.add('ring-2', 'ring-blue-500');
            }
          }, 100);
        }
        
      } catch (error) {
        console.error('Error loading invoice data:', error);
      }
    };

    loadInvoiceData();
  }, [fetchVehicles, getPaidMaintenanceLogs, getUnpaidMaintenanceLogs, searchParams]);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...invoices];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice => {
        const vehicle = vehicles.find(v => v.vehicle_id === invoice.vehicle_id);
        const description = typeof invoice.description === 'string' ? invoice.description : 
                           typeof invoice.description === 'object' && invoice.description?.custom_description ? 
                           invoice.description.custom_description : '';
        return (
          (description && description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          invoice.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (vehicle && (
            vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.plate_no.toLowerCase().includes(searchTerm.toLowerCase())
          )) ||
          invoice.cost.toString().includes(searchTerm)
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => {
        if (statusFilter === 'paid') return invoice.paid_at;
        if (statusFilter === 'unpaid') return !invoice.paid_at;
        return true;
      });
    }

    // Date filter
    if (dateFilter !== 'all') {
      let filterDays;
      
      switch (dateFilter) {
        case 'week':
          filterDays = 7;
          break;
        case 'month':
          filterDays = 30;
          break;
        case 'quarter':
          filterDays = 90;
          break;
        case 'year':
          filterDays = 365;
          break;
        default:
          filterDays = null;
          break;
      }
      
      if (filterDays) {
        filtered = filtered.filter(invoice => {
          const invoiceDate = parseDate(invoice.created_at);
          if (!invoiceDate) return false;
          const daysOld = daysBetween(invoiceDate);
          return daysOld !== null && daysOld <= filterDays;
        });
      }
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = parseDate(a.created_at);
      const dateB = parseDate(b.created_at);
      if (!dateA || !dateB) return 0;
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    setFilteredInvoices(filtered);
  }, [invoices, vehicles, searchTerm, statusFilter, dateFilter, sortOrder]);

  const calculateTotalAmount = () => {
    return filteredInvoices.reduce((total, invoice) => total + parseFloat(invoice.cost), 0);
  };

  const calculatePaidAmount = () => {
    return filteredInvoices
      .filter(invoice => invoice.paid_at)
      .reduce((total, invoice) => total + parseFloat(invoice.cost), 0);
  };

  const calculateUnpaidAmount = () => {
    return filteredInvoices
      .filter(invoice => !invoice.paid_at)
      .reduce((total, invoice) => total + parseFloat(invoice.cost), 0);
  };

  const getStatusIcon = (invoice) => {
    if (invoice.paid_at) {
      return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
    }
    return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
  };

  const getStatusColor = (invoice) => {
    return invoice.paid_at ? 
      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
  };

  // Use your print utility here ✅
  const handlePrintInvoice = (invoice) => {
    const vehicle = vehicles.find(v => v.vehicle_id === invoice.vehicle_id);
    printInvoice(invoice, vehicle);
  };

  if (vehiclesLoading || maintenanceLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (maintenanceError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg">{maintenanceError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Invoices
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and download invoices for all your vehicle services
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredInvoices.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${calculateTotalAmount().toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${calculatePaidAmount().toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unpaid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${calculateUnpaidAmount().toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No invoices found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' ? 
                'Try adjusting your filters' : 
                'No invoices available'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredInvoices.map((invoice) => {
              const vehicle = vehicles.find(v => v.vehicle_id === invoice.vehicle_id);
              const invoiceDate = parseDate(invoice.created_at);
              const paidDate = invoice.paid_at ? parseDate(invoice.paid_at) : null;
              
              return (
                <div 
                  key={invoice.log_id} 
                  id={`invoice-${invoice.log_id}`}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Invoice Header */}
                      <div className="flex items-center mb-2">
                        {getStatusIcon(invoice)}
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white ml-2">
                          Invoice #{invoice.log_id}
                        </h3>
                        <span className={`ml-3 px-2 py-1 text-xs rounded-full ${getStatusColor(invoice)}`}>
                          {invoice.paid_at ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>

                      {/* Invoice Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Service</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {typeof invoice.description === 'string' ? invoice.description : 
                             typeof invoice.description === 'object' && invoice.description?.custom_description ? 
                             invoice.description.custom_description : 'Maintenance Service'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Vehicle</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                          </p>
                          {vehicle && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {vehicle.plate_no}
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Date</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {invoiceDate ? formatDateShort(invoiceDate) : 'Invalid Date'}
                          </p>
                        </div>
                      </div>

                      {/* Payment Information */}
                      {paidDate && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Paid on {formatDateShort(paidDate)}
                          {invoice.paid_using && (
                            <span className="ml-2">via {invoice.paid_using.replace('_', ' ')}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Amount and Actions */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        ${parseFloat(invoice.cost).toFixed(2)}
                      </p>
                      
                      <div className="flex space-x-2">
                        <Link
                          to={`/customer/invoices/${invoice.log_id}`}
                          className="flex items-center px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Link>
                        
                        <button
                          onClick={() => handlePrintInvoice(invoice)}
                          className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Print
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;