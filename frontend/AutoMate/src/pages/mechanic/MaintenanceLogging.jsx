import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import MaintenanceForm from '../../components/forms/MaintenanceForm';
import { useMaintenance } from '../../hooks/useMaintenance';

/**
 * MaintenanceLogging page for mechanics to create new maintenance entries
 */
const MaintenanceLogging = () => {
  const navigate = useNavigate();
  const { createMaintenanceLog } = useMaintenance();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create maintenance log
      await createMaintenanceLog(formData);
      
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Error creating maintenance log:', err);
      setError(err.message || 'Failed to create maintenance log');
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Maintenance Log Created Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The maintenance record has been saved and is now available in the system.
          </p>
          <div className="space-x-3">
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setSuccess(false);
                setError(null);
              }}
            >
              Create Another Log
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            Create Maintenance Log
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Record new maintenance work performed on a vehicle
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Error Creating Maintenance Log
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Wrench className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Maintenance Details
          </h2>
        </div>
        
        <MaintenanceForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default MaintenanceLogging;