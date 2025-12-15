import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useGeolocation } from "@/hooks/useGeolocation";

interface City {
    nom: string;
    code: string;
    codesPostaux: string[];
}

interface SearchBarProps {
    onSelectCity: (cityCode: string, cityName: string) => void;
}

export function SearchBar({ onSelectCity }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<City[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { geolocate, isLoading: isGeoLoading, error: geoError } = useGeolocation();

    useEffect(() => {
        if (geoError) {
            // Simple alert for now, could be improved with a toast
            alert(geoError);
        }
    }, [geoError]);

    useEffect(() => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        const fetchCities = async () => {
            setIsSearching(true);
            try {
                const response = await fetch(
                    `https://geo.api.gouv.fr/communes?nom=${query}&fields=nom,code,codesPostaux&boost=population&limit=5`
                );
                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data);
                    // Only open if we have results and user is typing (implied by this effect running)
                    // But wait, if we select, we don't want to open.
                }
            } catch (error) {
                console.error("Error fetching cities:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const debounceTimer = setTimeout(fetchCities, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    // Handle input change explicitly
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setIsOpen(true);
    };

    const handleGeolocate = () => {
        geolocate((code, name) => {
            onSelectCity(code, name);
            setQuery(name);
            setSuggestions([]);
            setIsOpen(false);
        });
    };

    return (
        <div className="w-full max-w-md mx-auto relative z-50">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        placeholder="Rechercher une commune..."
                        value={query}
                        onChange={handleInputChange}
                        className="pr-10 bg-background/80 backdrop-blur-sm"
                        onFocus={() => {
                            if (suggestions.length > 0) setIsOpen(true);
                        }}
                    />
                    {isSearching ? (
                        <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                        <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    )}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleGeolocate}
                    disabled={isGeoLoading}
                    title="Me géolocaliser"
                    className="bg-background/80 backdrop-blur-sm"
                >
                    {isGeoLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                        <MapPin className="h-5 w-5 text-primary" />
                    )}
                </Button>
            </div>

            {suggestions.length > 0 && isOpen && (
                <Card className="absolute w-full mt-1 max-h-60 overflow-y-auto z-50 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                    <ul className="py-1">
                        {suggestions.map((city) => (
                            <li
                                key={city.code}
                                className="px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer flex justify-between items-center transition-colors"
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent input blur
                                    // Update internal state first to ensure UI feedback
                                    setQuery(city.nom);
                                    setSuggestions([]);
                                    setIsOpen(false);
                                    // Trigger parent callback
                                    onSelectCity(city.code, city.nom);
                                }}
                            >
                                <span className="font-medium">{city.nom}</span>
                                <span className="text-sm text-muted-foreground">
                                    {city.codesPostaux[0]}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    );
}
