import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * AssetFlow Authentication Store
 * 
 * Manages user session, role-based access, and auth state.
 * Employs Zustand persist middleware to prevent state loss on reloads.
 */

const ROLES = {
  ADMIN: 'admin',
  ASSET_MANAGER: 'manager',
  DEPARTMENT_HEAD: 'department_head',
  EMPLOYEE: 'employee',
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── Session State ──
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isDeptHead: false,

      // ── Role Helpers (computed dynamically) ──
      get isAdmin() {
        return get().user?.role === ROLES.ADMIN;
      },
      get isAssetManager() {
        return get().user?.role === ROLES.ASSET_MANAGER;
      },
      get isDepartmentHead() {
        return get().user?.role === ROLES.DEPARTMENT_HEAD || get().isDeptHead;
      },
      get isEmployee() {
        return get().user?.role === ROLES.EMPLOYEE;
      },

      getRoleLabel: () => {
        const role = get().user?.role;
        const labels = {
          [ROLES.ADMIN]: 'Admin',
          [ROLES.ASSET_MANAGER]: 'Asset Manager',
          [ROLES.DEPARTMENT_HEAD]: 'Department Head',
          [ROLES.EMPLOYEE]: 'Employee',
        };
        return labels[role] || 'Unknown';
      },

      hasPermission: (permission) => {
        const user = get().user;
        if (!user) return false;
        
        // Admin has all permissions
        if (user.role === ROLES.ADMIN) return true;
        
        return user.permissions?.includes(permission) || false;
      },

      // ── Actions ──
      checkDepartmentHeadStatus: async () => {
        const user = get().user;
        if (!user) return;
        try {
          const { getDepartments } = await import('@/services/api.mock');
          const depts = await getDepartments();
          // Compare user.id to the headId fields in the departments list
          const isHead = depts.some(dept => dept.headId === user.id);
          set({ isDeptHead: isHead });
          
          // Upgrade role & permissions dynamically if they are designated as head
          if (isHead && user.role === ROLES.EMPLOYEE) {
            set({
              user: {
                ...user,
                role: ROLES.DEPARTMENT_HEAD,
                permissions: ['assets.read', 'bookings.manage', 'bookings.view', 'transfers.approve']
              }
            });
          }
        } catch (e) {
          console.error('Failed to verify department head status:', e);
        }
      },

      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { mockSignIn } = await import('@/services/api.mock');
          const session = await mockSignIn(email, password);
          set({
            user: session.user,
            token: session.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          // Check headship status
          await get().checkDepartmentHeadStatus();
          return session;
        } catch (err) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      signUp: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { mockSignUp } = await import('@/services/api.mock');
          const session = await mockSignUp(name, email, password);
          set({
            user: session.user,
            token: session.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          // Check headship status
          await get().checkDepartmentHeadStatus();
          return session;
        } catch (err) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      signOut: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isDeptHead: false,
          error: null,
        });
      },

      // Direct role switcher for frontend RBAC testing
      setMockRole: (role) => {
        const user = get().user;
        if (!user) return;
        
        // Map permissions accordingly
        let permissions = ['assets.read'];
        if (role === ROLES.ADMIN) {
          permissions = ['assets.read', 'assets.write', 'assets.register', 'bookings.manage', 'bookings.view', 'allocations.manage', 'transfers.approve', 'maintenance.manage', 'audits.view', 'audits.submit', 'reports.view'];
        } else if (role === ROLES.ASSET_MANAGER) {
          permissions = ['assets.read', 'assets.write', 'assets.register', 'bookings.view', 'allocations.manage', 'maintenance.manage', 'audits.view', 'audits.submit'];
        } else if (role === ROLES.DEPARTMENT_HEAD) {
          permissions = ['assets.read', 'bookings.manage', 'bookings.view', 'transfers.approve'];
        } else if (role === ROLES.EMPLOYEE) {
          permissions = ['assets.read', 'bookings.view'];
        }
        
        set({
          user: {
            ...user,
            role,
            permissions,
          },
          isDeptHead: role === ROLES.DEPARTMENT_HEAD
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'assetflow-auth-storage', // localStorage key
      // State values we want to persist (default preserves everything in the state object)
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isDeptHead: state.isDeptHead,
      }),
    }
  )
);

export { ROLES };
