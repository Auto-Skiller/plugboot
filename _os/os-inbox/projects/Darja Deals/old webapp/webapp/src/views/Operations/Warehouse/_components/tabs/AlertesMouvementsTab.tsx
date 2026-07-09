"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Package,
    TrendingDown,
    History,
    Bell,
    RefreshCw
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";

// Low stock alerts
const lowStockAlerts = [
    { id: 1, name: "Support Laptop Aluminium", sku: "LS-ALU", stock: 8, threshold: 15, carrier: "Local", urgency: "high" },
    { id: 2, name: "Clavier Mécanique RGB", sku: "MK-RGB", stock: 8, threshold: 20, carrier: "Local", urgency: "high" },
    { id: 3, name: "Câble HDMI 2.1", sku: "HD-21", stock: 12, threshold: 25, carrier: "Yalidine", urgency: "medium" },
    { id: 4, name: "Chargeur Sans Fil 15W", sku: "WC-15", stock: 18, threshold: 30, carrier: "Maystro", urgency: "low" },
];

// Recent stock movements
const stockMovements = [
    { id: 1, product: "Écouteurs Sans Fil Pro", type: "in", quantity: 50, date: "Aujourd'hui, 14:30", user: "Admin", reason: "Achat fournisseur" },
    { id: 2, product: "Montre Connectée Series 5", type: "out", quantity: 2, date: "Aujourd'hui, 12:15", user: "Système", reason: "Vente" },
    { id: 3, product: "Hub USB-C 7-en-1", type: "out", quantity: 5, date: "Hier, 18:45", user: "Système", reason: "Vente" },
    { id: 4, product: "Support Laptop", type: "in", quantity: 20, date: "Hier, 10:00", user: "Admin", reason: "Réapprovisionnement" },
    { id: 5, product: "Clavier Mécanique", type: "adjustment", quantity: -2, date: "Il y a 2 jours", user: "Admin", reason: "Correction inventaire" },
];

// AI Reorder suggestions
const reorderSuggestions = [
    { product: "Écouteurs Sans Fil Pro", currentStock: 85, suggestedQty: 100, reason: "Forte demande prévue", confidence: 92 },
    { product: "Montre Connectée", currentStock: 90, suggestedQty: 50, reason: "Tendance stable", confidence: 78 },
    { product: "Support Laptop", currentStock: 8, suggestedQty: 30, reason: "Stock critique", confidence: 95 },
];

export function AlertesMouvementsTab() {
    return (
        <div className="space-y-6">
            {/* Alerts Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
                    <CardContent className="p-4 text-center">
                        <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                        <p className="text-2xl font-bold text-red-600">2</p>
                        <p className="text-xs text-muted-foreground">Urgentes</p>
                    </CardContent>
                </Card>
                <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
                    <CardContent className="p-4 text-center">
                        <TrendingDown className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                        <p className="text-2xl font-bold text-orange-600">4</p>
                        <p className="text-xs text-muted-foreground">Stock Faible</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20">
                    <CardContent className="p-4 text-center">
                        <ArrowUpRight className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">52</p>
                        <p className="text-xs text-muted-foreground">Entrées (7j)</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20">
                    <CardContent className="p-4 text-center">
                        <ArrowDownRight className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">127</p>
                        <p className="text-xs text-muted-foreground">Sorties (7j)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Alerts */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-orange-500" />
                            Alertes Stock Faible
                        </CardTitle>
                        <Button variant="outline" size="sm" className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Actualiser
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {lowStockAlerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${alert.urgency === 'high' ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20' :
                                        alert.urgency === 'medium' ? 'border-orange-200 bg-orange-50/50 dark:bg-orange-950/20' :
                                            'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <Package className={`h-5 w-5 ${alert.urgency === 'high' ? 'text-red-500' :
                                            alert.urgency === 'medium' ? 'text-orange-500' :
                                                'text-yellow-500'
                                        }`} />
                                    <div>
                                        <p className="font-medium">{alert.name}</p>
                                        <p className="text-xs text-muted-foreground">{alert.sku} • {alert.carrier}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-bold">{alert.stock} / {alert.threshold}</p>
                                        <p className="text-xs text-muted-foreground">Stock / Seuil</p>
                                    </div>
                                    <Button size="sm" variant="outline">Commander</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Stock Movements History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                        Historique Mouvements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {stockMovements.map((movement) => (
                            <div key={movement.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                    {movement.type === "in" && <ArrowUpRight className="h-5 w-5 text-green-500" />}
                                    {movement.type === "out" && <ArrowDownRight className="h-5 w-5 text-red-500" />}
                                    {movement.type === "adjustment" && <RefreshCw className="h-5 w-5 text-blue-500" />}
                                    <div>
                                        <p className="font-medium">{movement.product}</p>
                                        <p className="text-xs text-muted-foreground">{movement.reason}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={movement.type === "in" ? "default" : movement.type === "out" ? "destructive" : "secondary"}>
                                        {movement.type === "in" ? "+" : ""}{movement.quantity}
                                    </Badge>
                                    <div className="text-right">
                                        <p className="text-sm">{movement.user}</p>
                                        <p className="text-xs text-muted-foreground">{movement.date}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* AI Reorder Suggestions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-[hsl(var(--accent-purple))]" />
                        Suggestions Réapprovisionnement IA
                    </CardTitle>
                    <CardDescription>Suggestions basées sur les tendances de vente</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {reorderSuggestions.map((suggestion, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-purple-50/50 dark:bg-purple-950/20">
                                <div>
                                    <p className="font-medium">{suggestion.product}</p>
                                    <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-lg font-bold">+{suggestion.suggestedQty}</p>
                                        <p className="text-xs text-muted-foreground">Confiance: {suggestion.confidence}%</p>
                                    </div>
                                    <Button size="sm">Commander</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
