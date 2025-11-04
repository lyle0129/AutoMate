import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { 
  Login, 
  Register, 
  AdminDashboard, 
  MechanicDashboard, 
  CustomerDashboard,
  NotFound,
  Unauthorized 
} from './pages';
import UserManagement from './pages/admin/UserManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import { Layout } from './components/layout';
import { 
  ProtectedRoute, 
  DashboardRouter,
  AdminRoute,
  MechanicRoute,
  CustomerRoute 
} from './components/routing';



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

              {/* Root route - redirects to appropriate dashboard */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                } 
              />

              {/* Protected routes with layout */}
              <Route 
                path="/*" 
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                {/* Admin routes */}
                <Route path="admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="admin/register" element={
                  <AdminRoute>
                    <Register />
                  </AdminRoute>
                } />
                <Route path="admin/users" element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                } />
                <Route path="admin/services" element={
                  <AdminRoute>
                    <ServiceManagement />
                  </AdminRoute>
                } />

                {/* Mechanic routes */}
                <Route path="mechanic/dashboard" element={
                  <MechanicRoute>
                    <MechanicDashboard />
                  </MechanicRoute>
                } />

                {/* Customer routes */}
                <Route path="customer/dashboard" element={
                  <CustomerRoute>
                    <CustomerDashboard />
                  </CustomerRoute>
                } />

                {/* Error pages */}
                <Route path="unauthorized" element={<Unauthorized />} />
              </Route>

              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App
