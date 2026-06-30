"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    MapPin,
    Truck,
    Package,
    RotateCcw,
    CheckCircle2,
    XCircle,
    Clock,
    Warehouse
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import { CarrierStockSync } from "@/views/Operations/LogisticsRecovery/Inventory/CarrierStockSync";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Stock by location
const stockLocations = [
    { id: 1, name: "Entrepôt Principal", location: "Alger", stock: 450, value: "1,250,000 DA", status: "active" },
    { id: 2, name: "Yalidine Hub", location: "Alger Centre", stock: 180, value: "520,000 DA", status: "synced" },
    { id: 3, name: "Maystro Stock", location: "Oran", stock: 85, value: "280,000 DA", status: "synced" },
    { id: 4, name: "ZR-Express", location: "Constantine", stock: 42, value: "145,000 DA", status: "pending" },
];

// Returns tracking
const recentReturns = [
    { id: 1, orderId: "ORD-9915", product: "Écouteurs Sans Fil", reason: "Défectueux", date: "Aujourd'hui", status: "received", action: "Remboursement" },
    { id: 2, orderId: "ORD-9912", product: "Montre Connectée", reason: "Taille incorrecte", date: "Hier", status: "in_transit", action: "Échange" },
    { id: 3, orderId: "ORD-9908", product: "Hub USB-C", reason: "Changement d'avis", date: "Il y a 2 jours", status: "processing", action: "Réintégration" },
    { id: 4, orderId: "ORD-9905", product: "Clavier Mécanique", reason: "Non conforme", date: "Il y a 3 jours", status: "completed", action: "Remboursement" },
];

// Return stats
const returnStats = {
    pending: 3,
    inTransit: 2,
    received: 5,
    processed: 12,
    returnRate: "8.2%",
};

export function SitesRetoursTab() {
    return (
        <div className="space-y-6">
            {/* Location Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20">
                    <CardContent className="p-4 text-center">
                        <Warehouse className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">4</p>
                        <p className="text-xs text-muted-foreground">Sites Actifs</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20">
                    <CardContent className="p-4 text-center">
                        <Truck className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">3</p>
                        <p className="text-xs text-muted-foreground">Transporteurs</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20">
                    <CardContent className="p-4 text-center">
                        <RotateCcw className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                        <p className="text-2xl font-bold">{returnStats.pending + returnStats.inTransit}</p>
                        <p className="text-xs text-muted-foreground">Retours en Cours</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20">
                    <CardContent className="p-4 text-center">
                        <Package className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                        <p className="text-2xl font-bold">{returnStats.returnRate}</p>
                        <p className="text-xs text-muted-foreground">Taux Retour</p>
                    </CardContent>
                </Card>
            </div>

            {/* Stock by Location */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                        Stock par Emplacement
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {stockLocations.map((location) => (
                            <div key={location.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50">
                                <div className="flex items-center gap-4">
                                    {location.status === "active" ? (
                                        <Warehouse className="h-5 w-5 text-blue-500" />
                                    ) : (
                                        <Truck className="h-5 w-5 text-green-500" />
                                    )}
                                    <div>
                                        <p className="font-medium">{location.name}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> {location.location}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="font-bold">{location.stock}</p>
                                        <p className="text-xs text-muted-foreground">unités</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{location.value}</p>
                                        <p className="text-xs text-muted-foreground">valeur</p>
                                    </div>
                                    <Badge variant={location.status === "synced" ? "default" : location.status === "pending" ? "secondary" : "outline"}>
                                        {location.status === "synced" ? "Synchronisé" : location.status === "pending" ? "En attente" : "Local"}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Carrier Stock Sync */}
            <FeatureCluster
                title="Synchronisation Transporteurs"
                icon={<Truck className="h-5 w-5" />}
                storageKey="stock-carrier-sync"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-green))]"
            >
                <CarrierStockSync />
            </FeatureCluster>

            {/* Returns Tracking */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-[hsl(var(--accent-orange))]" />
                        Suivi des Retours
                    </CardTitle>
                    <CardDescription>Retours clients en cours de traitement</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentReturns.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                    {item.status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                    {item.status === "received" && <Package className="h-5 w-5 text-blue-500" />}
                                    {item.status === "in_transit" && <Truck className="h-5 w-5 text-orange-500" />}
                                    {item.status === "processing" && <Clock className="h-5 w-5 text-purple-500" />}
                                    <div>
                                        <p className="font-medium">{item.product}</p>
                                        <p className="text-xs text-muted-foreground">#{item.orderId} • {item.reason}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={
                                        item.status === "completed" ? "default" :
                                            item.status === "received" ? "secondary" :
                                                "outline"
                                    }>
                                        {item.status === "completed" ? "Terminé" :
                                            item.status === "received" ? "Reçu" :
                                                item.status === "in_transit" ? "En transit" :
                                                    "En cours"}
                                    </Badge>
                                    <div className="text-right">
                                        <p className="text-sm">{item.action}</p>
                                        <p className="text-xs text-muted-foreground">{item.date}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
