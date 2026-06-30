"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

export interface SourceData {
    name: string;
    value: number;
    percentage: number;
    [key: string]: string | number;
}

interface TrafficSourcesChartProps {
    data: SourceData[];
    minimal?: boolean;
    hideLegend?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function TrafficSourcesChart({ data, minimal = false, hideLegend = false }: TrafficSourcesChartProps) {
    if (minimal) {
        return (
            <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={(entry.fill as string) || COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        {!hideLegend && <Legend />}
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={(entry.fill as string) || COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            {!hideLegend && <Legend />}
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
