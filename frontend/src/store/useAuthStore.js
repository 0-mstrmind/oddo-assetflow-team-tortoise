import { create } from 'zustand';

/**
 * AssetFlow Authentication Store
 * 
 * Manages user session, role-based access, and auth state.
 * The signIn action currently uses the mock service layer.
 * When backend is ready, swap the mock call in the signIn action.
 */

const ROLES = {
  ADMIN: 'admin',
  ASSET_MANAGER: 'asset_manager',
  EMPLOYEE: 'employee',
};

export const useAuthStore = create((set, get) => ({
  // ── Session State ──
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // ── Role Helpers ──
  get isAdmin() {
    return get().user?.role === ROLES.ADMIN;
  },
  get isAssetManager() {
    return get().user?.role === ROLES.ASSET_MANAGER;
  },
  get isEmployee() {
    return get().user?.role === ROLES.EMPLOYEE;
  },

  getRoleLabel: () => {
    const role = get().user?.role;
    const labels = {
      [ROLES.ADMIN]: 'Administrator',
      [ROLES.ASSET_MANAGER]: 'Asset Manager',
      [ROLES.EMPLOYEE]: 'Employee',
    };
    return labels[role] || 'Unknown';
  },

  hasPermission: (permission) => {
    const user = get().user;
    if (!user) return false;
    return user.permissions?.includes(permission) || false;
  },

  // ── Actions ──
  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Import dynamically to keep the store clean
      const { mockSignIn } = await import('@/services/api.mock');
      const session = await mockSignIn(email, password);
      set({
        user: session.user,
        token: session.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
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
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

export { ROLES };
