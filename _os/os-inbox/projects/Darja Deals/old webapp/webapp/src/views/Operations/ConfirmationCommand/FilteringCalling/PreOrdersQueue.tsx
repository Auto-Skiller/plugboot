"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Input } from "@/components/core/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/core/ui/tabs";
import {
    Search, Filter, CheckCircle, XCircle, Phone, Clock,
    Facebook, Instagram, Music2, MoreHorizontal, Send
} from "lucide-react";

interface PreOrder {
    id: string;
    customer: string;
    phone: string;
    wilaya: string;
    products: string;
    amount: number;
    platform: "facebook" | "instagram" | "tiktok";
    status: "new" | "in_progress" | "confirmed" | "cancelled";
    createdAt: string;
    riskScore: number;
}

const MOCK_PREORDERS: PreOrder[] = [
    { id: "PRE-001", customer: "Ahmed K.", phone: "0555123456", wilaya: "Algiers", products: "2x T-Shirt", amount: 3500, platform: "facebook", status: "new", createdAt: "10 min ago", riskScore: 85 },
    { id: "PRE-002", customer: "Sara M.", phone: "0661789012", wilaya: "Oran", products: "1x Sneakers", amount: 8500, platform: "instagram", status: "new", createdAt: "25 min ago", riskScore: 72 },
    { id: "PRE-003", customer: "Yacine B.", phone: "0770345678", wilaya: "Constantine", products: "3x Dress", amount: 12000, platform: "tiktok", status: "in_progress", createdAt: "1h ago", riskScore: 45 },
    { id: "PRE-004", customer: "Nadia L.", phone: "0542901234", wilaya: "Setif", products: "1x Watch, 1x Bag", amount: 15500, platform: "facebook", status: "new", createdAt: "2h ago", riskScore: 60 },
    { id: "PRE-005", customer: "Mohamed H.", phone: "0698567890", wilaya: "Blida", products: "2x Jeans", amount: 6800, platform: "instagram", status: "in_progress", createdAt: "3h ago", riskScore: 90 },
];

const PLATFORM_ICONS = {
    facebook: <Facebook className="h-4 w-4" />,
    instagram: <Instagram className="h-4 w-4" />,
    tiktok: <Music2 className="h-4 w-4" />
};

const PLATFORM_COLORS = {
    facebook: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    instagram: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    tiktok: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400"
};

const STATUS_COLORS = {
    new: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
};

const getRiskColor = (score: number) => {
    if (score >= 75) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
};

export default function PreOrdersQueue() {
    const [searchQuery, setSearchQuery] = useState("");
    const [platformFilter, setPlatformFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("new");

    const filteredOrders = MOCK_PREORDERS.filter(order => {
        const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlatform = platformFilter === "all" || order.platform === platformFilter;
        const matchesStatus = statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesPlatform && matchesStatus;
    });

    const newCount = MOCK_PREORDERS.filter(o => o.status === "new").length;
    const inProgressCount = MOCK_PREORDERS.filter(o => o.status === "in_progress").length;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        Pre-Orders Queue
                        <Badge variant="secondary" className="ml-2">{newCount} New</Badge>
                    </CardTitle>

                    {/* Platform Filters */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant={platformFilter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPlatformFilter("all")}
                        >
                            All
                        </Button>
                        <Button
                            variant={platformFilter === "facebook" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPlatformFilter("facebook")}
                            className="gap-1"
                        >
                            <Facebook className="h-3 w-3" /> FB
                        </Button>
                        <Button
                            variant={platformFilter === "instagram" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPlatformFilter("instagram")}
                            className="gap-1"
                        >
                            <Instagram className="h-3 w-3" /> IG
                        </Button>
                        <Button
                            variant={platformFilter === "tiktok" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPlatformFilter("tiktok")}
                            className="gap-1"
                        >
                            <Music2 className="h-3 w-3" /> TT
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Status Tabs & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
                        <TabsList>
                            <TabsTrigger value="new">New ({newCount})</TabsTrigger>
                            <TabsTrigger value="in_progress">In Progress ({inProgressCount})</TabsTrigger>
                            <TabsTrigger value="all">All</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex gap-2 flex-1 md:max-w-xs">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search orders..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-2 font-medium text-sm">Order</th>
                                <th className="text-left py-3 px-2 font-medium text-sm">Platform</th>
                                <th className="text-left py-3 px-2 font-medium text-sm">Customer</th>
                                <th className="text-left py-3 px-2 font-medium text-sm hidden md:table-cell">Products</th>
                                <th className="text-right py-3 px-2 font-medium text-sm">Amount</th>
                                <th className="text-center py-3 px-2 font-medium text-sm">Risk</th>
                                <th className="text-right py-3 px-2 font-medium text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="border-b hover:bg-muted/50">
                                    <td className="py-3 px-2">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{order.id}</span>
                                            <span className="text-[10px] text-muted-foreground">{order.createdAt}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-2">
                                        <Badge className={PLATFORM_COLORS[order.platform]}>
                                            <span className="flex items-center gap-1">
                                                {PLATFORM_ICONS[order.platform]}
                                            </span>
                                        </Badge>
                                    </td>
                                    <td className="py-3 px-2">
                                        <div className="flex flex-col">
                                            <span className="text-sm">{order.customer}</span>
                                            <span className="text-[10px] text-muted-foreground">{order.wilaya}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-2 hidden md:table-cell">
                                        <span className="text-xs text-muted-foreground">{order.products}</span>
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                        <span className="font-bold text-sm">{order.amount.toLocaleString()} DA</span>
                                    </td>
                                    <td className="py-3 px-2 text-center">
                                        <span className={`font-bold text-sm ${getRiskColor(order.riskScore)}`}>
                                            {order.riskScore}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-2">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" title="Confirm">
                                                <CheckCircle className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" title="Send to Call Center">
                                                <Send className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" title="Call">
                                                <Phone className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" title="Cancel">
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
