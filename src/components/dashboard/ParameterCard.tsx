import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Droplets, FlaskConical, Activity, ShieldCheck, TrendingUp, TrendingDown } from "lucide-react";
import { memo, useMemo } from "react";
import { Sparkline } from "./Sparkline";

interface ParameterCardProps {
    name: string;
    value: number;
    unit: string;
    code: string;
    threshold?: number;
    history?: { date: string; value: number }[];
    color?: string;
}

function ParameterCardComponent({ name, value, unit, code, threshold, history, color = "#3b82f6" }: ParameterCardProps) {
    // Determine icon based on parameter code or name
    const Icon = useMemo(() => {
        if (name.toLowerCase().includes("nitrate") || code === "1340") return FlaskConical;
        if (name.toLowerCase().includes("ph") || code === "1302") return Droplets;
        if (name.toLowerCase().includes("chlor") || code === "1310") return ShieldCheck;
        return Activity;
    }, [name, code]);

    // Determine status and calculate trend
    const { isWarning, statusColor, TrendIcon, trendText } = useMemo(() => {
        const warning = threshold && value > threshold;
        const color = warning ? "text-destructive" : "text-primary";

        let trendIcon = null;
        let text = "";
        if (history && history.length >= 2) {
            const recent = history[0].value;
            const previous = history[1].value;
            if (recent > previous) {
                trendIcon = TrendingUp;
                text = "En hausse";
            } else if (recent < previous) {
                trendIcon = TrendingDown;
                text = "En baisse";
            }
        }

        return { isWarning: warning, statusColor: color, TrendIcon: trendIcon, trendText: text };
    }, [threshold, value, history]);

    // Transform history for sparkline
    const sparklineData = useMemo(
        () => history?.map(h => ({ value: h.value })).reverse() || [],
        [history]
    );

    return (
        <Card className={cn(
            "hover:shadow-lg transition-all duration-300 overflow-hidden group",
            isWarning && "border-destructive/50"
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-5 pt-4">
                <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg bg-primary/10", isWarning && "bg-destructive/10")}>
                        <Icon className={cn("h-4 w-4", statusColor)} />
                    </div>
                    <CardTitle className="text-sm font-semibold text-foreground" title={name}>
                        {name}
                    </CardTitle>
                </div>
                {TrendIcon && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendIcon className="h-3 w-3" />
                        <span className="hidden sm:inline">{trendText}</span>
                    </div>
                )}
            </CardHeader>
            <CardContent className="px-5 pb-4">
                <div className="flex items-end justify-between gap-4">
                    {/* Value */}
                    <div>
                        <div className="text-3xl font-bold tracking-tight text-foreground">
                            {value}
                            <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
                        </div>
                        {threshold && (
                            <p className={cn("text-xs mt-1", isWarning ? "text-destructive" : "text-muted-foreground")}>
                                {isWarning ? `Dépasse le seuil (${threshold})` : `Seuil: ${threshold}`}
                            </p>
                        )}
                    </div>

                    {/* Sparkline */}
                    {sparklineData.length >= 2 && (
                        <div className="w-24 h-10 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Sparkline data={sparklineData} color={isWarning ? "#ef4444" : color} />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export const ParameterCard = memo(ParameterCardComponent);

