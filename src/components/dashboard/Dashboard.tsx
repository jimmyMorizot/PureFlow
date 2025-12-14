import { useEffect, useState } from "react";
import { fetchWaterQuality, type WaterQualityResult } from "@/services/waterQuality";
import { QualityScore } from "./QualityScore";
import { ParameterCard } from "./ParameterCard";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { FamilyToggle } from "@/components/family-mode/FamilyToggle";
import { Button } from "@/components/ui/button";
import { useComparisonStore } from "@/stores/useComparisonStore";

import { AlertSettings } from "@/components/alerts/AlertSettings";
import { useAlertStore } from "@/stores/useAlertStore";
import { exportToPDF } from "@/lib/export";
import { FileDown } from "lucide-react";

interface DashboardProps {
    cityCode: string;
    cityName: string;
}

export function Dashboard({ cityCode, cityName }: DashboardProps) {
    const [data, setData] = useState<WaterQualityResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { alerts } = useAlertStore();

    // ... (existing useEffect) ...

    // Check for alerts
    const activeAlerts = data ? alerts.filter(alert => {
        if (!alert.enabled) return false;
        const param = data.resultats_analyse.find(p => p.code_parametre === alert.parameterCode);
        if (!param) return false;
        return param.resultat_numerique > alert.threshold;
    }) : [];

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await fetchWaterQuality(cityCode);
                if (result) {
                    setData(result);
                } else {
                    setError("Aucune donnée disponible pour cette commune.");
                }
            } catch (err) {
                console.error(err);
                setError("Erreur lors du chargement des données.");
            } finally {
                setIsLoading(false);
            }
        };

        if (cityCode) {
            loadData();
        }
    }, [cityCode]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive" className="max-w-md mx-auto mt-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (!data) return null;

    // Filter important parameters to display prominently
    // Common parameters: Nitrates (1340), pH (1302), Chlorine, etc.
    const importantParams = data.resultats_analyse.filter(p =>
        ["1340", "1302", "1310"].includes(p.code_parametre) ||
        p.libelle_parametre.toLowerCase().includes("nitrate") ||
        p.libelle_parametre.toLowerCase().includes("ph")
    );

    const otherParams = data.resultats_analyse.filter(p =>
        !importantParams.includes(p)
    ).slice(0, 6); // Show a few others

    return (
        <div className="space-y-8 animate-in fade-in duration-500" id="dashboard-content">
            {activeAlerts.length > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Alerte Qualité</AlertTitle>
                    <AlertDescription>
                        {activeAlerts.map(a => (
                            <div key={a.parameterCode}>
                                Le niveau de {a.parameterName} dépasse le seuil configuré ({a.threshold}).
                            </div>
                        ))}
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{cityName}</h2>
                    <p className="text-muted-foreground">
                        Prélèvement du {new Date(data.date_prelevement).toLocaleDateString("fr-FR")}
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                    <FamilyToggle />
                    <AlertSettings />
                    <Button
                        variant="outline"
                        onClick={() => {
                            const { addCity } = useComparisonStore.getState();
                            addCity(cityCode, cityName);
                        }}
                    >
                        Ajouter au comparateur
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        title="Exporter en PDF"
                        onClick={() => exportToPDF("dashboard-content", `pureflow-${cityName}`)}
                    >
                        <FileDown className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="md:col-span-2 lg:col-span-1">
                    <QualityScore
                        conclusion={data.conclusion_conformite_prelevement}
                        bacterio={data.conformite_limites_bacterio_prelevement}
                        chimique={data.conformite_limites_p_c_prelevement}
                    />
                </div>

                <div className="md:col-span-2 lg:col-span-2 space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Paramètres clés</h3>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {importantParams.map((param, idx) => (
                                <ParameterCard
                                    key={`${param.code_parametre}-${idx}`}
                                    name={param.libelle_parametre}
                                    value={param.resultat_numerique}
                                    unit={param.libelle_unite}
                                    code={param.code_parametre}
                                    threshold={param.code_parametre === "1340" ? 50 : undefined} // Example threshold for Nitrates
                                />
                            ))}
                            {importantParams.length === 0 && (
                                <p className="text-muted-foreground col-span-full">Aucun paramètre clé détecté.</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-xl font-semibold mb-4">Autres analyses</h3>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {otherParams.map((param, idx) => (
                                <ParameterCard
                                    key={`${param.code_parametre}-${idx}`}
                                    name={param.libelle_parametre}
                                    value={param.resultat_numerique}
                                    unit={param.libelle_unite}
                                    code={param.code_parametre}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
