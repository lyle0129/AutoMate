import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCurrentRole } from '../../hooks/useCurrentRole';
import { useVehicles } from '../../hooks/useVehicles';
import { useMaintenance } from '../../hooks/useMaintenance';
import { parseDate, formatDate } from '../../utils/dateUtils';
import { printInvoice, formatInvoiceDescription, getServicesBreakdown, formatServicesList } from '../../utils/invoiceUtils';
import { getInvoicesListPath } from '../../utils/routeUtils';
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  Car,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  Printer
} from 'lucide-react';

/**
 * Invoice Detail component with printing functionality
 */
const InvoiceDetail = () => {
  const { invoiceId } = useParams();
  const currentRole = useCurrentRole();
  const { vehicles, loading: vehiclesLoading, fetchVehicles } = useVehicles();
  const { getMaintenanceLogById, loading: maintenanceLoading, error: maintenanceError } = useMaintenance();

  const [invoice, setInvoice] = useState(null);
  const [vehicle, setVehicle] = useState(null);

  // Load invoice and vehicle data
  useEffect(() => {
    const loadInvoiceData = async () => {
      try {
        await fetchVehicles();
        const invoiceData = await getMaintenanceLogById(invoiceId);
        setInvoice(invoiceData);
      } catch (error) {
        console.error('Error loading invoice data:', error);
      }
    };

    if (invoiceId) loadInvoiceData();
  }, [invoiceId, fetchVehicles, getMaintenanceLogById]);

  // Find the associated vehicle
  useEffect(() => {
    if (invoice && vehicles.length > 0) {
      const associatedVehicle = vehicles.find(v => v.vehicle_id === invoice.vehicle_id);
      setVehicle(associatedVehicle);
    }
  }, [invoice, vehicles]);

  const handlePrint = () => printInvoice(invoice, vehicle);
  const handleDownloadPDF = () => printInvoice(invoice, vehicle);

  // ✅ Proper loading state
  if (vehiclesLoading || maintenanceLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Error handling
  if (maintenanceError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg">{maintenanceError}</p>
          <Link
            to={getInvoicesListPath(currentRole)}
            className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  // Not found state
  if (!invoice) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Invoice not found</p>
          <Link
            to={getInvoicesListPath(currentRole)}
            className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  const invoiceDate = parseDate(invoice.created_at);
  const paidDate = invoice.paid_at ? parseDate(invoice.paid_at) : null;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header - Hidden in print */}
      <div className="print:hidden">
        <Link
          to={getInvoicesListPath(currentRole)}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Invoice #{invoice.log_id}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Service invoice details and payment information
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md print:shadow-none print:bg-white">
        {/* Invoice Header */}
        <div className="p-8 border-b border-gray-200 dark:border-gray-700 print:border-gray-300">
          <div className="text-center print:text-center">
            <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 print:text-blue-600">
              AutoMate Service Center
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 print:text-gray-600 mt-2">
              Service Invoice
            </p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Invoice Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white print:text-gray-900 mb-4 border-b border-gray-200 dark:border-gray-700 print:border-gray-300 pb-2">
                Invoice Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3 print:hidden" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Invoice Number</p>
                    <p className="font-medium text-gray-900 dark:text-white print:text-gray-900">#{invoice.log_id}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3 print:hidden" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Service Date</p>
                    <p className="font-medium text-gray-900 dark:text-white print:text-gray-900">
                      {invoiceDate ? formatDate(invoiceDate) : 'Invalid Date'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3 print:hidden" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Technician</p>
                    <p className="font-medium text-gray-900 dark:text-white print:text-gray-900">{invoice.user_name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white print:text-gray-900 mb-4 border-b border-gray-200 dark:border-gray-700 print:border-gray-300 pb-2">
                Vehicle Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Car className="h-5 w-5 text-gray-400 mr-3 print:hidden" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Vehicle</p>
                    <p className="font-medium text-gray-900 dark:text-white print:text-gray-900">
                      {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                    </p>
                  </div>
                </div>

                {vehicle && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">License Plate</p>
                      <p className="font-medium text-gray-900 dark:text-white print:text-gray-900">{vehicle.plate_no}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">Vehicle Type</p>
                      <p className="font-medium text-gray-900 dark:text-white print:text-gray-900">{vehicle.vehicle_type}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Service Details Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white print:text-gray-900 mb-4">
              Service Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 dark:border-gray-700 print:border-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-700 print:bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 print:text-gray-700 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 print:border-gray-300">
                      Service Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 print:text-gray-700 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 print:border-gray-300">
                      Date Performed
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 print:text-gray-700 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600 print:border-gray-300">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 print:bg-white">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white print:text-gray-900 border-b border-gray-200 dark:border-gray-700 print:border-gray-300">
                      <div>
                        <div className="font-medium mb-2">
                          {formatInvoiceDescription(invoice.description)}
                        </div>
                        {(() => {
                          const services = getServicesBreakdown(invoice.description);
                          if (services.length > 0) {
                            return (
                              <div className="space-y-1 text-sm">
                                <div className="font-medium text-gray-600 dark:text-gray-400 print:text-gray-600">Service Breakdown:</div>
                                {services.map((service, index) => (
                                  <div key={index} className="flex justify-between pl-2">
                                    <span>• {service.service_name}</span>
                                    <span>₱{parseFloat(service.price || 0).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white print:text-gray-900 border-b border-gray-200 dark:border-gray-700 print:border-gray-300">
                      {invoiceDate ? formatDate(invoiceDate) : 'Invalid Date'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white print:text-gray-900 text-right border-b border-gray-200 dark:border-gray-700 print:border-gray-300">
                      ₱{parseFloat(invoice.cost).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Section */}
          <div className="border-t-2 border-blue-600 pt-6">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400 print:text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white print:text-gray-900">
                    ₱{parseFloat(invoice.cost).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400 print:text-gray-600">Tax:</span>
                  <span className="font-medium text-gray-900 dark:text-white print:text-gray-900">$0.00</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t border-gray-200 dark:border-gray-700 print:border-gray-300 pt-2">
                  <span className="text-blue-600 dark:text-blue-400 print:text-blue-600">Total:</span>
                  <span className="text-blue-600 dark:text-blue-400 print:text-blue-600">
                    ₱{parseFloat(invoice.cost).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="mt-6 text-right">
              <div className="flex items-center justify-end space-x-2">
                {invoice.paid_at ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 print:hidden" />
                ) : (
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400 print:hidden" />
                )}
                <span className={`text-lg font-bold ${invoice.paid_at ?
                  'text-green-600 dark:text-green-400 print:text-green-600' :
                  'text-yellow-600 dark:text-yellow-400 print:text-yellow-600'
                  }`}>
                  Status: {invoice.paid_at ? 'PAID' : 'UNPAID'}
                </span>
              </div>

              {paidDate && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">
                  <p>Payment Date: {formatDate(paidDate)}</p>
                  {invoice.paid_using && (
                    <p>Payment Method: {invoice.paid_using.replace('_', ' ').toUpperCase()}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-200 dark:border-gray-700 print:border-gray-300 text-center text-sm text-gray-600 dark:text-gray-400 print:text-gray-600">
          <p className="mb-2">Thank you for choosing AutoMate Service Center!</p>
          <p>For questions about this invoice, please contact our service department.</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
