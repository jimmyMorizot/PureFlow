import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FamilyState {
    isFamilyMode: boolean;
    toggleFamilyMode: () => void;
}

export const useFamilyStore = create<FamilyState>()(
    persist(
        (set) => ({
            isFamilyMode: false,
            toggleFamilyMode: () => set((state) => ({ isFamilyMode: !state.isFamilyMode })),
        }),
        {
            name: 'family-mode-storage',
        }
    )
);
