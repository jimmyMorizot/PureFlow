import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AlertConfig {
    parameterCode: string;
    parameterName: string;
    threshold: number;
    enabled: boolean;
}

interface AlertState {
    alerts: AlertConfig[];
    addAlert: (alert: AlertConfig) => void;
    removeAlert: (parameterCode: string) => void;
    toggleAlert: (parameterCode: string) => void;
    updateThreshold: (parameterCode: string, threshold: number) => void;
}

export const useAlertStore = create<AlertState>()(
    persist(
        (set) => ({
            alerts: [
                { parameterCode: "1340", parameterName: "Nitrates", threshold: 50, enabled: true },
                { parameterCode: "1302", parameterName: "pH", threshold: 6.5, enabled: false }, // Example: min threshold? Logic might need to handle min/max
            ],
            addAlert: (alert) =>
                set((state) => ({
                    alerts: [...state.alerts, alert],
                })),
            removeAlert: (code) =>
                set((state) => ({
                    alerts: state.alerts.filter((a) => a.parameterCode !== code),
                })),
            toggleAlert: (code) =>
                set((state) => ({
                    alerts: state.alerts.map((a) =>
                        a.parameterCode === code ? { ...a, enabled: !a.enabled } : a
                    ),
                })),
            updateThreshold: (code, threshold) =>
                set((state) => ({
                    alerts: state.alerts.map((a) =>
                        a.parameterCode === code ? { ...a, threshold } : a
                    ),
                })),
        }),
        {
            name: 'alert-storage',
        }
    )
);
