"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { RevenueAreaChart } from "@/components/core/ui/charts";
import { DollarSign } from "lucide-react";

// Combined mock data
const FINANCIAL_DATA = [
    { name: "Jan", revenue: 65000, profit: 45000, cost: 12500, adSpend: 8500 },
    { name: "Feb", revenue: 72000, profit: 52000, cost: 14200, adSpend: 9200 },
    { name: "Mar", revenue: 69000, profit: 49000, cost: 13800, adSpend: 8800 },
    { name: "Apr", revenue: 85000, profit: 58000, cost: 15500, adSpend: 10500 },
    { name: "May", revenue: 78000, profit: 55000, cost: 14900, adSpend: 9800 },
    { name: "Jun", revenue: 95000, profit: 62000, cost: 16800, adSpend: 11200 },
    { name: "Jul", revenue: 105000, profit: 68000, cost: 18200, adSpend: 12500 },
    { name: "Aug", revenue: 98000, profit: 64000, cost: 17500, adSpend: 11800 },
    { name: "Sep", revenue: 115000, profit: 72000, cost: 19100, adSpend: 13200 },
    { name: "Oct", revenue: 125000, profit: 78000, cost: 20500, adSpend: 14500 },
    { name: "Nov", revenue: 138000, profit: 85000, cost: 22800, adSpend: 15800 },
    { name: "Dec", revenue: 155000, profit: 92000, cost: 24500, adSpend: 16900 },
];

export function RevenueProfitChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                    Financial Overview
                </CardTitle>
                <CardDescription>
                    Revenue, Net Profit, Cost & Ad Spend Analysis
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RevenueAreaChart
                    data={FINANCIAL_DATA}
                    dataKeys={["revenue", "profit", "cost", "adSpend"]}
                    colors={[
                        "#10b981", // Revenue (Emerald)
                        "#3b82f6", // Profit (Blue)
                        "#f43f5e", // Cost (Rose)
                        "#8b5cf6"  // Ad Spend (Violet)
                    ]}
                    height={350}
                    showGradient={true}
                    showLegend={true}
                    className="mt-2"
                />
            </CardContent>
        </Card>
    );
}
