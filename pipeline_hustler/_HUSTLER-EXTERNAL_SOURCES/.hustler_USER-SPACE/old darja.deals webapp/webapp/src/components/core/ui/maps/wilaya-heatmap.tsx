"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { wilayas, algeriaColors, type Wilaya } from "@/lib/chart-utils";
import { MapPin, TrendingUp, TrendingDown, Package, Users, Truck } from "lucide-react";

// ============================================================================
// WILAYA ORDER DATA
// ============================================================================

export interface WilayaOrderData {
    code: string;
    orders: number;
    revenue: number;
    delivered: number;
    returned: number;
    avgDeliveryDays: number;
}

// ============================================================================
// COLOR SCALE FOR HEATMAP
// ============================================================================

function getHeatmapColor(value: number, max: number): string {
    const intensity = value / max;
    if (intensity < 0.25) return algeriaColors.heatmap.low;
    if (intensity < 0.5) return algeriaColors.heatmap.medium;
    if (intensity < 0.75) return algeriaColors.heatmap.high;
    return algeriaColors.heatmap.veryHigh;
}

function getHeatmapOpacity(value: number, max: number): number {
    return 0.3 + (value / max) * 0.7;
}

// ============================================================================
// WILAYA HEATMAP (List View - works without map library)
// ============================================================================

interface WilayaHeatmapProps {
    data: WilayaOrderData[];
    onWilayaClick?: (wilaya: Wilaya) => void;
    selectedWilaya?: string;
    showMetrics?: boolean;
    className?: string;
}

export function WilayaHeatmap({
    data,
    onWilayaClick,
    selectedWilaya,
    showMetrics = true,
    className,
}: WilayaHeatmapProps) {
    const maxOrders = Math.max(...data.map(d => d.orders), 1);
    const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

    // Sort by orders descending
    const sortedData = [...data].sort((a, b) => b.orders - a.orders);

    // Group by region
    const byRegion = sortedData.reduce((acc, item) => {
        const wilaya = wilayas.find(w => w.code === item.code);
        if (wilaya) {
            const region = wilaya.region;
            if (!acc[region]) acc[region] = [];
            acc[region].push({ ...item, wilaya });
        }
        return acc;
    }, {} as Record<string, Array<WilayaOrderData & { wilaya: Wilaya }>>);

    return (
        <div className={cn("w-full space-y-6", className)}>
            {/* Summary cards */}
            {showMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border bg-card">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">Active Wilayas</span>
                        </div>
                        <p className="text-2xl font-bold">{data.length}</p>
                        <p className="text-xs text-muted-foreground">of 48 total</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Package className="h-4 w-4" />
                            <span className="text-sm">Total Orders</span>
                        </div>
                        <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm">Total Revenue</span>
                        </div>
                        <p className="text-2xl font-bold">{(totalRevenue / 1000).toFixed(0)}K DZD</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Truck className="h-4 w-4" />
                            <span className="text-sm">Avg Delivery</span>
                        </div>
                        <p className="text-2xl font-bold">
                            {(data.reduce((sum, d) => sum + d.avgDeliveryDays, 0) / data.length).toFixed(1)}d
                        </p>
                    </div>
                </div>
            )}

            {/* Top 10 table */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Top 10 Wilayas</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 px-3">#</th>
                                <th className="text-left py-2 px-3">Wilaya</th>
                                <th className="text-right py-2 px-3">Orders</th>
                                <th className="text-right py-2 px-3">Revenue</th>
                                <th className="text-right py-2 px-3">Delivered</th>
                                <th className="text-right py-2 px-3">Returned</th>
                                <th className="text-right py-2 px-3">Success</th>
                                <th className="text-right py-2 px-3">Avg Days</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.slice(0, 10).map((item, index) => {
                                const wilaya = wilayas.find(w => w.code === item.code);
                                const successRate = item.orders > 0 ? (item.delivered / item.orders) * 100 : 0;

                                return (
                                    <tr
                                        key={item.code}
                                        className={cn(
                                            "border-b hover:bg-muted/50 transition-colors cursor-pointer",
                                            selectedWilaya === item.code && "bg-primary/10"
                                        )}
                                        onClick={() => wilaya && onWilayaClick?.(wilaya)}
                                    >
                                        <td className="py-2 px-3 text-muted-foreground">{index + 1}</td>
                                        <td className="py-2 px-3">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                                                    style={{ backgroundColor: getHeatmapColor(item.orders, maxOrders) }}
                                                >
                                                    {item.code}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{wilaya?.nameFr || item.code}</p>
                                                    <p className="text-xs text-muted-foreground">{wilaya?.nameAr}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-right py-2 px-3 font-medium">{item.orders}</td>
                                        <td className="text-right py-2 px-3">{(item.revenue / 1000).toFixed(0)}K DZD</td>
                                        <td className="text-right py-2 px-3 text-green-500">{item.delivered}</td>
                                        <td className="text-right py-2 px-3 text-red-500">{item.returned}</td>
                                        <td className="text-right py-2 px-3">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                                successRate >= 90 ? "bg-green-500/20 text-green-500" :
                                                    successRate >= 80 ? "bg-yellow-500/20 text-yellow-500" :
                                                        "bg-red-500/20 text-red-500"
                                            )}>
                                                {successRate.toFixed(0)}%
                                            </span>
                                        </td>
                                        <td className="text-right py-2 px-3">{item.avgDeliveryDays.toFixed(1)}d</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Region groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(["center", "west", "east", "south"] as const).map(region => {
                    const regionData = byRegion[region] || [];
                    if (regionData.length === 0) return null;

                    const regionLabels = {
                        center: "Centre",
                        west: "Ouest",
                        east: "Est",
                        south: "Sud",
                    };

                    return (
                        <div key={region} className="space-y-2">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                {regionLabels[region]} ({regionData.length})
                            </h3>
                            <div className="space-y-1">
                                {regionData.map(({ code, orders, revenue, wilaya }) => (
                                    <button
                                        key={code}
                                        onClick={() => onWilayaClick?.(wilaya)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                                            "hover:bg-muted/50 active:scale-[0.98]",
                                            selectedWilaya === code && "ring-2 ring-primary bg-primary/10"
                                        )}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                            style={{
                                                backgroundColor: getHeatmapColor(orders, maxOrders),
                                                opacity: getHeatmapOpacity(orders, maxOrders),
                                            }}
                                        >
                                            {code}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium text-sm">{wilaya.nameFr}</p>
                                            <p className="text-xs text-muted-foreground">{wilaya.nameAr}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">{orders}</p>
                                            <p className="text-xs text-muted-foreground">{(revenue / 1000).toFixed(0)}K</p>
                                        </div>
                                        <div
                                            className="w-20 h-2 rounded-full bg-muted overflow-hidden"
                                            title={`${((orders / maxOrders) * 100).toFixed(0)}% of top`}
                                        >
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${(orders / maxOrders) * 100}%`,
                                                    backgroundColor: getHeatmapColor(orders, maxOrders),
                                                }}
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Color legend */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">Order Volume:</span>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: algeriaColors.heatmap.low }} />
                    <span className="text-xs">Low</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: algeriaColors.heatmap.medium }} />
                    <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: algeriaColors.heatmap.high }} />
                    <span className="text-xs">High</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: algeriaColors.heatmap.veryHigh }} />
                    <span className="text-xs">Very High</span>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// WILAYA DETAIL PANEL
// ============================================================================

interface WilayaDetailProps {
    wilaya: Wilaya;
    data?: WilayaOrderData;
    onClose?: () => void;
    className?: string;
}

export function WilayaDetailPanel({
    wilaya,
    data,
    onClose,
    className,
}: WilayaDetailProps) {
    const successRate = data && data.orders > 0 ? (data.delivered / data.orders) * 100 : 0;

    return (
        <div className={cn("p-4 rounded-xl border bg-card space-y-4", className)}>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-bold">{wilaya.nameFr}</h3>
                    <p className="text-muted-foreground text-sm">{wilaya.nameAr} • Code: {wilaya.code}</p>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded">
                        ✕
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Region</p>
                    <p className="font-medium capitalize">{wilaya.region}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Population</p>
                    <p className="font-medium">{(wilaya.population / 1000000).toFixed(1)}M</p>
                </div>
            </div>

            {data && (
                <>
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold mb-3">Order Statistics</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">Total Orders</p>
                                <p className="text-xl font-bold">{data.orders}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">Revenue</p>
                                <p className="text-xl font-bold">{(data.revenue / 1000).toFixed(0)}K DZD</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-500/10">
                                <p className="text-xs text-muted-foreground">Delivered</p>
                                <p className="text-xl font-bold text-green-500">{data.delivered}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-red-500/10">
                                <p className="text-xs text-muted-foreground">Returned</p>
                                <p className="text-xl font-bold text-red-500">{data.returned}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                            <p className="text-xs text-muted-foreground">Success Rate</p>
                            <p className="text-xl font-bold">{successRate.toFixed(1)}%</p>
                        </div>
                        <div className="w-24 h-3 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${successRate}%`,
                                    backgroundColor: successRate >= 90 ? "#22c55e" : successRate >= 80 ? "#f59e0b" : "#ef4444",
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-xs text-muted-foreground">Avg Delivery Time</p>
                            <p className="font-medium">{data.avgDeliveryDays.toFixed(1)} days</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ============================================================================
// DEMO DATA GENERATOR
// ============================================================================

export function generateWilayaOrderData(): WilayaOrderData[] {
    // Top wilayas with more orders
    // Top wilayas with more orders (Major cities + regional hubs)
    const topWilayas = ["16", "31", "25", "19", "09", "06", "15", "23", "05", "35", "30", "13", "14", "22", "28", "17"];

    return wilayas.map(wilaya => {
        const isTop = topWilayas.includes(wilaya.code);
        const baseOrders = isTop ? Math.floor(Math.random() * 400) + 200 : Math.floor(Math.random() * 100) + 20;
        const returned = Math.floor(baseOrders * (0.05 + Math.random() * 0.1));
        const delivered = baseOrders - returned - Math.floor(baseOrders * 0.1);

        return {
            code: wilaya.code,
            orders: baseOrders,
            revenue: baseOrders * (3000 + Math.random() * 2000),
            delivered,
            returned,
            avgDeliveryDays: 1.5 + Math.random() * 3,
        };
    });
}
