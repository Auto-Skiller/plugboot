"use client";

import { Card, CardContent } from "@/components/core/ui/card";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import { TrendingUp, AlertTriangle, ArrowRight, Package, History, Sparkles, RotateCcw } from "lucide-react";
import { Product } from "./ProductCard";
import { StockHistoryTable, StockMovement } from "./StockHistoryTable";
import { cn } from "@/lib/utils";

interface TopProduct {
    id: string;
    name: string;
    sales: number;
    revenue: number;
    trend: string;
}

interface ProductReturnRate {
    name: string;
    sold: number;
    returned: number;
    returnRate: number;
    reason: string;
}

interface InventoryAiScoreProps {
    products?: Product[];
    topProducts?: TopProduct[];
    movements?: StockMovement[];
    returnRates?: ProductReturnRate[];
    lowStockThreshold?: number;
}

export default function InventoryAiScore({
    products = [],
    topProducts = [],
    movements = [],
    returnRates = [],
    lowStockThreshold = 10
}: InventoryAiScoreProps) {
    const lowStockProducts = products.filter(p => p.stock <= lowStockThreshold);
    const highReturnProducts = returnRates.filter(p => p.returnRate > 10);

    // Calculate AI Score based on inventory health metrics
    const calculateScore = () => {
        if (products.length === 0) return 82; // Default score

        const lowStockRatio = lowStockProducts.length / products.length;
        const healthyStockRatio = 1 - lowStockRatio;

        // Base score from healthy stock ratio (max 50 points)
        let score = Math.round(healthyStockRatio * 50);

        // Bonus for having top performers (max 20 points)
        const topPerformersBonus = Math.min(topProducts.length * 4, 20);
        score += topPerformersBonus;

        // Penalty for high return rates (deduct up to 15 points)
        if (returnRates.length > 0) {
            const avgReturnRate = returnRates.reduce((acc, p) => acc + p.returnRate, 0) / returnRates.length;
            const returnPenalty = Math.min(Math.round(avgReturnRate), 15);
            score -= returnPenalty;
        }

        // Base points (15 points for having any products)
        if (products.length > 0) score += 15;

        // Bonus for stock activity (up to 10 points)
        if (movements.length > 0) score += Math.min(movements.length * 2, 10);

        return Math.max(0, Math.min(score, 100));
    };

    const aiScore = calculateScore();

    // Score color based on value
    const getScoreColor = () => {
        if (aiScore >= 80) return "text-green-600 dark:text-green-400";
        if (aiScore >= 60) return "text-amber-600 dark:text-amber-400";
        return "text-red-600 dark:text-red-400";
    };

    return (
        <Card className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/10 dark:to-blue-900/10 border-indigo-200/60 dark:border-indigo-800/30">
            <CardContent className="p-5 space-y-5">
                {/* AI Score Badge - Compact inline display */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100/80 dark:bg-indigo-900/30 border border-indigo-200/60 dark:border-indigo-700/50">
                            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">AI Score</span>
                            <span className={`text-lg font-bold ${getScoreColor()}`}>{aiScore}</span>
                            <span className="text-xs text-muted-foreground">/100</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{products.length} products</span>
                        <span>•</span>
                        <span>{lowStockProducts.length} low stock</span>
                        {highReturnProducts.length > 0 && (
                            <>
                                <span>•</span>
                                <span className="text-destructive">{highReturnProducts.length} high returns</span>
                            </>
                        )}
                    </div>
                </div>

                {/* ══════════════════════════════════════════════
                    TOP PERFORMERS / PRODUITS LES PLUS VENDUS
                ═══════════════════════════════════════════════ */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-semibold">Produits Les Plus Vendus</span>
                            {topProducts.length > 0 && (
                                <Badge variant="outline" className="text-[10px] px-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                                    {topProducts.length} top performers
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {topProducts.length > 0
                                ? "Driving 80% of revenue"
                                : "No sales data yet"}
                        </p>
                    </div>

                    {topProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                            {topProducts.slice(0, 5).map((product, index) => (
                                <div
                                    key={product.id}
                                    className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-green-100/60 dark:border-green-800/40 hover:border-green-300 dark:hover:border-green-600 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-medium text-green-600 dark:text-green-400">#{index + 1}</span>
                                        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                                            {product.trend}
                                        </Badge>
                                    </div>
                                    <p className="font-medium text-xs truncate" title={product.name}>{product.name}</p>
                                    <div className="flex items-baseline gap-1 mt-0.5">
                                        <span className="text-sm font-bold text-green-700 dark:text-green-300">{product.sales}</span>
                                        <span className="text-[10px] text-muted-foreground">sales</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 rounded-lg bg-white/60 dark:bg-white/5 border border-dashed border-green-200 dark:border-green-800/50 text-center">
                            <p className="text-xs text-muted-foreground">Start tracking product sales to see top performers</p>
                        </div>
                    )}
                </div>

                <div className="border-t border-indigo-100 dark:border-indigo-800/30" />

                {/* ══════════════════════════════════════════════
                    STOCK HEALTH / LOW STOCK ALERTS
                ═══════════════════════════════════════════════ */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className={`h-4 w-4 ${lowStockProducts.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`} />
                            <span className="text-sm font-semibold">Stock Health</span>
                            <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 ${lowStockProducts.length > 0
                                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                        : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                                    }`}
                            >
                                {lowStockProducts.length > 0
                                    ? `${lowStockProducts.length} alerts`
                                    : 'All healthy'}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {lowStockProducts.length > 0
                                ? "Action recommended"
                                : "All levels optimal"}
                        </p>
                    </div>

                    {lowStockProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {lowStockProducts.slice(0, 6).map(product => (
                                    <div
                                        key={product.id}
                                        className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/40"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {product.image && (
                                                <div className="h-8 w-8 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                                                    <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-medium text-xs truncate">{product.name}</p>
                                                <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                                    Only {product.stock} left
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" className="h-6 text-[10px] px-2 border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex-shrink-0">
                                            Restock
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            {lowStockProducts.length > 6 && (
                                <Button variant="ghost" className="w-full text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-100/50 h-7">
                                    View all {lowStockProducts.length} alerts <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                            )}
                        </>
                    ) : (
                        <div className="p-4 rounded-lg bg-green-50/60 dark:bg-green-900/10 border border-green-200/60 dark:border-green-800/40 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <p className="text-xs text-green-700 dark:text-green-400 font-medium">All stock levels are healthy</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-indigo-100 dark:border-indigo-800/30" />

                {/* ══════════════════════════════════════════════
                    RETURN RATE ANALYSIS
                ═══════════════════════════════════════════════ */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <RotateCcw className={`h-4 w-4 ${highReturnProducts.length > 0 ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`} />
                            <span className="text-sm font-semibold">Return Rate Analysis</span>
                            <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 ${highReturnProducts.length > 0
                                        ? 'bg-red-50 dark:bg-red-900/20 text-destructive border-red-200 dark:border-red-800'
                                        : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800'
                                    }`}
                            >
                                {highReturnProducts.length > 0
                                    ? `${highReturnProducts.length} high return`
                                    : 'Healthy rates'}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {returnRates.length > 0
                                ? `${returnRates.length} products tracked`
                                : "No return data"}
                        </p>
                    </div>

                    {returnRates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {returnRates.slice(0, 6).map((product, idx) => (
                                <div
                                    key={product.name}
                                    className={cn(
                                        "p-2.5 rounded-lg border transition-colors",
                                        product.returnRate > 10
                                            ? "bg-red-50/80 dark:bg-red-900/10 border-red-200/60 dark:border-red-800/40"
                                            : "bg-white/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/40"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <Badge variant="outline" className="h-4 w-4 p-0 flex items-center justify-center rounded-full text-[9px]">
                                                    {idx + 1}
                                                </Badge>
                                                <p className="font-medium text-xs truncate" title={product.name}>{product.name}</p>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-0.5 pl-5">
                                                {product.reason}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={product.returnRate > 10 ? "destructive" : product.returnRate > 5 ? "secondary" : "default"}
                                            className="text-[10px] whitespace-nowrap flex-shrink-0"
                                        >
                                            {product.returnRate > 10 && <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />}
                                            {product.returnRate.toFixed(1)}%
                                        </Badge>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between pl-5 text-[10px]">
                                        <span className="text-muted-foreground">Volume:</span>
                                        <span className="font-medium">
                                            {product.sold} sold / <span className="text-destructive">{product.returned} returns</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 rounded-lg bg-white/60 dark:bg-white/5 border border-dashed border-slate-200 dark:border-slate-800/50 text-center">
                            <p className="text-xs text-muted-foreground">No return data available yet</p>
                        </div>
                    )}
                    {returnRates.length > 6 && (
                        <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-foreground h-7">
                            View all {returnRates.length} products <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                    )}
                </div>

                <div className="border-t border-indigo-100 dark:border-indigo-800/30" />

                {/* ══════════════════════════════════════════════
                    RECENT MOVEMENTS
                ═══════════════════════════════════════════════ */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold">Recent Movements</span>
                            {movements.length > 0 && (
                                <Badge variant="outline" className="text-[10px] px-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                    {movements.length} recorded
                                </Badge>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary h-7">
                            View All History
                        </Button>
                    </div>

                    {movements.length > 0 ? (
                        <div className="rounded-lg border border-blue-100/60 dark:border-blue-800/40 overflow-hidden bg-white/60 dark:bg-slate-900/40">
                            <div className="max-h-[280px] overflow-auto">
                                <StockHistoryTable movements={movements.slice(0, 8)} compact />
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-lg bg-white/60 dark:bg-white/5 border border-dashed border-blue-200 dark:border-blue-800/50 text-center">
                            <p className="text-xs text-muted-foreground">No stock movements recorded yet</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
