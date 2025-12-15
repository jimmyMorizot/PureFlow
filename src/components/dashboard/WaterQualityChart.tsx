import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WaterQualityChartProps {
    data: {
        parameter: string;
        value: number;
        threshold?: number;
        unit: string;
    }[];
}

const chartConfig = {
    value: {
        label: "Valeur",
        color: "hsl(var(--chart-1))",
    },
    threshold: {
        label: "Seuil",
        color: "hsl(var(--destructive))",
    },
} satisfies ChartConfig;

export function WaterQualityChart({ data }: WaterQualityChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Analyse Graphique</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={data}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="parameter"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 10)}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="value" fill="var(--color-value)" radius={4} name="Valeur Mesurée" />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
