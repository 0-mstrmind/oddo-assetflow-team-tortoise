import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * ProtectedRoute — Redirects unauthenticated users to login.
 * Wraps any route that requires an active session.
 */
export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
