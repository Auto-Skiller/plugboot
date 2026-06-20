"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Product } from "./ProductCard";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";

interface LowStockAlertsProps {
    products?: Product[];
    threshold?: number;
}

// Default mock data when no products provided
const DEFAULT_PRODUCTS: Product[] = [
    { id: "1", name: "Product A", price: 2500, stock: 45, sku: "SKU-001", variants: [] },
    { id: "2", name: "Product B", price: 1800, stock: 3, sku: "SKU-002", variants: [] },
    { id: "3", name: "Product C", price: 5200, stock: 2, sku: "SKU-003", variants: [] },
];

export function LowStockAlerts({ products = DEFAULT_PRODUCTS, threshold = 5 }: LowStockAlertsProps) {
    const lowStockProducts = products.filter(p => p.stock <= threshold);

    return (
        <Card className="h-full border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-lg">
                    <AlertTriangle className="h-5 w-5" />
                    Low Stock Alerts
                    <Badge variant="outline" className="ml-auto border-amber-200 text-amber-700 bg-amber-100 dark:border-amber-800 dark:bg-amber-900 dark:text-amber-400">
                        {lowStockProducts.length} Items
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {lowStockProducts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        All stock levels are healthy.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {lowStockProducts.slice(0, 5).map(product => (
                            <div key={product.id} className="flex items-center justify-between bg-white dark:bg-slate-950 p-3 rounded-lg border border-amber-100 dark:border-amber-900/50 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 relative rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                                        {/* Placeholder or Image if available */}
                                        {product.image && <img src={product.image} alt={product.name} className="object-cover w-full h-full" />}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm line-clamp-1">{product.name}</div>
                                        <div className="text-xs text-amber-600 font-medium">
                                            Only {product.stock} left
                                        </div>
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" className="h-7 text-xs border-amber-200 hover:bg-amber-50 hover:text-amber-700">
                                    Restock
                                </Button>
                            </div>
                        ))}
                        {lowStockProducts.length > 5 && (
                            <Button variant="ghost" className="w-full text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-100/50 h-8">
                                View all {lowStockProducts.length} alerts <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
