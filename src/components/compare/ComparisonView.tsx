import { useComparisonStore } from "@/stores/useComparisonStore";
import { CityColumn } from "./CityColumn";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Need to install scroll-area

export function ComparisonView() {
    const { selectedCities } = useComparisonStore();

    if (selectedCities.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                Aucune commune sélectionnée pour la comparaison.
            </div>
        );
    }

    return (
        <div className="w-full border rounded-md">
            <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                <div className="flex w-max space-x-4 p-4">
                    {selectedCities.map((city) => (
                        <CityColumn key={city.code} cityCode={city.code} cityName={city.name} />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
