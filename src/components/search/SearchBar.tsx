import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

interface City {
    nom: string;
    code: string;
    codesPostaux: string[];
}

interface SearchBarProps {
    onSelectCity: (cityCode: string, cityName: string) => void;
    onGeolocate: () => void;
}

export function SearchBar({ onSelectCity, onGeolocate }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<City[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        const fetchCities = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://geo.api.gouv.fr/communes?nom=${query}&fields=nom,code,codesPostaux&boost=population&limit=5`
                );
                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data);
                }
            } catch (error) {
                console.error("Error fetching cities:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchCities, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    return (
        <div className="w-full max-w-md mx-auto relative z-50">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        placeholder="Rechercher une commune..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pr-10"
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
                <Button variant="outline" size="icon" onClick={onGeolocate} title="Me géolocaliser">
                    <MapPin className="h-5 w-5" />
                </Button>
            </div>

            {suggestions.length > 0 && (
                <Card className="absolute w-full mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
                    <ul className="py-1">
                        {suggestions.map((city) => (
                            <li
                                key={city.code}
                                className="px-4 py-2 hover:bg-accent cursor-pointer flex justify-between items-center"
                                onClick={() => {
                                    onSelectCity(city.code, city.nom);
                                    setQuery(city.nom);
                                    setSuggestions([]);
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
