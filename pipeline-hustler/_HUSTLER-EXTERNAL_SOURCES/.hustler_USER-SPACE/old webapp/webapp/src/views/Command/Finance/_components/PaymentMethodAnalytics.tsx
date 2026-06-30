"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/core/ui/table";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock Data for Payment Method Analytics
const PAYMENT_METHOD_DATA = [
    {
        method: "COD (Cash)",
        orders: 820,
        percentage: 82.0,
        confirmationRate: 75,
        returnRate: 12,
        avgOrderValue: 4200,
    },
    {
        method: "Edahabia",
        orders: 120,
        percentage: 12.0,
        confirmationRate: 92,
        returnRate: 4,
        avgOrderValue: 5800,
    },
    {
        method: "BaridiPay",
        orders: 45,
        percentage: 4.5,
        confirmationRate: 95,
        returnRate: 3,
        avgOrderValue: 6200,
    },
    {
        method: "Bank Transfer",
        orders: 15,
        percentage: 1.5,
        confirmationRate: 98,
        returnRate: 1,
        avgOrderValue: 7500,
    },
];

// Data for trend chart (showing shift toward digital payments over time)
const PAYMENT_TREND_DATA = [
    { month: "Jan", COD: 90, Digital: 10 },
    { month: "Feb", COD: 88, Digital: 12 },
    { month: "Mar", COD: 87, Digital: 13 },
    { month: "Apr", COD: 85, Digital: 15 },
    { month: "May", COD: 84, Digital: 16 },
    { month: "Jun", COD: 82, Digital: 18 },
];

export function PaymentMethodAnalytics() {
    const totalOrders = PAYMENT_METHOD_DATA.reduce((acc, method) => acc + method.orders, 0);

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-emerald-500" />
                    Payment Method Analytics
                </CardTitle>
                <CardDescription>
                    Track payment type adoption and performance
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Performance Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Payment Method</TableHead>
                                <TableHead className="text-center">Orders</TableHead>
                                <TableHead className="text-center">% of Total</TableHead>
                                <TableHead className="text-center">Confirm Rate</TableHead>
                                <TableHead className="text-center">Return Rate</TableHead>
                                <TableHead className="text-right">Avg. Order Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {PAYMENT_METHOD_DATA.map((method) => (
                                <TableRow key={method.method}>
                                    <TableCell className="font-medium">{method.method}</TableCell>
                                    <TableCell className="text-center">{method.orders}</TableCell>
                                    <TableCell className="text-center text-muted-foreground">
                                        {method.percentage.toFixed(1)}%
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={method.confirmationRate >= 90 ? "text-green-600 font-medium" : ""}>
                                            {method.confirmationRate}%
                                            {method.confirmationRate >= 90 && (
                                                <TrendingUp className="inline ml-1 h-3 w-3" />
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={method.returnRate <= 5 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                            {method.returnRate}%
                                            {method.returnRate > 10 && (
                                                <TrendingUp className="inline ml-1 h-3 w-3 text-red-500" />
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        {method.avgOrderValue.toLocaleString()} DZD
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Insight Box */}
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        Key Insight
                    </h4>
                    <p className="text-sm text-muted-foreground">
                        Digital payment methods (Edahabia, BaridiPay) show{" "}
                        <span className="font-semibold text-foreground">significantly higher confirmation rates</span> and{" "}
                        <span className="font-semibold text-foreground">lower return rates</span> compared to COD.
                        Consider incentivizing digital payments to improve operational efficiency.
                    </p>
                </div>

                {/* Trend Chart */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Payment Method Trend (% of Orders)</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={PAYMENT_TREND_DATA}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="month" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))'
                                    }}
                                    formatter={(value) => `${value}%`}
                                />
                                <Legend />
                                <Bar dataKey="COD" fill="#94a3b8" name="COD" />
                                <Bar dataKey="Digital" fill="#10b981" name="Digital Payments" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
