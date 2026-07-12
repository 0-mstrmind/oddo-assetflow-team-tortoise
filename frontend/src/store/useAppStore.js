import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * AssetFlow App Store
 * 
 * Manages global application settings like Demo Mode.
 * Preserves states in LocalStorage.
 */
export const useAppStore = create(
  persist(
    (set) => ({
      isDemoMode: true,
      toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
    }),
    {
      name: 'assetflow-app-storage',
    }
  )
);
export default useAppStore;
