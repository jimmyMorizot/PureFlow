import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';

interface SparklineProps {
    data: { value: number }[];
    color?: string;
    height?: number;
}

export function Sparkline({ data, color = "#3b82f6", height = 40 }: SparklineProps) {
    if (!data || data.length < 2) return null;

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
