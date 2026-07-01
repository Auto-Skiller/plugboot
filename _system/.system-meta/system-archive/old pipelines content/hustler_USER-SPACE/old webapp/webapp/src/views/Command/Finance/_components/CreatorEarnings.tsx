"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Badge } from "@/components/core/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/core/ui/table";
import { TrendingUp, Clock, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/components/core/ui/button";

// Mock Data for Creator Earnings
const INCOME_ENTRIES = [
    {
        id: "1",
        source: "Brand Deal - Tech Company",
        category: "brand_deal",
        amount: 85000,
        status: "paid",
        date: "2024-03-15",
    },
    {
        id: "2",
        source: "Affiliate - Amazon",
        category: "affiliate",
        amount: 12500,
        status: "paid",
        date: "2024-03-18",
    },
    {
        id: "3",
        source: "TikTok Creator Fund",
        category: "platform_payout",
        amount: 8200,
        status: "pending",
        date: "2024-03-20",
    },
    {
        id: "4",
        source: "Sponsored Post - Fashion Brand",
        category: "sponsored_post",
        amount: 45000,
        status: "paid",
        date: "2024-03-22",
    },
    {
        id: "5",
        source: "Meta Bonus Program",
        category: "platform_payout",
        amount: 15000,
        status: "pending",
        date: "2024-03-25",
    },
];

// Monthly summary data for chart
const MONTHLY_EARNINGS = [
    { month: "Jan", earnings: 95000 },
    { month: "Feb", earnings: 120000 },
    { month: "Mar", earnings: 165700 },
    { month: "Apr", earnings: 142000 },
    { month: "May", earnings: 178000 },
    { month: "Jun", earnings: 156000 },
];

// Yearly comparison data
const YEARLY_EARNINGS = [
    { year: "2022", earnings: 850000 },
    { year: "2023", earnings: 1450000 },
    { year: "2024 (YTD)", earnings: 856700 },
];

const CATEGORY_COLORS = {
    brand_deal: "#3b82f6",
    affiliate: "#10b981",
    platform_payout: "#8b5cf6",
    sponsored_post: "#f59e0b",
};

const CATEGORY_LABELS = {
    brand_deal: "Brand Deals",
    affiliate: "Affiliate",
    platform_payout: "Platform Payouts",
    sponsored_post: "Sponsored Posts",
};

export function CreatorEarnings() {
    const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");

    const totalEarnings = INCOME_ENTRIES.reduce((acc, entry) => acc + entry.amount, 0);
    const paidAmount = INCOME_ENTRIES.filter(e => e.status === "paid").reduce((acc, e) => acc + e.amount, 0);
    const pendingAmount = INCOME_ENTRIES.filter(e => e.status === "pending").reduce((acc, e) => acc + e.amount, 0);

    // Prepare data for pie chart
    const categoryBreakdown = Object.entries(
        INCOME_ENTRIES.reduce((acc, entry) => {
            acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
            return acc;
        }, {} as Record<string, number>)
    ).map(([category, amount]) => ({
        name: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS],
        value: amount,
        fill: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
    }));

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Creator Earnings
                </CardTitle>
                <CardDescription>
                    Track income from all sources
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-lg font-bold">{totalEarnings.toLocaleString()} DZD</p>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Paid</p>
                        <p className="text-lg font-bold text-green-600">{paidAmount.toLocaleString()}</p>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="text-lg font-bold text-amber-600">{pendingAmount.toLocaleString()}</p>
                    </div>
                </div>

                {/* Category Pie Chart */}
                <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={55}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => `${value.toLocaleString()} DZD`}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={28}
                                iconSize={8}
                                formatter={(value) => <span className="text-[10px]">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly/Yearly Summary Toggle */}
                <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold">Earnings Summary</h4>
                        <div className="flex gap-1">
                            <Button
                                size="sm"
                                variant={viewMode === "monthly" ? "default" : "outline"}
                                onClick={() => setViewMode("monthly")}
                                className="h-6 text-xs px-2"
                            >
                                Monthly
                            </Button>
                            <Button
                                size="sm"
                                variant={viewMode === "yearly" ? "default" : "outline"}
                                onClick={() => setViewMode("yearly")}
                                className="h-6 text-xs px-2"
                            >
                                Yearly
                            </Button>
                        </div>
                    </div>
                    <div className="h-28">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={viewMode === "monthly" ? MONTHLY_EARNINGS : YEARLY_EARNINGS}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey={viewMode === "monthly" ? "month" : "year"}
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000)}k`} />
                                <Tooltip
                                    formatter={(value: number) => `${value.toLocaleString()} DZD`}
                                    contentStyle={{ fontSize: 12 }}
                                />
                                <Bar dataKey="earnings" fill="#10b981" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="space-y-1">
                    <h4 className="text-xs font-semibold">Recent Payments</h4>
                    <div className="rounded-md border max-h-40 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs">Source</TableHead>
                                    <TableHead className="text-right text-xs">Amount</TableHead>
                                    <TableHead className="text-center text-xs">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {INCOME_ENTRIES.slice(0, 3).map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="py-2">
                                            <p className="font-medium text-xs">{entry.source}</p>
                                            <p className="text-[10px] text-muted-foreground">{entry.date}</p>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-xs py-2">
                                            {entry.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-center py-2">
                                            <Badge
                                                variant={entry.status === "paid" ? "default" : "secondary"}
                                                className={`text-[10px] ${entry.status === "paid" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"}`}
                                            >
                                                {entry.status === "paid" ? (
                                                    <CheckCircle className="mr-0.5 h-2 w-2" />
                                                ) : (
                                                    <Clock className="mr-0.5 h-2 w-2" />
                                                )}
                                                {entry.status === "paid" ? "Paid" : "Pending"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

