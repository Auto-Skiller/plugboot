"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import { DollarSign, AlertCircle, CheckCircle, Clock, Filter } from "lucide-react";

// Mock Payment Data
const PAYMENTS = [
    {
        id: "pay_1",
        influencer: "@fashion_dz",
        amount: "120,000 DZD",
        status: "paid",
        dueDate: "2024-12-20",
        paidDate: "2024-12-18",
        method: "CCP",
        campaign: "Winter Collection Launch"
    },
    {
        id: "pay_2",
        influencer: "@tech_reviewer_alg",
        amount: "45,000 DZD",
        status: "pending",
        dueDate: "2024-12-28",
        paidDate: null,
        method: "Baridi Mob",
        campaign: "Product Review - Smartphone"
    },
    {
        id: "pay_3",
        influencer: "@food_blogger_oran",
        amount: "15,000 DZD",
        status: "overdue",
        dueDate: "2024-12-15",
        paidDate: null,
        method: "Cash",
        campaign: "Restaurant Promo"
    },
    {
        id: "pay_4",
        influencer: "@beauty_tips_dz",
        amount: "85,000 DZD",
        status: "draft",
        dueDate: "2025-01-05",
        paidDate: null,
        method: "Bank Transfer",
        campaign: "Skincare Line Promotion"
    },
];

type PaymentStatus = "all" | "draft" | "pending" | "paid" | "overdue";

export function InfluencerPayments() {
    const [filterStatus, setFilterStatus] = useState<PaymentStatus>("all");
    const [dateRange, setDateRange] = useState<"all" | "7d" | "30d" | "90d">("all");

    const filteredPayments = PAYMENTS.filter(p => {
        // Status filter
        if (filterStatus !== "all" && p.status !== filterStatus) return false;

        // Date range filter
        if (dateRange !== "all") {
            const dueDate = new Date(p.dueDate);
            const now = new Date();
            const daysDiff = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            const rangeDays = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
            if (Math.abs(daysDiff) > rangeDays) return false;
        }

        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid": return "bg-green-500/10 text-green-600 border-green-500/30";
            case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
            case "overdue": return "bg-red-500/10 text-red-600 border-red-500/30";
            case "draft": return "bg-gray-500/10 text-gray-600 border-gray-500/30";
            default: return "bg-muted";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "paid": return <CheckCircle className="h-4 w-4" />;
            case "pending": return <Clock className="h-4 w-4" />;
            case "overdue": return <AlertCircle className="h-4 w-4" />;
            case "draft": return <Filter className="h-4 w-4" />;
            default: return null;
        }
    };

    const totalPaid = PAYMENTS.filter(p => p.status === "paid")
        .reduce((sum, p) => sum + parseInt(p.amount.replace(/,/g, "").replace(" DZD", "")), 0);

    const totalPending = PAYMENTS.filter(p => p.status === "pending")
        .reduce((sum, p) => sum + parseInt(p.amount.replace(/,/g, "").replace(" DZD", "")), 0);

    const formatNumber = (num: number) => new Intl.NumberFormat().format(num);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Influencer Payment Tracker
                </h2>
                <p className="text-sm text-muted-foreground">
                    Monitor payment status for all influencer campaigns. Keep track of who&apos;s paid, pending, and overdue.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-500/5 border-green-500/20">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
                        <p className="text-2xl font-bold text-green-600">{formatNumber(totalPaid)} DZD</p>
                        <p className="text-xs text-muted-foreground mt-1">{PAYMENTS.filter(p => p.status === "paid").length} payments</p>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-500/5 border-yellow-500/20">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">{formatNumber(totalPending)} DZD</p>
                        <p className="text-xs text-muted-foreground mt-1">{PAYMENTS.filter(p => p.status === "pending").length} payments</p>
                    </CardContent>
                </Card>
                <Card className="bg-red-500/5 border-red-500/20">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">Overdue</p>
                        <p className="text-2xl font-bold text-red-600">{PAYMENTS.filter(p => p.status === "overdue").length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Requires action</p>
                    </CardContent>
                </Card>
            </div>

            {/* Payments Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div>
                        <CardTitle className="text-lg">Payment Records</CardTitle>
                        <CardDescription>All influencer payment transactions</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="7d">Last 7 Days</SelectItem>
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                                <SelectItem value="90d">Last 90 Days</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as PaymentStatus)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Payments</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filteredPayments.map((payment) => (
                            <div
                                key={payment.id}
                                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border hover:bg-accent/50 transition-colors gap-3"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${getStatusColor(payment.status)}`}>
                                        {getStatusIcon(payment.status)}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{payment.influencer}</p>
                                        <p className="text-xs text-muted-foreground">{payment.campaign}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 md:gap-8">
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Amount</p>
                                        <p className="font-bold">{payment.amount}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                                        <p className="text-sm">{payment.dueDate}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Method</p>
                                        <p className="text-sm">{payment.method}</p>
                                    </div>
                                    <div>
                                        <Badge className={getStatusColor(payment.status)}>
                                            {payment.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
