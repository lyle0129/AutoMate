import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

/**
 * 404 Not Found page component
 */
const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-600">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
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
          If you believe this is an error, please contact support.
        </div>
      </div>
    </div>
  );
};

export default NotFound;