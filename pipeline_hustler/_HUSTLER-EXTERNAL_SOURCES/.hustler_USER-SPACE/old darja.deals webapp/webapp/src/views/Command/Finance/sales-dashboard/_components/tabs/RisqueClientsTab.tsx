"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import {
    ShieldAlert,
    Ban,
    AlertTriangle,
    UserX,
    Clock,
    CreditCard,
    MapPin,
    Phone,
    TrendingUp,
    History
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import { ReturnRiskCalculator } from "../ReturnRiskCalculator";
import { CustomerBlacklist } from "../CustomerBlacklist";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Mock risk data
const highRiskOrders = [
    { id: "ORD-9921", customer: "Amine K.", phone: "0555123456", wilaya: "Alger", score: 8.5, reason: "Historique retours", amount: "4,500 DA" },
    { id: "ORD-9923", customer: "Omar M.", phone: "0661789012", wilaya: "Oran", score: 7.2, reason: "Nouvelle adresse", amount: "3,200 DA" },
    { id: "ORD-9925", customer: "Youcef B.", phone: "0770456789", wilaya: "Constantine", score: 6.8, reason: "Zone à risque", amount: "2,800 DA" },
];

// Mock wilaya risk data
const wilayaRiskData = [
    { wilaya: "Alger", returnRate: 8.2, orders: 450, color: "bg-green-500" },
    { wilaya: "Oran", returnRate: 12.5, orders: 280, color: "bg-yellow-500" },
    { wilaya: "Constantine", returnRate: 15.8, orders: 190, color: "bg-orange-500" },
    { wilaya: "Annaba", returnRate: 22.1, orders: 85, color: "bg-red-500" },
    { wilaya: "Blida", returnRate: 6.4, orders: 210, color: "bg-green-500" },
];

// Risk KPIs
const riskKpis = {
    highRiskOrders: 8,
    blacklistedCustomers: 24,
    avgRiskScore: 4.2,
    upfrontPaymentRequests: 12,
};

export function RisqueClientsTab() {
    const [showUpfrontPayment, setShowUpfrontPayment] = useState(false);

    return (
        <div className="space-y-6">
            {/* Risk KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background border-orange-200 dark:border-orange-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <span className="text-sm font-medium text-muted-foreground">Commandes à Risque</span>
                        </div>
                        <p className="text-3xl font-bold text-orange-600">{riskKpis.highRiskOrders}</p>
                        <p className="text-xs text-muted-foreground mt-1">Nécessitent attention</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background border-red-200 dark:border-red-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Ban className="h-5 w-5 text-red-500" />
                            <span className="text-sm font-medium text-muted-foreground">Clients Blacklistés</span>
                        </div>
                        <p className="text-3xl font-bold text-red-600">{riskKpis.blacklistedCustomers}</p>
                        <p className="text-xs text-muted-foreground mt-1">Bloqués automatiquement</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldAlert className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-medium text-muted-foreground">Score Risque Moy.</span>
                        </div>
                        <p className="text-3xl font-bold">{riskKpis.avgRiskScore}/10</p>
                        <p className="text-xs text-[hsl(var(--accent-green))] mt-1">↓ -0.3 cette semaine</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="h-5 w-5 text-purple-500" />
                            <span className="text-sm font-medium text-muted-foreground">Paiements Anticipés</span>
                        </div>
                        <p className="text-3xl font-bold">{riskKpis.upfrontPaymentRequests}</p>
                        <p className="text-xs text-muted-foreground mt-1">Demandés ce mois</p>
                    </CardContent>
                </Card>
            </div>

            {/* High Risk Orders Alert */}
            <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-5 w-5" />
                        Commandes à Risque Élevé
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {highRiskOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="font-medium">#{order.id}</p>
                                        <p className="text-sm text-muted-foreground">{order.customer}</p>
                                    </div>
                                    <div className="hidden md:block">
                                        <p className="text-sm flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> {order.wilaya}
                                        </p>
                                        <p className="text-sm flex items-center gap-1">
                                            <Phone className="h-3 w-3" /> {order.phone}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <Badge variant="destructive" className="mb-1">
                                            Score: {order.score}/10
                                        </Badge>
                                        <p className="text-xs text-muted-foreground">{order.reason}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="text-xs">
                                            <CreditCard className="h-3 w-3 mr-1" />
                                            Paiement
                                        </Button>
                                        <Button size="sm" variant="destructive" className="text-xs">
                                            <Ban className="h-3 w-3 mr-1" />
                                            Bloquer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Risk Calculator + Blacklist */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FeatureCluster
                    title="Calculateur de Risque IA"
                    icon={<ShieldAlert className="h-5 w-5" />}
                    storageKey="sales-risk-calculator"
                    defaultExpanded={true}
                    headerClassName="bg-[hsl(var(--accent-orange))]"
                >
                    <ReturnRiskCalculator />
                </FeatureCluster>

                <FeatureCluster
                    title="Gestion Blacklist"
                    icon={<Ban className="h-5 w-5" />}
                    storageKey="sales-blacklist"
                    defaultExpanded={true}
                    headerClassName="bg-destructive"
                >
                    <CustomerBlacklist />
                </FeatureCluster>
            </div>

            {/* Wilaya Risk Heatmap */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                        Taux de Retour par Wilaya
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {wilayaRiskData.map((item) => (
                            <div key={item.wilaya} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{item.wilaya}</span>
                                    <span className="text-muted-foreground">{item.orders} commandes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} rounded-full transition-all`}
                                            style={{ width: `${Math.min(item.returnRate * 4, 100)}%` }}
                                        />
                                    </div>
                                    <span className={`text-sm font-medium ${item.returnRate > 15 ? 'text-red-500' : item.returnRate > 10 ? 'text-orange-500' : 'text-green-500'}`}>
                                        {item.returnRate}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
