import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import {
  Login,
  Register,
  AdminDashboard,
  MechanicDashboard,
  CustomerDashboard,
  VehicleList,
  VehicleDetail,
  MaintenanceHistory,
  InvoiceList,
  InvoiceDetail,
  NotFound,
  Unauthorized,
  AdminVehicleList,
  OwnerList,
  OwnerDetail,
  Reports,
  AdminInvoiceGeneration,
  AccountSettings
} from './pages';
import UserManagement from './pages/admin/UserManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import MaintenanceManagement from './pages/admin/MaintenanceManagement';
import { MaintenanceLogging, InvoiceGeneration } from './pages/mechanic';
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
                <Route path="admin/vehicles" element={
                  <AdminRoute>
                    <AdminVehicleList />
                  </AdminRoute>
                } />
                <Route path="admin/owners" element={
                  <AdminRoute>
                    <OwnerList />
                  </AdminRoute>
                } />
                <Route path="admin/owners/:ownerId" element={
                  <AdminRoute>
                    <OwnerDetail />
                  </AdminRoute>
                } />
                <Route path="admin/reports" element={
                  <AdminRoute>
                    <Reports />
                  </AdminRoute>
                } />
                <Route path="admin/invoices/new" element={
                  <AdminRoute>
                    <AdminInvoiceGeneration />
                  </AdminRoute>
                } />
                <Route path="admin/maintenance" element={
                  <AdminRoute>
                    <MaintenanceHistory />
                  </AdminRoute>
                } />
                <Route path="admin/maintenance-management" element={
                  <AdminRoute>
                    <MaintenanceManagement />
                  </AdminRoute>
                } />
                <Route path="admin/settings" element={
                  <AdminRoute>
                    <AccountSettings />
                  </AdminRoute>
                } />
                <Route path="admin/vehicles/:vehicleId" element={
                  <AdminRoute>
                    <VehicleDetail />
                  </AdminRoute>
                } />
                <Route path="admin/vehicles/:vehicleId/maintenance" element={
                  <AdminRoute>
                    <MaintenanceHistory />
                  </AdminRoute>
                } />
                <Route path="admin/invoices" element={
                  <AdminRoute>
                    <InvoiceList />
                  </AdminRoute>
                } />
                <Route path="admin/invoices/:invoiceId" element={
                  <AdminRoute>
                    <InvoiceDetail />
                  </AdminRoute>
                } />

                {/* Mechanic routes */}
                <Route path="mechanic/dashboard" element={
                  <MechanicRoute>
                    <MechanicDashboard />
                  </MechanicRoute>
                } />
                <Route path="mechanic/maintenance/new" element={
                  <MechanicRoute>
                    <MaintenanceLogging />
                  </MechanicRoute>
                } />
                <Route path="mechanic/invoices/new" element={
                  <MechanicRoute>
                    <InvoiceGeneration />
                  </MechanicRoute>
                } />
                <Route path="mechanic/vehicles" element={
                  <MechanicRoute>
                    <AdminVehicleList />
                  </MechanicRoute>
                } />
                <Route path="mechanic/maintenance" element={
                  <MechanicRoute>
                    <MaintenanceHistory />
                  </MechanicRoute>
                } />
                <Route path="mechanic/invoices" element={
                  <MechanicRoute>
                    <InvoiceList />
                  </MechanicRoute>
                } />
                <Route path="mechanic/settings" element={
                  <MechanicRoute>
                    <AccountSettings />
                  </MechanicRoute>
                } />
                <Route path="mechanic/vehicles/:vehicleId" element={
                  <MechanicRoute>
                    <VehicleDetail />
                  </MechanicRoute>
                } />
                <Route path="mechanic/vehicles/:vehicleId/maintenance" element={
                  <MechanicRoute>
                    <MaintenanceHistory />
                  </MechanicRoute>
                } />
                <Route path="mechanic/invoices/:invoiceId" element={
                  <MechanicRoute>
                    <InvoiceDetail />
                  </MechanicRoute>
                } />

                {/* Customer routes */}
                <Route path="customer/dashboard" element={
                  <CustomerRoute>
                    <CustomerDashboard />
                  </CustomerRoute>
                } />
                <Route path="customer/vehicles" element={
                  <CustomerRoute>
                    <VehicleList />
                  </CustomerRoute>
                } />
                <Route path="customer/vehicles/:vehicleId" element={
                  <CustomerRoute>
                    <VehicleDetail />
                  </CustomerRoute>
                } />
                <Route path="customer/vehicles/:vehicleId/maintenance" element={
                  <CustomerRoute>
                    <MaintenanceHistory />
                  </CustomerRoute>
                } />
                <Route path="customer/maintenance" element={
                  <CustomerRoute>
                    <MaintenanceHistory />
                  </CustomerRoute>
                } />
                <Route path="customer/invoices" element={
                  <CustomerRoute>
                    <InvoiceList />
                  </CustomerRoute>
                } />
                <Route path="customer/invoices/:invoiceId" element={
                  <CustomerRoute>
                    <InvoiceDetail />
                  </CustomerRoute>
                } />
                <Route path="customer/settings" element={
                  <CustomerRoute>
                    <AccountSettings />
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

export default App;
