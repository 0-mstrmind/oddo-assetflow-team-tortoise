import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import OrganizationSetupPage from '@/pages/OrganizationSetupPage';
import AssetDirectoryPage from '@/pages/AssetDirectoryPage';
import AllocationTransferPage from '@/pages/AllocationTransferPage';
import ResourceBookingPage from '@/pages/ResourceBookingPage';
import MaintenanceKanbanPage from '@/pages/MaintenanceKanbanPage';
import AssetAuditPage from '@/pages/AssetAuditPage';
import ReportsPage from '@/pages/ReportsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import { useMe } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import { Loader2 } from 'lucide-react';

/**
 * Initializes auth state on first load.
 */
function AuthInitializer({ children }) {
  useMe(); // fetches /auth/me and hydrates store
  const isHydrated = useAuthStore((s) => s.isHydrated);

  if (!isHydrated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#FAF7F5]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D97736]" />
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

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
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'department_head', 'employee']}>
                <MaintenanceKanbanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <AssetAuditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'department_head', 'employee']}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Placeholder routes for future screens */}
          <Route path="/bookings/new" element={<PlaceholderPage title="New Booking" />} />
          <Route path="/requests/new" element={<PlaceholderPage title="Raise Request" />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AuthInitializer>
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
