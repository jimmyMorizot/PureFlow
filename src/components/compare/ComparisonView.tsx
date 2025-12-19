import { useEffect, useState, memo } from "react";
import { useComparisonStore } from "@/stores/useComparisonStore";
import { fetchWaterQuality, type WaterQualityResult } from "@/services/waterQuality";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, X, Trophy, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function ComparisonViewComponent() {
    const { selectedCities, removeCity } = useComparisonStore();
    const [cityData, setCityData] = useState<Record<string, WaterQualityResult>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (selectedCities.length === 0) return;

            // Only fetch for cities we don't have yet or if list changed significantly
            const codesToFetch = selectedCities.map(c => c.code).filter(code => !cityData[code]);

            if (codesToFetch.length === 0) return;

            setIsLoading(true);
            const newData = { ...cityData };

            try {
                await Promise.all(codesToFetch.map(async (code) => {
                    const result = await fetchWaterQuality(code);
                    if (result) {
                        newData[code] = result;
                    }
                }));
                setCityData(newData);
            } catch (error) {
                console.error("Error fetching comparison data", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [selectedCities]);

    if (selectedCities.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border-dashed border-2">
                Aucune commune sélectionnée pour la comparaison.
            </div>
        );
    }

    // Prepare parameters list (union of all parameters from all cities)
    const allParamsMap = new Map<string, string>();
    Object.values(cityData).forEach(data => {
        data.resultats_analyse.forEach(p => {
            allParamsMap.set(p.code_parametre, p.libelle_parametre);
        });
    });

    // Sort parameters alphabetically
    const parameters = Array.from(allParamsMap.entries()).sort((a, b) =>
        a[1].localeCompare(b[1])
    );

    const getValue = (cityCode: string, paramCode: string) => {
        const city = cityData[cityCode];
        if (!city) return null;
        return city.resultats_analyse.find(p => p.code_parametre === paramCode);
    };

    // Helper to determine winner (lower is usually better for contaminants)
    const getColor = (currentVal: number, otherVals: number[], paramCode: string) => {
        if (otherVals.length === 0) return "";
        // pH special case: closer to 7 is "neutral/good"? Or range 6.5-9. Let's skip coloring pH for now or simple diff
        if (paramCode === "1302") return "";

        // For Nitrates (1340), Chlorine (1310), Conductivity (1301), Bacteria -> Lower is better
        const isLower = otherVals.every(v => currentVal < v);
        const isHigher = otherVals.every(v => currentVal > v);

        if (isLower) return "text-emerald-600 font-bold bg-emerald-50";
        if (isHigher) return "text-red-600 font-bold bg-red-50";
        return "";
    };

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-center px-2">
                <div>
                    <h3 className="text-xl font-bold">Tableau Comparatif</h3>
                    <p className="text-sm text-muted-foreground">
                        {selectedCities.length} ville{selectedCities.length > 1 ? 's' : ''} sélectionnée{selectedCities.length > 1 ? 's' : ''}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => useComparisonStore.getState().clearCities()}
                >
                    Tout effacer
                </Button>
            </div>

            <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                <ScrollArea className="w-full">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[200px] font-bold">Paramètre</TableHead>
                                {selectedCities.map(city => (
                                    <TableHead key={city.code} className="min-w-[200px]">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-foreground">{city.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeCity(city.code)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Global Status Row */}
                            <TableRow className="hover:bg-transparent">
                                <TableCell className="font-medium">Conclusion</TableCell>
                                {selectedCities.map(city => {
                                    const data = cityData[city.code];
                                    if (!data) return <TableCell key={city.code}><Loader2 className="h-4 w-4 animate-spin" /></TableCell>;
                                    const isConform = data.conclusion_conformite_prelevement.toLowerCase().includes("conforme");
                                    return (
                                        <TableCell key={city.code}>
                                            <Badge variant={isConform ? "default" : "destructive"} className={isConform ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                                {isConform ? "Conforme" : "Non conforme"}
                                            </Badge>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>

                            {/* Parameter Rows */}
                            {parameters.map(([code, name]) => (
                                <TableRow key={code}>
                                    <TableCell className="font-medium text-muted-foreground">{name}</TableCell>
                                    {selectedCities.map(city => {
                                        const val = getValue(city.code, code);
                                        if (!val) return <TableCell key={city.code} className="text-muted-foreground">-</TableCell>;

                                        // Get other values for comparison
                                        const otherValues = selectedCities
                                            .filter(c => c.code !== city.code)
                                            .map(c => getValue(c.code, code)?.resultat_numerique)
                                            .filter((v): v is number => v !== undefined);

                                        const colorClass = getColor(val.resultat_numerique, otherValues, code);

                                        return (
                                            <TableCell key={city.code}>
                                                <div className={`inline-flex items-center px-2 py-1 rounded-md ${colorClass}`}>
                                                    {val.resultat_numerique}
                                                    <span className="text-xs font-normal text-muted-foreground ml-1">{val.libelle_unite}</span>
                                                    {colorClass.includes("emerald") && <Trophy className="ml-2 h-3 w-3" />}
                                                    {colorClass.includes("red") && <AlertTriangle className="ml-2 h-3 w-3" />}
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
            {isLoading && (
                <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            )}
        </div>
    );
}

export const ComparisonView = memo(ComparisonViewComponent);
