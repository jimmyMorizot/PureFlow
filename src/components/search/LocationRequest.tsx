import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Need to install alert

interface LocationRequestProps {
    onLocationFound: (code: string, name: string) => void;
}

export function LocationRequest({ onLocationFound }: LocationRequestProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGeolocate = () => {
        setIsLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("La géolocalisation n'est pas supportée par votre navigateur.");
            setIsLoading(false);
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
                            onLocationFound(city.code, city.nom);
                        } else {
                            setError("Aucune commune trouvée à cette position.");
                        }
                    } else {
                        setError("Erreur lors de la récupération de la commune.");
                    }
                } catch (err) {
                    console.error(err);
                    setError("Impossible de récupérer les informations de localisation.");
                } finally {
                    setIsLoading(false);
                }
            },
            (err) => {
                console.error(err);
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setError("Vous avez refusé la géolocalisation.");
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setError("La position est indisponible.");
                        break;
                    case err.TIMEOUT:
                        setError("La demande de géolocalisation a expiré.");
                        break;
                    default:
                        setError("Une erreur inconnue est survenue.");
                }
                setIsLoading(false);
            }
        );
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <Button
                onClick={handleGeolocate}
                disabled={isLoading}
                className="w-full sm:w-auto"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Localisation en cours...
                    </>
                ) : (
                    <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Me géolocaliser
                    </>
                )}
            </Button>

            {error && (
                <div className="text-destructive text-sm mt-2 text-center">
                    {error}
                </div>
            )}
        </div>
    );
}
