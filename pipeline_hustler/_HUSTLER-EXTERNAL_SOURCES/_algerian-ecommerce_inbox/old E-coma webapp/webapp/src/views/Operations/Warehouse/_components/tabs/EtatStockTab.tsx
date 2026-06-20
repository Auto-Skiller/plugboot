"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import {
    Package,
    Box,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    DollarSign,
    ShoppingBag
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Product } from "@/views/Operations/LogisticsRecovery/Inventory/ProductCard";
import { InventorySplitView } from "@/views/Operations/LogisticsRecovery/Inventory/InventorySplitView";
import InventoryAiScore from "@/views/Operations/LogisticsRecovery/Inventory/InventoryAiScore";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Mock product data
const products: Product[] = [
    {
        id: "p1",
        name: "Écouteurs Sans Fil Pro",
        sku: "WE-001",
        price: 12500,
        stock: 85,
        localStock: 45,
        carrierStock: { 'yalidine': 25, 'zr-express': 15 },
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80",
        variants: [{ id: "v1", name: "Noir" }, { id: "v2", name: "Blanc" }],
        status: 'active',
        sales: 450,
    },
    {
        id: "p2",
        name: "Montre Connectée Series 5",
        sku: "SW-005",
        price: 35000,
        stock: 90,
        localStock: 12,
        carrierStock: { 'yalidine': 48, 'maystro': 30 },
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80",
        variants: [{ id: "v3", name: "44mm" }, { id: "v4", name: "40mm" }],
        status: 'active',
        sales: 230,
    },
    {
        id: "p3",
        name: "Support Laptop Aluminium",
        sku: "LS-ALU",
        price: 4500,
        stock: 8,
        localStock: 3,
        carrierStock: { 'maystro': 5 },
        image: "https://images.unsplash.com/photo-1616353071588-708dcff912e2?w=400&q=80",
        variants: [],
        status: 'active',
        sales: 85
    },
    {
        id: "p4",
        name: "Clavier Mécanique RGB",
        sku: "MK-RGB",
        price: 18000,
        stock: 8,
        localStock: 8,
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&q=80",
        variants: [{ id: "v5", name: "Blue Switch" }, { id: "v6", name: "Red Switch" }],
        status: 'draft',
        sales: 0
    },
    {
        id: "p5",
        name: "Hub USB-C 7-en-1",
        sku: "HUB-007",
        price: 6500,
        stock: 158,
        localStock: 150,
        carrierStock: { 'yalidine': 8 },
        image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&q=80",
        variants: [],
        status: 'active',
        sales: 120
    }
];

// Top products data
const topProducts = [
    { id: "p1", name: "Écouteurs Sans Fil Pro", sales: 450, revenue: 5625000, trend: "+12%" },
    { id: "p2", name: "Montre Connectée Series 5", sales: 230, revenue: 8050000, trend: "+8%" },
    { id: "p3", name: "Support Laptop Aluminium", sales: 85, revenue: 382500, trend: "+5%" },
];

// Return rates
const returnRates = [
    { name: "Enceinte Bluetooth Mini", sold: 120, returned: 18, returnRate: 15.0, reason: "Problèmes Qualité" },
    { name: "Souris Sans Fil Pro", sold: 85, returned: 10, returnRate: 11.8, reason: "Non Conforme" },
];

// Stock movements
const stockMovements = [
    { id: "m1", createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), product: products[0], type: "in" as const, quantity: 50, reason: "Achat fournisseur", user: { name: "Admin", initials: "AD" } },
    { id: "m2", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), product: products[1], type: "out" as const, quantity: 2, reason: "Vente", user: { name: "Système", initials: "SY" } },
];

// KPI Data
const stockKpis = {
    totalProducts: 156,
    totalValue: "2,450,000 DA",
    lowStock: 8,
    outOfStock: 2,
};

export function EtatStockTab() {
    return (
        <div className="space-y-6">
            {/* Stock KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Package className="h-5 w-5 text-blue-500" />
                            <span className="text-sm text-muted-foreground">Total Produits</span>
                        </div>
                        <p className="text-2xl font-bold">{stockKpis.totalProducts}</p>
                        <p className="text-xs text-muted-foreground">En catalogue</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <span className="text-sm text-muted-foreground">Valeur Stock</span>
                        </div>
                        <p className="text-2xl font-bold">{stockKpis.totalValue}</p>
                        <p className="text-xs text-[hsl(var(--accent-green))]">+5% ce mois</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background border-orange-200 dark:border-orange-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="h-5 w-5 text-orange-500" />
                            <span className="text-sm text-muted-foreground">Stock Faible</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">{stockKpis.lowStock}</p>
                        <p className="text-xs text-muted-foreground">À réapprovisionner</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background border-red-200 dark:border-red-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <span className="text-sm text-muted-foreground">Rupture Stock</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{stockKpis.outOfStock}</p>
                        <p className="text-xs text-muted-foreground">Urgent</p>
                    </CardContent>
                </Card>
            </div>

            {/* AI Inventory Score */}
            <FeatureCluster
                title="Score Inventaire IA"
                icon={<TrendingUp className="h-5 w-5" />}
                storageKey="stock-ai-score"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-purple))]"
            >
                <InventoryAiScore
                    products={products}
                    topProducts={topProducts}
                    movements={stockMovements}
                    returnRates={returnRates}
                    lowStockThreshold={10}
                />
            </FeatureCluster>

            {/* Product Operations */}
            <FeatureCluster
                title="Opérations Produits"
                icon={<ShoppingBag className="h-5 w-5" />}
                storageKey="stock-product-ops"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-blue))]"
            >
                <InventorySplitView products={products} />
            </FeatureCluster>
        </div>
    );
}
