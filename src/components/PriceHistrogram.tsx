import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

interface PriceBucket {
    range: string;   // e.g. "$0‑50"
    count: number;
}

interface PriceHistogramProps {
    data: PriceBucket[];
    title?: string;
    height?: number;         // default 120
    color?: string;          // default "var(--primary)"
}

export default function PriceHistogram({
    data,
    title = "Price Distribution",
    height = 120,
    color = "var(--primary)",
}: PriceHistogramProps) {
    // Avoid empty chart errors
    const chartData = useMemo(() => (data.length ? data : [{ range: "No data", count: 0 }]), [data]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
                <div style={{ height }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="range" tick={false} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--background)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                }}
                            />
                            <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}