import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import OrganizationSetupPage from '@/pages/OrganizationSetupPage';
import AssetDirectoryPage from '@/pages/AssetDirectoryPage';
import AllocationTransferPage from '@/pages/AllocationTransferPage';
import ResourceBookingPage from '@/pages/ResourceBookingPage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes — Dashboard Shell */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/organization"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <OrganizationSetupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'department_head', 'employee']}>
                <AssetDirectoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/allocation"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'department_head']}>
                <AllocationTransferPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/allocations"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'department_head']}>
                <AllocationTransferPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'department_head', 'employee']}>
                <ResourceBookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'department_head', 'employee']}>
                <ResourceBookingPage />
              </ProtectedRoute>
            }
          />

          {/* Placeholder routes for future screens */}
          <Route path="/bookings/new" element={<PlaceholderPage title="New Booking" />} />
          <Route path="/maintenance" element={<PlaceholderPage title="Maintenance" />} />
          <Route path="/audit" element={<PlaceholderPage title="Audit" />} />
          <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
          <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
          <Route path="/requests/new" element={<PlaceholderPage title="Raise Request" />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Placeholder page for sidebar navigation items that haven't been built yet.
 * Maintains the design system aesthetic.
 */
function PlaceholderPage({ title }) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <div className="w-14 h-14 bg-[#D97736]/[0.08] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚧</span>
        </div>
        <h1 className="text-xl font-bold text-[#1E2022] mb-1.5">{title}</h1>
        <p className="text-sm text-[#9CA3AF]">This module is coming in the next phase.</p>
      </div>
    </div>
  );
}

export default App;
