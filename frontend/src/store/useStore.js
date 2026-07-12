import { create } from 'zustand';

/**
 * AssetFlow Global Application Store
 * Manages: user session, navigation state, and UI preferences.
 * 
 * When backend is ready, hydrate this store from API responses.
 */
export const useAppStore = create((set, get) => ({
  // ── User Session ──
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearUser: () => set({ user: null, isAuthenticated: false }),

  // ── Navigation State ──
  sidebarOpen: true,
  activePage: 'dashboard',

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActivePage: (page) => set({ activePage: page }),

  // ── UI Preferences ──
  theme: 'light', // AssetFlow is light-first by design
  setTheme: (theme) => set({ theme }),

  // ── Landing Page State ──
  isLandingLoaded: false,
  setLandingLoaded: (loaded) => set({ isLandingLoaded: loaded }),
}));

/**
 * Asset Directory Store
 * Manages: asset listings, filters, and pagination state.
 */
export const useAssetStore = create((set, get) => ({
  assets: [],
  filteredAssets: [],
  isLoading: false,
  error: null,

  // Filters
  filters: {
    search: '',
    category: 'all',
    status: 'all',
    department: 'all',
  },

  setAssets: (assets) => set({ assets, filteredAssets: assets }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  setFilter: (key, value) => {
    const filters = { ...get().filters, [key]: value };
    const filtered = get().assets.filter((asset) => {
      const matchesSearch = !filters.search ||
        asset.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        asset.assetTag.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = filters.category === 'all' || asset.category === filters.category;
      const matchesStatus = filters.status === 'all' || asset.status === filters.status;
      const matchesDept = filters.department === 'all' || asset.department === filters.department;
      return matchesSearch && matchesCategory && matchesStatus && matchesDept;
    });
    set({ filters, filteredAssets: filtered });
  },

  clearFilters: () => {
    set({
      filters: { search: '', category: 'all', status: 'all', department: 'all' },
      filteredAssets: get().assets,
    });
  },
}));

/**
 * Booking Store
 * Manages: resource bookings, time slots, and conflicts.
 */
export const useBookingStore = create((set) => ({
  bookings: [],
  selectedDate: new Date().toISOString().split('T')[0],
  isLoading: false,

  setBookings: (bookings) => set({ bookings }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setLoading: (isLoading) => set({ isLoading }),
}));
