import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HistoryRecord {
    date: string;
    value: number;
    conclusion: string;
}

interface HistoryChartProps {
    parameterName: string;
    unit: string;
    data: HistoryRecord[];
    threshold?: number;
    color?: string;
}

export function HistoryChart({ parameterName, unit, data, threshold, color = "var(--primary)" }: HistoryChartProps) {
    // Sort data by date ascending for the chart
    const chartData = [...data]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(d => ({
            ...d,
            formattedDate: format(new Date(d.date), 'dd/MM/yyyy', { locale: fr }),
            fullDate: format(new Date(d.date), 'd MMMM yyyy', { locale: fr })
        }));

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-base font-medium">
                    Historique : {parameterName}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id={`gradient-${parameterName}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="formattedDate"
                                tick={{ fontSize: 12 }}
                                tickMargin={10}
                            />
                            <YAxis
                                width={40}
                                tick={{ fontSize: 12 }}
                                unit={unit === "mg(N)/L" ? " mg" : ""} // Fallback for simple units
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            Date
                                                        </span>
                                                        <span className="font-bold text-muted-foreground">
                                                            {payload[0].payload.fullDate}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                            Valeur
                                                        </span>
                                                        <span className="font-bold">
                                                            {payload[0].value} {unit}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            {threshold && (
                                <ReferenceLine y={threshold} stroke="red" strokeDasharray="3 3" label={{ value: 'Seuil', fill: 'red', fontSize: 12, position: 'insideTopRight' }} />
                            )}
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                fillOpacity={1}
                                fill={`url(#gradient-${parameterName})`}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
