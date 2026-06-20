"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

interface TimelineData {
    date: string;
    visitors: number;
    pageviews: number;
    sessions: number;
}

interface TrafficTimelineChartProps {
    data: TimelineData[];
}

export function TrafficTimelineChart({ data }: TrafficTimelineChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Traffic Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={2} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="pageviews" stroke="#16a34a" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
