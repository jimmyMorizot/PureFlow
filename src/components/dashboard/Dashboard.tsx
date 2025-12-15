import { useEffect, useState } from "react";
import { fetchWaterQuality, type WaterQualityResult } from "@/services/waterQuality";
import { QualityScore } from "./QualityScore";
import { ParameterCard } from "./ParameterCard";
import { AnalysisTable } from "./AnalysisTable";
import { Loader2, AlertCircle, FileDown, PlusCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
// import { useComparisonStore } from "@/stores/useComparisonStore"; // Removed unused import

import { AlertSettings } from "@/components/alerts/AlertSettings";
import { useAlertStore } from "@/stores/useAlertStore";
import { exportToPDF } from "@/lib/export";
import { HistoryChart } from "./HistoryChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardProps {
    cityCode: string;
    cityName: string;
    onCompareClick: () => void;
}

export function Dashboard({ cityCode, cityName, onCompareClick }: DashboardProps) {
    const [data, setData] = useState<WaterQualityResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { alerts } = useAlertStore();
    // const { addCity } = useComparisonStore(); // Removed unused import

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
            <div className="flex justify-center items-center py-24">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Analyse de la qualité de l'eau...</p>
                </div>
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

    // Filter important parameters
    const nitrate = data.resultats_analyse.find(p => p.code_parametre === "1340");
    const ph = data.resultats_analyse.find(p => p.code_parametre === "1302");
    const chlorine = data.resultats_analyse.find(p => p.code_parametre === "1310") || data.resultats_analyse.find(p => p.libelle_parametre.toLowerCase().includes("chlore"));

    // All results for the detail table
    const allResults = data.resultats_analyse;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700" id="dashboard-content">
            {activeAlerts.length > 0 && (
                <Alert variant="destructive" className="animate-pulse border-red-500 bg-red-50">
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

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{cityName}</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Code INSEE: {data.code_commune}
                        {data.network && <span className="ml-2">· Réseau: {data.network.nom_reseau}</span>}
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <AlertSettings />
                    <Button
                        variant="default"
                        size="sm"
                        onClick={onCompareClick}
                        className="gap-2 shadow-sm"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Comparateur
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

            {/* Full-Width Quality Banner */}
            <QualityScore
                conclusion={data.conclusion_conformite_prelevement}
                bacterio={data.conformite_limites_bacterio_prelevement}
                chimique={data.conformite_limites_p_c_prelevement}
                date={new Date(data.date_prelevement).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' })}
            />

            {/* Key Parameters - Horizontal Row */}
            <section>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {nitrate && (
                        <ParameterCard
                            name="Nitrates"
                            code="1340"
                            value={nitrate.resultat_numerique}
                            unit={nitrate.libelle_unite}
                            threshold={50}
                            history={data.history?.["1340"]}
                            color="#ef4444"
                        />
                    )}
                    {ph && (
                        <ParameterCard
                            name="pH"
                            code="1302"
                            value={ph.resultat_numerique}
                            unit={ph.libelle_unite}
                            threshold={9}
                            history={data.history?.["1302"]}
                            color="#0ea5e9"
                        />
                    )}
                    {chlorine && (
                        <ParameterCard
                            name="Chlore libre"
                            code="1310"
                            value={chlorine.resultat_numerique}
                            unit={chlorine.libelle_unite}
                            history={data.history?.["1310"]}
                            color="#10b981"
                        />
                    )}
                </div>
            </section>

            {/* Historical Charts */}
            {data.history && (
                <section>
                    <h3 className="text-xl font-bold mb-4 text-foreground">Évolution temporelle</h3>
                    <Tabs defaultValue="nitrates" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="nitrates" disabled={!data.history["1340"]}>Nitrates</TabsTrigger>
                            <TabsTrigger value="ph" disabled={!data.history["1302"]}>pH</TabsTrigger>
                            <TabsTrigger value="chlore" disabled={!data.history["1310"]}>Chlore</TabsTrigger>
                        </TabsList>
                        <TabsContent value="nitrates" className="h-[300px]">
                            {data.history["1340"] ? (
                                <HistoryChart
                                    parameterName="Nitrates"
                                    unit="mg(NO3)/L"
                                    data={data.history["1340"]}
                                    threshold={50}
                                    color="#ef4444"
                                />
                            ) : <p>Pas d'historique disponible.</p>}
                        </TabsContent>
                        <TabsContent value="ph" className="h-[300px]">
                            {data.history["1302"] ? (
                                <HistoryChart
                                    parameterName="pH"
                                    unit="unité pH"
                                    data={data.history["1302"]}
                                    color="#0ea5e9"
                                />
                            ) : <p>Pas d'historique disponible.</p>}
                        </TabsContent>
                        <TabsContent value="chlore" className="h-[300px]">
                            {data.history["1310"] ? (
                                <HistoryChart
                                    parameterName="Chlore libre"
                                    unit="mg(Cl2)/L"
                                    data={data.history["1310"]}
                                    color="#10b981"
                                />
                            ) : <p>Pas d'historique disponible.</p>}
                        </TabsContent>
                    </Tabs>
                </section>
            )}

            {/* Detail des Analyses Section */}
            <AnalysisTable
                results={allResults}
                datePrelevement={data.date_prelevement}
            />
        </div>
    );
}
