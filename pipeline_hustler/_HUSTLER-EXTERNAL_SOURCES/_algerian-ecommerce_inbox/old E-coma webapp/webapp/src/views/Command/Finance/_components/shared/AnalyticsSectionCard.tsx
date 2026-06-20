"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";

export interface AnalyticsSectionProps {
    title: string;
    value: string;
    change: number;
    icon: LucideIcon;
    chart?: { value: number }[];
}

export function AnalyticsSectionCard({
    title,
    value,
    change,
    chart,
    icon: Icon
}: AnalyticsSectionProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{value}</span>
                    <span className={cn(
                        "text-sm font-medium",
                        change >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                        {change >= 0 ? '+' : ''}{change}%
                    </span>
                </div>
                {chart && (
                    <div className="mt-4 h-16">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chart}>
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
