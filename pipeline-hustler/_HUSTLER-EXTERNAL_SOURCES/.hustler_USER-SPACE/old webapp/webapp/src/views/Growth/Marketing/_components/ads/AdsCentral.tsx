"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Input } from "@/components/core/ui/input";
import {
    LayoutGrid, Play, Pause, Edit, Copy, Trash2,
    TrendingUp, TrendingDown, DollarSign, Eye, MousePointer,
    Filter, Search, MoreVertical
} from "lucide-react";

// Mock ads data
const MOCK_ADS = [
    {
        id: "ad_1",
        name: "Summer Collection - Carousel",
        platform: "Facebook",
        status: "active",
        spent: "45,000 DA",
        impressions: "125K",
        clicks: "3.2K",
        ctr: "2.56%",
        roas: 3.2,
        trend: "up"
    },
    {
        id: "ad_2",
        name: "Flash Sale - Video",
        platform: "Instagram",
        status: "active",
        spent: "28,000 DA",
        impressions: "89K",
        clicks: "2.1K",
        ctr: "2.36%",
        roas: 4.1,
        trend: "up"
    },
    {
        id: "ad_3",
        name: "New Arrivals - Image",
        platform: "Facebook",
        status: "paused",
        spent: "12,000 DA",
        impressions: "32K",
        clicks: "450",
        ctr: "1.41%",
        roas: 1.8,
        trend: "down"
    },
    {
        id: "ad_4",
        name: "Product Demo - TikTok",
        platform: "TikTok",
        status: "active",
        spent: "18,500 DA",
        impressions: "210K",
        clicks: "5.8K",
        ctr: "2.76%",
        roas: 5.2,
        trend: "up"
    },
];

export default function AdsCentral() {
    const [ads, setAds] = useState(MOCK_ADS);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");

    const filteredAds = ads.filter(ad => {
        const matchesSearch = ad.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || ad.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const toggleAdStatus = (id: string) => {
        setAds(prev => prev.map(ad =>
            ad.id === id
                ? { ...ad, status: ad.status === "active" ? "paused" : "active" }
                : ad
        ));
    };

    const totalSpent = ads.filter(a => a.status === "active")
        .reduce((sum, a) => sum + parseInt(a.spent.replace(/,/g, "").replace(" DA", "")), 0);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <LayoutGrid className="h-5 w-5 text-indigo-500" />
                            Ads Central
                        </CardTitle>
                        <CardDescription>
                            Manage all your active advertising campaigns
                        </CardDescription>
                    </div>
                    <Button className="gap-2">+ New Ad</Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
                        <p className="text-xs text-muted-foreground mb-1">Active Ads</p>
                        <p className="text-2xl font-bold text-blue-600">{ads.filter(a => a.status === "active").length}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200">
                        <p className="text-xs text-muted-foreground mb-1">Total Spent (Today)</p>
                        <p className="text-2xl font-bold text-green-600">{totalSpent.toLocaleString()} DA</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200">
                        <p className="text-xs text-muted-foreground mb-1">Avg. ROAS</p>
                        <p className="text-2xl font-bold text-purple-600">3.5x</p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200">
                        <p className="text-xs text-muted-foreground mb-1">Total Clicks</p>
                        <p className="text-2xl font-bold text-orange-600">11.5K</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search ads..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(["all", "active", "paused"] as const).map(status => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter(status)}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Ads Table */}
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-3 text-xs font-medium">Ad Name</th>
                                <th className="text-left p-3 text-xs font-medium">Platform</th>
                                <th className="text-left p-3 text-xs font-medium">Status</th>
                                <th className="text-right p-3 text-xs font-medium">Spent</th>
                                <th className="text-right p-3 text-xs font-medium">CTR</th>
                                <th className="text-right p-3 text-xs font-medium">ROAS</th>
                                <th className="text-center p-3 text-xs font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAds.map((ad) => (
                                <tr key={ad.id} className="border-t hover:bg-muted/30">
                                    <td className="p-3">
                                        <p className="font-medium text-sm">{ad.name}</p>
                                    </td>
                                    <td className="p-3">
                                        <Badge variant="outline">{ad.platform}</Badge>
                                    </td>
                                    <td className="p-3">
                                        <Badge variant={ad.status === "active" ? "default" : "secondary"}>
                                            {ad.status}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-right font-medium">{ad.spent}</td>
                                    <td className="p-3 text-right">
                                        <span className="flex items-center justify-end gap-1">
                                            {ad.ctr}
                                            {ad.trend === "up" ? (
                                                <TrendingUp className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <TrendingDown className="h-3 w-3 text-red-500" />
                                            )}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right font-bold text-green-600">{ad.roas}x</td>
                                    <td className="p-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => toggleAdStatus(ad.id)}
                                            >
                                                {ad.status === "active" ? (
                                                    <Pause className="h-4 w-4" />
                                                ) : (
                                                    <Play className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Copy className="h-4 w-4" />
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
