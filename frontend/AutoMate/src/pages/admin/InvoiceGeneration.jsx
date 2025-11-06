import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, CheckCircle, Printer, Download } from 'lucide-react';
import Button from '../../components/ui/Button';
import InvoiceForm from '../../components/forms/InvoiceForm';
import { useMaintenance } from '../../hooks/useMaintenance';
import { printInvoice } from '../../utils/invoiceUtils';

/**
 * Admin Invoice Generation page - simplified approach similar to mechanic version
 */
const AdminInvoiceGeneration = () => {
  const navigate = useNavigate();
  const { markAsPaid } = useMaintenance();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mark the maintenance log as paid
      await markAsPaid(formData.maintenance_log_id, formData.payment_method);
      
      setGeneratedInvoice({
        ...formData.maintenance_log,
        paid_at: new Date().toISOString(),
        paid_using: formData.payment_method,
        vehicle: formData.vehicle
      });
      
      setSuccess(true);
      
    } catch (err) {
      console.error('Error generating invoice:', err);
      setError(err.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle print invoice
  const handlePrint = () => {
    if (generatedInvoice && generatedInvoice.vehicle) {
      printInvoice(generatedInvoice, generatedInvoice.vehicle);
    }
  };

  // Handle download PDF
  const handleDownloadPDF = () => {
    if (generatedInvoice && generatedInvoice.vehicle) {
      printInvoice(generatedInvoice, generatedInvoice.vehicle);
    }
  };

  // Success screen - same as mechanic version
  if (success && generatedInvoice) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invoice Generated Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Invoice #{generatedInvoice.log_id} has been created and the maintenance log has been marked as paid.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="text-left space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Invoice ID:</span>
                <span>#{generatedInvoice.log_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Vehicle:</span>
                <span>{generatedInvoice.vehicle?.plate_no} - {generatedInvoice.vehicle?.make} {generatedInvoice.vehicle?.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Amount:</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  ₱{parseFloat(generatedInvoice.cost || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Payment Method:</span>
                <span className="capitalize">{generatedInvoice.paid_using?.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Print Actions */}
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
            
            {/* Navigation Actions */}
            <div className="flex justify-center space-x-3">
              <Button onClick={() => navigate('/admin/dashboard')}>
                Return to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSuccess(false);
                  setError(null);
                  setGeneratedInvoice(null);
                }}
              >
                Generate Another Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form screen - same structure as mechanic version
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Generate Invoice
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create an invoice from completed maintenance work
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Error Generating Invoice
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
        <div className="flex">
          <FileText className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Invoice Generation Process
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
              <ul className="list-disc list-inside space-y-1">
                <li>Select an unpaid maintenance log from the dropdown</li>
                <li>Choose the payment method used by the customer</li>
                <li>Preview the invoice before finalizing</li>
                <li>Generate the invoice and mark the maintenance as paid</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-6">
          <FileText className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Invoice Details
          </h2>
        </div>
        
        <InvoiceForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AdminInvoiceGeneration;