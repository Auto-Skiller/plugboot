"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    Search,
    Eye,
    Target,
    TrendingUp,
    TrendingDown,
    Star,
    ShoppingCart,
    Sparkles
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import ProductSearch from "@/views/Command/Sourcing/product-research/_components/ProductSearch";
import WinningProductAiScore from "@/views/Command/Sourcing/product-research/_components/WinningProductAiScore";
import TrackerDashboard from "@/views/Command/Sourcing/product-research/_components/TrackerDashboard";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Product Performance KPIs
const productKpis = [
    { label: "Vues Produits", value: "45,200", change: "+18%", icon: Eye, positive: true },
    { label: "Ajouts Panier", value: "12,800", change: "+12%", icon: ShoppingCart, positive: true },
    { label: "Taux Conversion", value: "3.2%", change: "+0.5%", icon: Target, positive: true },
    { label: "Valeur Moy. Commande", value: "8,450 DA", change: "-3%", icon: TrendingDown, positive: false },
];

// Bestseller Trends
const bestsellerTrends = [
    { name: "Écouteurs Sans Fil Pro", thisMonth: 450, lastMonth: 380, trend: "+18%", avgOrderValue: 12500 },
    { name: "Montre Connectée Series 5", thisMonth: 230, lastMonth: 195, trend: "+18%", avgOrderValue: 35000 },
    { name: "Hub USB-C 7-en-1", thisMonth: 120, lastMonth: 92, trend: "+30%", avgOrderValue: 6500 },
    { name: "Support Laptop Aluminium", thisMonth: 85, lastMonth: 78, trend: "+9%", avgOrderValue: 4500 },
    { name: "Clavier Mécanique RGB", thisMonth: 65, lastMonth: 70, trend: "-7%", avgOrderValue: 18000 },
];

export function RechercheTendancesTab() {
    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {productKpis.map((kpi) => (
                    <Card key={kpi.label} className="hover:shadow-md transition-all">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${kpi.positive ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                                <kpi.icon className={`h-5 w-5 ${kpi.positive ? 'text-blue-500' : 'text-red-500'}`} />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-xl font-bold">{kpi.value}</p>
                                    <span className={`text-xs ${kpi.positive ? "text-green-600" : "text-red-600"}`}>{kpi.change}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Split View: Search + AI Score */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Product Search */}
                <div className="xl:col-span-8">
                    <Card className="h-full shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                                Moteur de Découverte
                            </CardTitle>
                            <CardDescription>Recherche multi-plateformes ou scraping URL</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProductSearch />
                        </CardContent>
                    </Card>
                </div>

                {/* AI Score + Bestsellers */}
                <div className="xl:col-span-4 space-y-6">
                    <WinningProductAiScore />

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Star className="h-4 w-4 text-[hsl(var(--accent-orange))]" />
                                Tendances Bestsellers
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {bestsellerTrends.slice(0, 5).map((product) => (
                                    <div key={product.name} className="p-3 flex items-center justify-between hover:bg-muted/50">
                                        <div className="text-sm">
                                            <p className="font-medium line-clamp-1">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">{product.thisMonth} vendus ce mois</p>
                                        </div>
                                        <Badge variant={product.trend.startsWith("+") ? "default" : "secondary"}
                                            className={`text-[10px] ${product.trend.startsWith("+") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {product.trend}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Tracker Dashboard */}
            <FeatureCluster
                title="Suivi Actif des Produits"
                icon={<Target className="h-5 w-5" />}
                storageKey="research-tracker"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-orange))]"
            >
                <TrackerDashboard />
            </FeatureCluster>
        </div>
    );
}
