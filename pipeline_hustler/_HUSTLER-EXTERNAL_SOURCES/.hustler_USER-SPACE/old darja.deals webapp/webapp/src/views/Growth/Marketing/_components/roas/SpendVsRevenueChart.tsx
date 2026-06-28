"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export interface DailyFinance {
    date: string;
    adSpend: number;
    revenue: number;
    roas: number;
}

export function SpendVsRevenueChart({ data }: { data: DailyFinance[] }) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(date);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dépenses vs Revenus</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatDate}
                                className="text-xs"
                            />
                            <YAxis yAxisId="left" className="text-xs" />
                            <YAxis yAxisId="right" orientation="right" className="text-xs" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                }}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="adSpend" name="Dépenses" fill="hsl(var(--destructive))" />
                            <Bar yAxisId="left" dataKey="revenue" name="Revenus" fill="hsl(var(--chart-2))" />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="roas"
                                name="ROAS"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
