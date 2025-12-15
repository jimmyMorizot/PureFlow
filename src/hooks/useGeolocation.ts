import { useState } from "react";

interface LocationState {
    isLoading: boolean;
    error: string | null;
}

export function useGeolocation() {
    const [state, setState] = useState<LocationState>({
        isLoading: false,
        error: null,
    });

    const geolocate = (onSuccess: (code: string, name: string) => void) => {
        setState({ isLoading: true, error: null });

        if (!navigator.geolocation) {
            setState({ isLoading: false, error: "La géolocalisation n'est pas supportée par votre navigateur." });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(
                        `https://geo.api.gouv.fr/communes?lat=${latitude}&lon=${longitude}&fields=nom,code,codesPostaux`
                    );

                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.length > 0) {
                            const city = data[0];
                            onSuccess(city.code, city.nom);
                            setState({ isLoading: false, error: null });
                        } else {
                            setState({ isLoading: false, error: "Aucune commune trouvée à cette position." });
                        }
                    } else {
                        setState({ isLoading: false, error: "Erreur lors de la récupération de la commune." });
                    }
                } catch (err) {
                    console.error(err);
                    setState({ isLoading: false, error: "Impossible de récupérer les informations de localisation." });
                }
            },
            (err) => {
                console.error("Geolocation error:", err);
                let errorMessage = "Une erreur est survenue lors de la géolocalisation.";
                if (err.code === 1) errorMessage = "Vous avez refusé la géolocalisation.";
                else if (err.code === 2) errorMessage = "La position est indisponible.";
                else if (err.code === 3) errorMessage = "La demande de géolocalisation a expiré.";

                setState({ isLoading: false, error: errorMessage });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    return { ...state, geolocate };
}
