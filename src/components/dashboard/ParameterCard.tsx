import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Droplets, FlaskConical, Activity } from "lucide-react";
import { useFamilyStore } from "@/stores/useFamilyStore";

interface ParameterCardProps {
    name: string;
    value: number;
    unit: string;
    code: string;
    threshold?: number; // Optional threshold for warning
}

export function ParameterCard({ name, value, unit, code, threshold }: ParameterCardProps) {
    const { isFamilyMode } = useFamilyStore();

    // Determine icon based on parameter code or name (simplified logic)
    let Icon = Activity;
    if (name.toLowerCase().includes("nitrate") || code === "1340") Icon = FlaskConical;
    if (name.toLowerCase().includes("ph") || code === "1302") Icon = Droplets;

    // Determine status color
    const isWarning = threshold && value > threshold;
    const statusColor = isWarning ? "text-red-500" : "text-primary";

    // Family mode simplified explanation
    const getFamilyExplanation = () => {
        if (code === "1340") return isWarning ? "Attention, il y a trop de nitrates !" : "C'est bon, pas trop de nitrates.";
        if (code === "1302") return "Le pH indique si l'eau est acide ou basique.";
        if (code === "1310") return "Le chlore sert à tuer les microbes.";
        return "Un paramètre de l'eau.";
    };

    return (
        <Card className={cn("transition-all duration-300", isFamilyMode && "border-2", isFamilyMode && (isWarning ? "border-red-400 bg-red-50" : "border-green-400 bg-green-50"))}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium line-clamp-1" title={name}>
                    {isFamilyMode ? (
                        <span className="text-lg">
                            {code === "1340" ? "Nitrates" : code === "1302" ? "pH" : name}
                        </span>
                    ) : name}
                </CardTitle>
                <Icon className={cn("h-4 w-4 text-muted-foreground", statusColor, isFamilyMode && "h-6 w-6")} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
                </div>
                {threshold && !isFamilyMode && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Seuil: {threshold} {unit}
                    </p>
                )}
                {isFamilyMode && (
                    <p className="text-sm font-medium mt-2 text-foreground/80">
                        {getFamilyExplanation()}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
