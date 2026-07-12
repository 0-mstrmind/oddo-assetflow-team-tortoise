import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldAlert } from 'lucide-react';

/**
 * ProtectedRoute — Guards routes based on authentication and role-based access control.
 * 
 * @param {React.ReactNode} children - Component to render if access is granted.
 * @param {string[]} allowedRoles - List of roles permitted to view this route.
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  // 0. Wait for Zustand storage hydration from localStorage
  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#E8E2DC] border-t-[#D97736] rounded-full animate-spin" />
      </div>
    );
  }

  // 1. Authentication Check
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role Authorization Check
  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-16 h-16 bg-[#C85C27]/10 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <ShieldAlert className="text-[#C85C27]" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-[#1E2022] tracking-tight mb-2">Access Denied</h1>
        <p className="text-sm text-[#9CA3AF] text-center max-w-sm mb-6 leading-relaxed">
          You do not have the required permissions to access this module. Please navigate to another section or contact your system administrator.
        </p>
        <a
          href="/dashboard"
          className="px-5 py-2.5 bg-[#1E2022] text-white text-sm font-semibold rounded-full hover:bg-[#2D3135] transition-all shadow-[0_2px_8px_rgba(30,32,34,0.06)]"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  return children;
}
