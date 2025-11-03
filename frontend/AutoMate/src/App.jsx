import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Login, Register } from './pages';
import { useAuth } from './hooks/useAuth';
import { ThemeToggle } from './components/layout';

// Temporary Dashboard component until we implement the actual dashboards
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome to AutoMate
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Hello, {user?.user_name}! You are logged in as {user?.role}.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle size="md" showLabel={true} />
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin/register')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Create User
                </button>
              )}
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                User Information
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                ID: {user?.id}<br />
                Role: {user?.role}<br />
                {user?.owner_id && `Owner ID: ${user.owner_id}`}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                Authentication Status
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                ✓ Successfully authenticated<br />
                ✓ Session active<br />
                ✓ HTTP-only cookies working
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                Next Steps
              </h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm">
                • Theme system (Task 3)<br />
                • Role-based routing (Task 4)<br />
                • UI components (Task 5)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Main App component
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin-only routes */}
              <Route
                path="/admin/register"
                element={
                  <ProtectedRoute>
                    <Register />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App
