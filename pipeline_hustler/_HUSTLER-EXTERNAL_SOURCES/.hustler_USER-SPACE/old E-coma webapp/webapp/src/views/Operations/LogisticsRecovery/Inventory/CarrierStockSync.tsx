"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import {
    Truck, Package, ArrowRightLeft,
    RefreshCw, AlertTriangle, Edit
} from "lucide-react";


interface DeliveryStock {
    companyId: string;
    companyName: string;
    logo: string;
    location: string;
    products: StockItem[];
    lastSync: string;
}

interface StockItem {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    reserved: number;
    lowStockThreshold: number;
}

const MOCK_DELIVERY_STOCKS: DeliveryStock[] = [
    {
        companyId: "yalidine",
        companyName: "Yalidine",
        logo: "🟠",
        location: "Alger Depot",
        lastSync: "10 min ago",
        products: [
            { productId: "p1", productName: "Wireless Earbuds Pro", sku: "WE-001", quantity: 25, reserved: 5, lowStockThreshold: 10 },
            { productId: "p2", productName: "Phone Case Black", sku: "PC-BLK", quantity: 48, reserved: 8, lowStockThreshold: 20 },
            { productId: "p3", productName: "USB Hub", sku: "HUB-007", quantity: 8, reserved: 2, lowStockThreshold: 15 },
        ]
    },
    {
        companyId: "zr-express",
        companyName: "ZR Express",
        logo: "🔵",
        location: "Oran Hub",
        lastSync: "25 min ago",
        products: [
            { productId: "p1", productName: "Wireless Earbuds Pro", sku: "WE-001", quantity: 15, reserved: 3, lowStockThreshold: 10 },
            { productId: "p4", productName: "Smart Watch", sku: "SW-002", quantity: 12, reserved: 4, lowStockThreshold: 8 },
        ]
    },
    {
        companyId: "maystro",
        companyName: "Maystro Delivery",
        logo: "🟢",
        location: "Constantine Center",
        lastSync: "1h ago",
        products: [
            { productId: "p2", productName: "Phone Case Black", sku: "PC-BLK", quantity: 30, reserved: 5, lowStockThreshold: 20 },
            { productId: "p5", productName: "Laptop Stand", sku: "LS-ALU", quantity: 5, reserved: 1, lowStockThreshold: 8 },
        ]
    },
];

const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity <= 0) return { label: "Out of Stock", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
    if (quantity <= threshold) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
    return { label: "In Stock", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
};

export function CarrierStockSync() {
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

    const totalAtDelivery = MOCK_DELIVERY_STOCKS.reduce((sum, ds) =>
        sum + ds.products.reduce((pSum, p) => pSum + p.quantity, 0), 0
    );

    const lowStockItems = MOCK_DELIVERY_STOCKS.flatMap(ds =>
        ds.products.filter(p => p.quantity <= p.lowStockThreshold)
    ).length;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-blue-500" />
                            Carrier Warehouse Stock
                        </CardTitle>
                        <CardDescription>Real-time stock levels at Yalidine, Maystro, and ZR Express</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                            <Package className="h-3 w-3" /> {totalAtDelivery} units total
                        </Badge>
                        {lowStockItems > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-700 gap-1">
                                <AlertTriangle className="h-3 w-3" /> {lowStockItems} low stock
                            </Badge>
                        )}
                        <Button variant="outline" size="sm" className="gap-1">
                            <ArrowRightLeft className="h-4 w-4" /> Transfer Stock
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Unified View Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
                                <Package className="h-4 w-4 text-blue-500" />
                                Unified Stock Overview
                            </h3>
                            <Button variant="outline" size="sm" className="h-8 text-xs">Download Report</Button>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Product</th>
                                        <th className="px-4 py-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-wider">Local Stock</th>
                                        <th className="px-4 py-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-wider">Yalidine</th>
                                        <th className="px-4 py-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-wider">Maystro</th>
                                        <th className="px-4 py-3 text-center font-medium text-muted-foreground text-xs uppercase tracking-wider">Total Available</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b bg-card hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3 font-medium">Wireless Earbuds Pro</td>
                                        <td className="px-4 py-3 text-center text-muted-foreground">45</td>
                                        <td className="px-4 py-3 text-center">25</td>
                                        <td className="px-4 py-3 text-center text-muted-foreground">-</td>
                                        <td className="px-4 py-3 text-center font-bold text-green-600 dark:text-green-400">70</td>
                                    </tr>
                                    <tr className="border-b bg-card hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3 font-medium">Phone Case Black</td>
                                        <td className="px-4 py-3 text-center text-muted-foreground">12</td>
                                        <td className="px-4 py-3 text-center">48</td>
                                        <td className="px-4 py-3 text-center">30</td>
                                        <td className="px-4 py-3 text-center font-bold text-green-600 dark:text-green-400">90</td>
                                    </tr>
                                    <tr className="border-b bg-card hover:bg-muted/20 transition-colors">
                                        <td className="px-4 py-3 font-medium">USB Hub</td>
                                        <td className="px-4 py-3 text-center text-muted-foreground">150</td>
                                        <td className="px-4 py-3 text-center">8</td>
                                        <td className="px-4 py-3 text-center text-muted-foreground">-</td>
                                        <td className="px-4 py-3 text-center font-bold text-green-600 dark:text-green-400">158</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="border-t border-dashed" />

                    {/* Carrier Breakdown Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
                                <Truck className="h-4 w-4 text-blue-500" />
                                Carrier Stock Breakdown
                            </h3>
                            <div className="flex gap-1">
                                <Button
                                    variant={selectedCompany === null ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setSelectedCompany(null)}
                                    className="h-7 text-xs"
                                >
                                    All
                                </Button>
                                <Button
                                    variant={selectedCompany === 'yalidine' ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setSelectedCompany('yalidine')}
                                    className="gap-1 h-7 text-xs"
                                >
                                    <span>🟠</span> Yalidine
                                </Button>
                                <Button
                                    variant={selectedCompany === 'maystro' ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setSelectedCompany('maystro')}
                                    className="gap-1 h-7 text-xs"
                                >
                                    <span>🟢</span> Maystro
                                </Button>
                                <Button
                                    variant={selectedCompany === 'zr-express' ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setSelectedCompany('zr-express')}
                                    className="gap-1 h-7 text-xs"
                                >
                                    <span>🔵</span> ZR Express
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {MOCK_DELIVERY_STOCKS
                                .filter(ds => selectedCompany ? ds.companyId === selectedCompany : true)
                                .map((ds) => (
                                    <Card key={ds.companyId} className="border bg-slate-50/50 dark:bg-slate-900/20">
                                        <CardHeader className="pb-2 p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{ds.logo}</span>
                                                    <div>
                                                        <CardTitle className="text-sm font-semibold">{ds.companyName}</CardTitle>
                                                        <p className="text-[10px] text-muted-foreground">{ds.location}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[10px] h-5 gap-1 font-normal bg-white dark:bg-slate-950">
                                                    <RefreshCw className="h-2 w-2" /> {ds.lastSync}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-3 pt-0">
                                            <div className="space-y-2 mt-2">
                                                {ds.products.map((product) => {
                                                    const status = getStockStatus(product.quantity, product.lowStockThreshold);
                                                    return (
                                                        <div
                                                            key={product.productId}
                                                            className="p-2 rounded-md bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-blue-200 dark:hover:border-blue-800 transition-colors"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium truncate">{product.productName}</p>
                                                                <p className="text-[10px] text-muted-foreground">{product.sku}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 ml-2">
                                                                <div className="text-right">
                                                                    <p className="text-xs font-bold">{product.quantity}</p>
                                                                </div>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${status.color.replace('text-', 'bg-').split(' ')[0]}`} title={status.label} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
