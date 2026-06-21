"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";

export interface SourceData {
    name: string;
    value: number;
    percentage: number;
    [key: string]: any;
}

export function TrafficSourcesChart({ data, minimal = false, hideLegend = false }: { data: SourceData[], minimal?: boolean, hideLegend?: boolean }) {
    const COLORS = [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))',
    ];

    const Content = (
        <>
            <div className={cn("w-full", minimal ? "h-full" : "h-[300px]")}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={entry.name} fill={entry.fill || COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                borderColor: "hsl(var(--border))",
                                borderRadius: "var(--radius)",
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend Table */}
            {!hideLegend && (
                <div className="mt-4 space-y-2">
                    {data.map((source, i) => (
                        <div key={source.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: source.fill || COLORS[i % COLORS.length] }}
                                />
                                <span className="text-sm">{source.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">{source.value.toLocaleString()}</span>
                                <span className="text-sm text-muted-foreground">{source.percentage}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    if (minimal) {
        return <div className="h-full">{Content}</div>;
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
                {Content}
            </CardContent>
        </Card>
    );
}
