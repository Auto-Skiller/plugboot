"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Progress } from "@/components/core/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/core/ui/alert";
import { Calculator, AlertCircle, FileStack, Calendar, Bell } from "lucide-react";
import { Button } from "@/components/core/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock Data for IFU Calculator
const IFU_DATA = {
    currentYearRevenue: 3850000,
    maxRevenueThreshold: 5000000,
    taxRate: 0.005, // 0.5%
    monthlyRevenue: [
        { month: "Jan", amount: 450000 },
        { month: "Feb", amount: 480000 },
        { month: "Mar", amount: 520000 },
        { month: "Apr", amount: 490000 },
        { month: "May", amount: 510000 },
        { month: "Jun", amount: 550000 },
        { month: "Jul", amount: 420000 },
        { month: "Aug", amount: 430000 }, // Current month part-way
    ],
    quarterlyDeadlines: [
        { quarter: "Q1", dueDate: "2024-04-20", status: "paid" },
        { quarter: "Q2", dueDate: "2024-07-20", status: "paid" },
        { quarter: "Q3", dueDate: "2024-10-20", status: "upcoming" },
        { quarter: "Q4", dueDate: "2025-01-20", status: "future" },
    ]
};

export function IFUCalculator() {
    const taxOwed = IFU_DATA.currentYearRevenue * IFU_DATA.taxRate;
    const thresholdProgress = (IFU_DATA.currentYearRevenue / IFU_DATA.maxRevenueThreshold) * 100;
    const remainingQuota = IFU_DATA.maxRevenueThreshold - IFU_DATA.currentYearRevenue;
    const isApproachingThreshold = thresholdProgress > 80;

    // Calculate quarterly tax amounts
    const quarterlyTax = taxOwed / 4;
    const upcomingDeadline = IFU_DATA.quarterlyDeadlines.find(d => d.status === "upcoming");

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-indigo-500" />
                    IFU Tax Calculator
                </CardTitle>
                <CardDescription>
                    Track Auto-Entrepreneur tax obligations (0.5% IFU)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Revenue Overview */}
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs text-muted-foreground">Annual Revenue (YTD)</p>
                        <p className="text-xl font-bold">{IFU_DATA.currentYearRevenue.toLocaleString()} DZD</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Tax Owed (0.5%)</p>
                        <div className="text-lg font-bold text-indigo-600">
                            {taxOwed.toLocaleString()} DZD
                        </div>
                    </div>
                </div>

                {/* Threshold Progress */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0 DZD</span>
                        <span>Limit: {IFU_DATA.maxRevenueThreshold.toLocaleString()} DZD</span>
                    </div>
                    <Progress
                        value={thresholdProgress}
                        className={`h-2 ${isApproachingThreshold ? "[&>div]:bg-amber-500" : "[&>div]:bg-indigo-500"}`}
                    />
                    <p className="text-xs text-center text-muted-foreground">
                        {thresholdProgress.toFixed(1)}% used • {remainingQuota.toLocaleString()} DZD remaining
                    </p>
                </div>

                {isApproachingThreshold && (
                    <Alert variant="destructive" className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 text-amber-800 dark:text-amber-200 py-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <AlertTitle className="text-sm">Approaching Threshold</AlertTitle>
                        <AlertDescription className="text-xs">
                            Nearing 5M DZD limit. Consider consulting an accountant.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Monthly Revenue Breakdown */}
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Monthly Revenue
                    </h4>
                    <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={IFU_DATA.monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000)}k`} />
                                <Tooltip
                                    formatter={(value: number) => `${value.toLocaleString()} DZD`}
                                    contentStyle={{ fontSize: 12 }}
                                />
                                <Bar dataKey="amount" fill="#6366f1" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quarterly Payment Reminders */}
                <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-xs font-semibold flex items-center gap-1">
                        <Bell className="h-3 w-3" />
                        Quarterly Payment Deadlines
                    </h4>
                    <div className="grid grid-cols-4 gap-1">
                        {IFU_DATA.quarterlyDeadlines.map((deadline) => (
                            <div
                                key={deadline.quarter}
                                className={`text-center p-2 rounded text-xs ${deadline.status === "paid"
                                    ? "bg-green-100 dark:bg-green-950/30 text-green-700"
                                    : deadline.status === "upcoming"
                                        ? "bg-amber-100 dark:bg-amber-950/30 text-amber-700 ring-1 ring-amber-300"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                <p className="font-semibold">{deadline.quarter}</p>
                                <p className="text-[10px]">{deadline.dueDate}</p>
                                <p className="text-[10px] capitalize">{deadline.status}</p>
                            </div>
                        ))}
                    </div>
                    {upcomingDeadline && (
                        <p className="text-xs text-amber-600 text-center">
                            ⏰ Next payment: ~{quarterlyTax.toLocaleString()} DZD due {upcomingDeadline.dueDate}
                        </p>
                    )}
                </div>

                <Button variant="outline" size="sm" className="w-full gap-2">
                    <FileStack className="h-4 w-4" />
                    Export Tax Report
                </Button>
            </CardContent>
        </Card>
    );
}

