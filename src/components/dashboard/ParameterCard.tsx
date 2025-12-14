import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Droplets, FlaskConical, Activity } from "lucide-react";

interface ParameterCardProps {
    name: string;
    value: number;
    unit: string;
    code: string;
    threshold?: number; // Optional threshold for warning
}

export function ParameterCard({ name, value, unit, code, threshold }: ParameterCardProps) {
    // Determine icon based on parameter code or name (simplified logic)
    let Icon = Activity;
    if (name.toLowerCase().includes("nitrate") || code === "1340") Icon = FlaskConical;
    if (name.toLowerCase().includes("ph") || code === "1302") Icon = Droplets;

    // Determine status color
    const isWarning = threshold && value > threshold;
    const statusColor = isWarning ? "text-red-500" : "text-primary";

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium line-clamp-1" title={name}>
                    {name}
                </CardTitle>
                <Icon className={cn("h-4 w-4 text-muted-foreground", statusColor)} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
                </div>
                {threshold && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Seuil: {threshold} {unit}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
