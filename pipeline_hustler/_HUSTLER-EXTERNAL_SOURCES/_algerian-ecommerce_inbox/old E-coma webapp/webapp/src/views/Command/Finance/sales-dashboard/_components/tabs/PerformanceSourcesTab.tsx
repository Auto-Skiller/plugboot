"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    TrendingUp,
    BarChart,
    PieChart,
    Facebook,
    Instagram,
    Clock,
    Target,
    ArrowUpRight,
    Package
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { OrdersChart } from "@/views/Operations/ConfirmationCommand/_components/OrdersChart";
import { LifecycleFunnel } from "@/components/core/ui/charts/lifecycle-funnel";
import { OfflineConversionSync } from "../OfflineConversionSync";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Mock data for order sources
const ORDERS_SOURCE_DATA = [
    { name: "Facebook DM", value: 180, percentage: 40, fill: "#1877F2" },
    { name: "Instagram DM", value: 135, percentage: 30, fill: "#E4405F" },
    { name: "TikTok", value: 90, percentage: 20, fill: "#000000" },
    { name: "Autres Sources", value: 45, percentage: 10, fill: "#64748b" },
];

const TRAFFIC_SOURCES_DATA = [
    { name: "Facebook Ads", visitors: 12500, orders: 520, revenue: 2600000, conversion: 4.2 },
    { name: "Instagram Organic", visitors: 8500, orders: 340, revenue: 1700000, conversion: 4.0 },
    { name: "TikTok Ads", visitors: 6200, orders: 248, revenue: 1240000, conversion: 4.0 },
    { name: "WhatsApp Referral", visitors: 3100, orders: 186, revenue: 930000, conversion: 6.0 },
    { name: "Traffic Direct", visitors: 4800, orders: 144, revenue: 720000, conversion: 3.0 },
];

// Product return rates
const PRODUCT_RETURN_RATES = [
    { name: "Écouteurs Sans Fil Pro", returnRate: 12.5, reason: "Défectueux", sold: 450, returned: 56 },
    { name: "Montre Connectée Series 5", returnRate: 8.2, reason: "Mauvaise taille", sold: 230, returned: 19 },
    { name: "Hub USB-C 7-en-1", returnRate: 5.1, reason: "Changement d'avis", sold: 120, returned: 6 },
    { name: "Support Laptop Aluminium", returnRate: 3.2, reason: "Endommagé", sold: 85, returned: 3 },
    { name: "Clavier Mécanique", returnRate: 15.8, reason: "Non conforme", sold: 65, returned: 10 },
];

export function PerformanceSourcesTab() {
    return (
        <div className="space-y-6">
            {/* Orders Volume Chart */}
            <FeatureCluster
                title="Volume des Commandes"
                icon={<BarChart className="h-5 w-5" />}
                storageKey="sales-orders-volume"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-blue))]"
            >
                <OrdersChart />
            </FeatureCluster>

            {/* Product Return Rates */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-[hsl(var(--accent-orange))]" />
                        Taux de Retour par Produit
                    </CardTitle>
                    <CardDescription>Produits avec le plus de retours ce mois</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {PRODUCT_RETURN_RATES.map((product) => (
                            <div key={product.name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                <div className="flex-1">
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">{product.sold} vendus • {product.returned} retournés</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={product.returnRate > 10 ? "destructive" : product.returnRate > 5 ? "secondary" : "outline"}>
                                        {product.returnRate}%
                                    </Badge>
                                    <span className="text-xs text-muted-foreground w-24 text-right">{product.reason}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Traffic Sources & Conversion */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traffic Sources */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-[hsl(var(--accent-green))]" />
                            Sources de Trafic
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {TRAFFIC_SOURCES_DATA.map((source) => (
                                <div key={source.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        {source.name.includes("Facebook") && <Facebook className="h-4 w-4 text-blue-600" />}
                                        {source.name.includes("Instagram") && <Instagram className="h-4 w-4 text-pink-600" />}
                                        {source.name.includes("TikTok") && <div className="h-4 w-4 rounded bg-black" />}
                                        {source.name.includes("WhatsApp") && <div className="h-4 w-4 rounded-full bg-green-500" />}
                                        {source.name.includes("Direct") && <Target className="h-4 w-4 text-gray-500" />}
                                        <span className="text-sm font-medium">{source.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-right">
                                        <div>
                                            <p className="text-sm font-bold">{source.orders}</p>
                                            <p className="text-xs text-muted-foreground">commandes</p>
                                        </div>
                                        <Badge variant="outline" className="gap-1">
                                            <ArrowUpRight className="h-3 w-3" />
                                            {source.conversion}%
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Conversion Funnel */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-[hsl(var(--accent-purple))]" />
                            Répartition des Sources
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {ORDERS_SOURCE_DATA.map((source) => (
                                <div key={source.name} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{source.name}</span>
                                        <span className="text-muted-foreground">{source.value} commandes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{ width: `${source.percentage}%`, backgroundColor: source.fill }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium w-10">{source.percentage}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lifecycle Funnel */}
            <FeatureCluster
                title="Tunnel de Conversion"
                icon={<TrendingUp className="h-5 w-5" />}
                storageKey="sales-lifecycle-funnel"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-green))]"
            >
                <LifecycleFunnel
                    ordersSourceData={ORDERS_SOURCE_DATA}
                    trafficSourcesData={TRAFFIC_SOURCES_DATA}
                    confirmationRate={78}
                    deliverySuccess={92}
                    returnRate={8}
                    hideTrafficSection={true}
                />
            </FeatureCluster>

            {/* Offline Conversion Sync */}
            <FeatureCluster
                title="Sync Conversions Offline"
                icon={<Target className="h-5 w-5" />}
                storageKey="sales-offline-sync"
                defaultExpanded={false}
                headerClassName="bg-[hsl(var(--accent-purple))]"
            >
                <OfflineConversionSync />
            </FeatureCluster>
        </div>
    );
}
