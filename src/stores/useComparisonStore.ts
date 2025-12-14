import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ComparisonState {
    selectedCities: { code: string; name: string }[];
    addCity: (code: string, name: string) => void;
    removeCity: (code: string) => void;
    clearCities: () => void;
}

export const useComparisonStore = create<ComparisonState>()(
    persist(
        (set) => ({
            selectedCities: [],
            addCity: (code, name) =>
                set((state) => {
                    if (state.selectedCities.find((c) => c.code === code)) return state;
                    if (state.selectedCities.length >= 3) return state; // Max 3 cities
                    return { selectedCities: [...state.selectedCities, { code, name }] };
                }),
            removeCity: (code) =>
                set((state) => ({
                    selectedCities: state.selectedCities.filter((c) => c.code !== code),
                })),
            clearCities: () => set({ selectedCities: [] }),
        }),
        {
            name: 'comparison-storage',
        }
    )
);
