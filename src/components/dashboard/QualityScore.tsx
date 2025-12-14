import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface QualityScoreProps {
    conclusion: string;
    bacterio: string;
    chimique: string;
}

export function QualityScore({ conclusion, bacterio, chimique }: QualityScoreProps) {
    const isConforme = conclusion.toLowerCase().includes("conforme") && !conclusion.toLowerCase().includes("non conforme");

    // Simple logic to determine score/color based on conformity
    // In a real app, this might be more complex based on specific parameters
    const colorClass = isConforme ? "text-green-600" : "text-red-600";
    const bgColorClass = isConforme ? "bg-green-100" : "bg-red-100";
    const Icon = isConforme ? CheckCircle : AlertTriangle;

    return (
        <div className="w-full p-6 bg-card rounded-xl shadow-sm border space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Qualité globale</h3>
                <Badge variant={isConforme ? "default" : "destructive"} className="text-sm px-3 py-1">
                    {isConforme ? "Excellente" : "Médiocre"}
                </Badge>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4 py-4">
                <div className={cn("p-4 rounded-full", bgColorClass)}>
                    <Icon className={cn("w-12 h-12", colorClass)} />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-2xl font-bold">{conclusion}</p>
                    <p className="text-sm text-muted-foreground">Dernier prélèvement analysé</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Conformité bactériologique</span>
                        <span className={bacterio.includes("Conforme") ? "text-green-600" : "text-red-600"}>
                            {bacterio}
                        </span>
                    </div>
                    <Progress value={bacterio.includes("Conforme") ? 100 : 30} className="h-2" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Conformité physico-chimique</span>
                        <span className={chimique.includes("Conforme") ? "text-green-600" : "text-red-600"}>
                            {chimique}
                        </span>
                    </div>
                    <Progress value={chimique.includes("Conforme") ? 100 : 30} className="h-2" />
                </div>
            </div>
        </div>
    );
}
