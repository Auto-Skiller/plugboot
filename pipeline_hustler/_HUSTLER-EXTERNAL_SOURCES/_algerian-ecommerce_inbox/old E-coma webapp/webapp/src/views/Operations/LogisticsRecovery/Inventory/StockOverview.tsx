"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { BarChart3, History, Package, AlertTriangle } from "lucide-react";
import { StockHistoryTable, StockMovement } from "./StockHistoryTable";
import { Product } from "./ProductCard";
import { Button } from "@/components/core/ui/button";

interface StockOverviewProps {
    products?: Product[];
    movements?: StockMovement[];
}

// Default mock data when props are not provided
const DEFAULT_PRODUCTS: Product[] = [
    { id: "1", name: "Product A", price: 2500, stock: 45, sku: "SKU-001", variants: [] },
    { id: "2", name: "Product B", price: 1800, stock: 3, sku: "SKU-002", variants: [] },
    { id: "3", name: "Product C", price: 5200, stock: 22, sku: "SKU-003", variants: [] },
];

const DEFAULT_MOVEMENTS: StockMovement[] = [
    {
        id: "1",
        createdAt: "2026-01-06T10:00:00",
        product: DEFAULT_PRODUCTS[0],
        type: "in",
        quantity: 50,
        reason: "Restocked",
        user: { name: "Admin", initials: "AD" }
    },
    {
        id: "2",
        createdAt: "2026-01-05T14:30:00",
        product: DEFAULT_PRODUCTS[1],
        type: "out",
        quantity: 10,
        reason: "Sold",
        user: { name: "Team", initials: "TM" }
    },
];

export function StockOverview({ products = DEFAULT_PRODUCTS, movements = DEFAULT_MOVEMENTS }: StockOverviewProps) {
    // Calculate Metrics
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.stock <= 5).length;
    const recentActivityCount = movements.length; // Simplified for mock

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-indigo-500" />
                    Stock Overview
                </h2>
                <Button variant="outline" size="sm" className="gap-2">
                    <History className="h-4 w-4" />
                    Export Report
                </Button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-950 border-indigo-100 dark:border-indigo-900/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Total Inventory Value</p>
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                                <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                            {totalValue.toLocaleString()} DA
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across {totalProducts} products
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-950 border-blue-100 dark:border-blue-900/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {totalProducts}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            +2 new this week
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-950 border-amber-100 dark:border-amber-900/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Low Stock Alerts</p>
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                            {lowStockCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Items below threshold
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-950 border-emerald-100 dark:border-emerald-900/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <History className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                            {recentActivityCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Movements recorded
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Dashboard Grid - Recent Stock History (Full Width since Low Stock & Top Products moved to AI Score) */}
            <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <History className="h-4 w-4 text-blue-500" />
                        Recent Movements
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
                        View All History
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="max-h-[400px] overflow-auto">
                        <StockHistoryTable movements={movements.slice(0, 8)} compact />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
