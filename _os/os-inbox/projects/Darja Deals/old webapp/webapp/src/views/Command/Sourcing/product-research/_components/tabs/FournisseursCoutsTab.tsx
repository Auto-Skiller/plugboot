"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    Globe,
    DollarSign,
    Calculator,
    Ship,
    Clock
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import SupplierDatabase from "../SupplierDatabase";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Cost calculation example
const costBreakdown = {
    productCost: "2,500 DA",
    shipping: "1,200 DA",
    customs: "400 DA",
    localDelivery: "600 DA",
    totalLanded: "4,700 DA",
    suggestedPrice: "8,500 DA",
    margin: "45%",
};

// Quick supplier stats
const supplierStats = {
    verifiedSuppliers: 156,
    avgLeadTime: "18-25 jours",
    topCategories: ["Électronique", "Mode", "Maison"],
    avgSavings: "35%",
};

export function FournisseursCoutsTab() {
    return (
        <div className="space-y-6">
            {/* Supplier Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-5 w-5 text-blue-500" />
                            <span className="text-sm text-muted-foreground">Fournisseurs Vérifiés</span>
                        </div>
                        <p className="text-2xl font-bold">{supplierStats.verifiedSuppliers}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-5 w-5 text-orange-500" />
                            <span className="text-sm text-muted-foreground">Délai Moyen</span>
                        </div>
                        <p className="text-2xl font-bold">{supplierStats.avgLeadTime}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <span className="text-sm text-muted-foreground">Économies Moy.</span>
                        </div>
                        <p className="text-2xl font-bold">{supplierStats.avgSavings}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Ship className="h-5 w-5 text-purple-500" />
                            <span className="text-sm text-muted-foreground">Top Catégories</span>
                        </div>
                        <p className="font-medium text-sm">{supplierStats.topCategories.join(", ")}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Cost Calculator Preview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                        Calculateur de Coût Rendu (Landed Cost)
                    </CardTitle>
                    <CardDescription>Exemple pour un produit typique importé de Chine</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg border">
                            <p className="text-xs text-muted-foreground">Coût Produit</p>
                            <p className="text-lg font-bold">{costBreakdown.productCost}</p>
                        </div>
                        <div className="p-3 rounded-lg border">
                            <p className="text-xs text-muted-foreground">Shipping</p>
                            <p className="text-lg font-bold">{costBreakdown.shipping}</p>
                        </div>
                        <div className="p-3 rounded-lg border">
                            <p className="text-xs text-muted-foreground">Douane</p>
                            <p className="text-lg font-bold">{costBreakdown.customs}</p>
                        </div>
                        <div className="p-3 rounded-lg border">
                            <p className="text-xs text-muted-foreground">Livraison Locale</p>
                            <p className="text-lg font-bold">{costBreakdown.localDelivery}</p>
                        </div>
                    </div>
                    <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Coût Total Rendu</p>
                                <p className="text-2xl font-bold">{costBreakdown.totalLanded}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Prix Suggéré → Marge</p>
                                <p className="text-2xl font-bold text-green-600">{costBreakdown.suggestedPrice} → {costBreakdown.margin}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Supplier Database */}
            <FeatureCluster
                title="Base de Fournisseurs"
                icon={<Globe className="h-5 w-5" />}
                storageKey="research-suppliers"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-green))]"
            >
                <SupplierDatabase />
            </FeatureCluster>
        </div>
    );
}
