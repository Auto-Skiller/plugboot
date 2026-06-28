"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/core/ui/tabs";
import {
    Bell, BellOff, Trash2, Eye, Pause, Play, Download,
    TrendingUp, MessageCircle, Package, FileText, Clock
} from "lucide-react";
import { getTrackedItems, untrackItem, updateTrackingStatus, type TrackedItem } from "@/lib/tracking";

const CATEGORY_ICONS = {
    ad: TrendingUp,
    topic: MessageCircle,
    product: Package,
    report: FileText
};

export default function TrackerDashboard() {
    const [trackedItems, setTrackedItems] = useState<TrackedItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // Load tracked items on mount and set up refresh
    useEffect(() => {
        refreshTrackedItems();
    }, []);

    const refreshTrackedItems = () => {
        setTrackedItems(getTrackedItems());
    };

    // Filter items by category
    const filteredItems = selectedCategory === "all"
        ? trackedItems
        : trackedItems.filter(item => item.type === selectedCategory);

    const handleUntrack = (itemId: string) => {
        untrackItem(itemId);
        refreshTrackedItems();
    };

    const handleToggleStatus = (itemId: string, currentStatus: boolean) => {
        updateTrackingStatus(itemId, !currentStatus);
        refreshTrackedItems();
    };

    // Count by category
    const categoryCounts = {
        all: trackedItems.length,
        ad: trackedItems.filter(i => i.type === 'ad').length,
        topic: trackedItems.filter(i => i.type === 'topic').length,
        product: trackedItems.filter(i => i.type === 'product').length,
        report: trackedItems.filter(i => i.type === 'report').length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Bell className="h-5 w-5 text-orange-500" />
                        Tracker Dashboard
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Manage all your tracked items and notifications
                    </p>
                </div>
                {trackedItems.length > 0 && (
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                )}
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList>
                    <TabsTrigger value="all">
                        All ({categoryCounts.all})
                    </TabsTrigger>
                    <TabsTrigger value="ad">
                        Ads ({categoryCounts.ad})
                    </TabsTrigger>
                    <TabsTrigger value="topic">
                        Topics ({categoryCounts.topic})
                    </TabsTrigger>
                    <TabsTrigger value="product">
                        Products ({categoryCounts.product})
                    </TabsTrigger>
                    <TabsTrigger value="report">
                        Reports ({categoryCounts.report})
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Tracked Items List */}
            {filteredItems.length > 0 ? (
                <div className="grid gap-4">
                    {filteredItems.map((item) => {
                        const Icon = CATEGORY_ICONS[item.type];
                        return (
                            <div
                                key={item.id}
                                className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${!item.isActive ? 'bg-muted/30 border-dashed opacity-75' : 'bg-card border-border'}`}
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {/* Icon Box */}
                                    <div className={`p-3 rounded-xl flex-shrink-0 ${item.type === 'ad' ? 'bg-blue-100 text-blue-600' :
                                            item.type === 'topic' ? 'bg-purple-100 text-purple-600' :
                                                item.type === 'product' ? 'bg-orange-100 text-orange-600' :
                                                    'bg-gray-100 text-gray-600'
                                        }`}>
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold truncate text-base">{item.title}</h4>
                                            {!item.isActive && (
                                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Paused</Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded-full">
                                                <Clock className="h-3 w-3" />
                                                {item.frequency}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                {item.notificationMethods.browser && <Bell className="h-3 w-3 text-orange-500" />}
                                                {item.notificationMethods.email && <span className="text-xs">📧</span>}
                                            </span>
                                            <span>• Started {new Date(item.dateTracked).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions & Status */}
                                <div className="flex items-center gap-4 pl-4 border-l border-border/50 ml-4">
                                    {/* Alert Status */}
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-medium text-muted-foreground">Alerts</p>
                                        <p className="font-bold text-lg leading-none">{item.alerts.length}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 hover:bg-muted"
                                            onClick={() => handleToggleStatus(item.id, item.isActive)}
                                            title={item.isActive ? "Pause tracking" : "Resume tracking"}
                                        >
                                            {item.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => handleUntrack(item.id)}
                                            title="Untrack"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/20 text-center">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <BellOff className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                        {selectedCategory === "all"
                            ? "No tracked items yet"
                            : `No tracked ${selectedCategory}s`}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        Start tracking products, ads, or topics to receive real-time alerts on significant changes.
                    </p>
                    <Button variant="outline" onClick={() => setSelectedCategory("all")}>
                        View All Categories
                    </Button>
                </div>
            )}

            {/* Summary Stats */}
            {trackedItems.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="bg-card p-4 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Package className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Total</span>
                        </div>
                        <p className="text-3xl font-bold">{trackedItems.length}</p>
                    </div>
                    <div className="bg-card p-4 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Play className="h-4 w-4 text-green-500" />
                            <span className="text-xs font-medium uppercase tracking-wider">Active</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                            {trackedItems.filter(i => i.isActive).length}
                        </p>
                    </div>
                    <div className="bg-card p-4 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Pause className="h-4 w-4 text-orange-500" />
                            <span className="text-xs font-medium uppercase tracking-wider">Paused</span>
                        </div>
                        <p className="text-3xl font-bold text-orange-600">
                            {trackedItems.filter(i => !i.isActive).length}
                        </p>
                    </div>
                    <div className="bg-card p-4 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Bell className="h-4 w-4 text-purple-500" />
                            <span className="text-xs font-medium uppercase tracking-wider">Alerts</span>
                        </div>
                        <p className="text-3xl font-bold text-purple-600">
                            {trackedItems.reduce((sum, item) => sum + item.alerts.length, 0)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
