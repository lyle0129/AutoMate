import { Link } from 'react-router-dom';
import { Shield, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Unauthorized access page component
 */
const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
          
          {user && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Current role: <span className="font-medium capitalize">{user.role}</span>
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors ml-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          If you need access to this page, please contact your administrator.
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;