import { useEffect, useState } from "react";
import { fetchWaterQuality, type WaterQualityResult } from "@/services/waterQuality";
import { QualityScore } from "@/components/dashboard/QualityScore";
import { ParameterCard } from "@/components/dashboard/ParameterCard";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComparisonStore } from "@/stores/useComparisonStore";

interface CityColumnProps {
    cityCode: string;
    cityName: string;
}

export function CityColumn({ cityCode, cityName }: CityColumnProps) {
    const [data, setData] = useState<WaterQualityResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { removeCity } = useComparisonStore();

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const result = await fetchWaterQuality(cityCode);
                setData(result);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [cityCode]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) return <div className="p-4 text-center">Pas de données</div>;

    const importantParams = data.resultats_analyse.filter(p =>
        ["1340", "1302", "1310"].includes(p.code_parametre)
    );

    return (
        <div className="flex flex-col gap-4 min-w-[300px] border-r last:border-r-0 pr-4 last:pr-0 relative">
            <div className="flex justify-between items-center sticky top-0 bg-background z-10 py-2 border-b">
                <h3 className="font-bold text-lg">{cityName}</h3>
                <Button variant="ghost" size="icon" onClick={() => removeCity(cityCode)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <QualityScore
                conclusion={data.conclusion_conformite_prelevement}
                bacterio={data.conformite_limites_bacterio_prelevement}
                chimique={data.conformite_limites_p_c_prelevement}
            />

            <div className="space-y-4">
                {importantParams.map((param, idx) => (
                    <ParameterCard
                        key={`${param.code_parametre}-${idx}`}
                        name={param.libelle_parametre}
                        value={param.resultat_numerique}
                        unit={param.libelle_unite}
                        code={param.code_parametre}
                        threshold={param.code_parametre === "1340" ? 50 : undefined}
                    />
                ))}
            </div>
        </div>
    );
}
