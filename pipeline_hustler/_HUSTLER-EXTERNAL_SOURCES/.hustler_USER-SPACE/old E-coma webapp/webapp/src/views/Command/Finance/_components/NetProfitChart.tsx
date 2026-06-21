"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { RevenueAreaChart } from "@/components/core/ui/charts/charts";
import { TrendingUp } from "lucide-react";

const PROFIT_DATA = [
    { name: "Jan", profit: 45000 },
    { name: "Feb", profit: 52000 },
    { name: "Mar", profit: 49000 },
    { name: "Apr", profit: 58000 },
    { name: "May", profit: 55000 },
    { name: "Jun", profit: 62000 },
    { name: "Jul", profit: 68000 },
    { name: "Aug", profit: 64000 },
    { name: "Sep", profit: 72000 },
    { name: "Oct", profit: 78000 },
    { name: "Nov", profit: 85000 },
    { name: "Dec", profit: 92000 },
];

export function NetProfitChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    Net Profit
                </CardTitle>
                <CardDescription>
                    Monthly net profit performance
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RevenueAreaChart
                    data={PROFIT_DATA}
                    dataKeys={["profit"]}
                    colors={["#10b981"]} // Emerald
                    height={300}
                    showGradient={true}
                    className="mt-2"
                />
            </CardContent>
        </Card>
    );
}
