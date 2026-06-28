"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Input } from "@/components/core/ui/input";
import {
    Truck, Package, Plus, Minus, ArrowRightLeft,
    RefreshCw, AlertTriangle, CheckCircle, Edit
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

export default function DeliveryCompanyStock() {
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [transferProduct, setTransferProduct] = useState<string | null>(null);
    const [transferQty, setTransferQty] = useState("");

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
                            Stock at Delivery Companies
                        </CardTitle>
                        <CardDescription>Manage stock at delivery partner warehouses (manual entry)</CardDescription>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MOCK_DELIVERY_STOCKS.map((ds) => (
                        <Card key={ds.companyId} className="border">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{ds.logo}</span>
                                        <div>
                                            <CardTitle className="text-sm">{ds.companyName}</CardTitle>
                                            <p className="text-xs text-muted-foreground">{ds.location}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                        <RefreshCw className="h-3 w-3" /> {ds.lastSync}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-2">
                                    {ds.products.map((product) => {
                                        const status = getStockStatus(product.quantity, product.lowStockThreshold);
                                        return (
                                            <div
                                                key={product.productId}
                                                className="p-2 rounded-lg bg-muted/50 flex items-center justify-between"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{product.productName}</p>
                                                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                                                </div>
                                                <div className="flex items-center gap-2 ml-2">
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold">{product.quantity}</p>
                                                        {product.reserved > 0 && (
                                                            <p className="text-[10px] text-muted-foreground">
                                                                {product.reserved} reserved
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Badge className={`text-[10px] ${status.color}`}>
                                                        {status.label}
                                                    </Badge>
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Quick Add */}
                                <div className="mt-3 pt-3 border-t flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                                        <Plus className="h-3 w-3" /> Add Product
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                                        <ArrowRightLeft className="h-3 w-3" /> Transfer
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
