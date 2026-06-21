"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import {
    Phone,
    Package,
    CheckCircle,
    Truck,
    MapPin,
    MessageSquare,
    AlertTriangle,
    Bot
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import { ConfirmationWorkflow } from "../ConfirmationWorkflow";
import { CallCenterScripts } from "../CallCenterScripts";
import { LocationCollector } from "../LocationCollector";
import ShipmentTracker from "@/views/Operations/LogisticsRecovery/Shipping/ShipmentTracker";
import { VisualBoardModal, BoardColumn } from "@/components/core/ui/modals/VisualBoardModal";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Mock Board Data
const BOARD_COLUMNS: BoardColumn[] = [
    {
        id: "new",
        title: "Nouvelles",
        color: "bg-blue-500",
        items: [
            { id: "1", title: "Commande #ORD-9921", subtitle: "Amine K. - 4500 DA", status: "warning", tags: ["Risque Élevé"] },
            { id: "2", title: "Commande #ORD-9922", subtitle: "Karim S. - 1200 DA", status: "default" }
        ]
    },
    {
        id: "called",
        title: "Appelées",
        color: "bg-yellow-500",
        items: [
            { id: "5", title: "Commande #ORD-9917", subtitle: "Fatima Z. - 2800 DA", status: "default" }
        ]
    },
    {
        id: "confirmed",
        title: "Confirmées",
        color: "bg-green-500",
        items: [
            { id: "3", title: "Commande #ORD-9920", subtitle: "Sarah B. - 3400 DA", status: "success" }
        ]
    },
    {
        id: "processing",
        title: "En Traitement",
        color: "bg-orange-500",
        items: []
    },
    {
        id: "shipped",
        title: "Expédiées",
        color: "bg-indigo-500",
        items: [
            { id: "4", title: "Commande #ORD-9918", subtitle: "Mounir L.", status: "default" }
        ]
    },
    {
        id: "delivered",
        title: "Livrées",
        color: "bg-emerald-500",
        items: []
    }
];

// KPI Data
const orderKpis = {
    newOrders: 24,
    pendingCalls: 8,
    confirmed: 142,
    shipped: 89,
    delivered: 67,
    confirmationRate: 78,
};

export function TraitementCommandesTab() {
    const [showBoard, setShowBoard] = useState(false);

    return (
        <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
                    <CardContent className="p-3 text-center">
                        <Package className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                        <p className="text-2xl font-bold">{orderKpis.newOrders}</p>
                        <p className="text-xs text-muted-foreground">Nouvelles</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-background">
                    <CardContent className="p-3 text-center">
                        <Phone className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                        <p className="text-2xl font-bold">{orderKpis.pendingCalls}</p>
                        <p className="text-xs text-muted-foreground">À Appeler</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                    <CardContent className="p-3 text-center">
                        <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-500" />
                        <p className="text-2xl font-bold">{orderKpis.confirmed}</p>
                        <p className="text-xs text-muted-foreground">Confirmées</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background">
                    <CardContent className="p-3 text-center">
                        <Truck className="h-5 w-5 mx-auto mb-1 text-indigo-500" />
                        <p className="text-2xl font-bold">{orderKpis.shipped}</p>
                        <p className="text-xs text-muted-foreground">Expédiées</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background">
                    <CardContent className="p-3 text-center">
                        <CheckCircle className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                        <p className="text-2xl font-bold">{orderKpis.delivered}</p>
                        <p className="text-xs text-muted-foreground">Livrées</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
                    <CardContent className="p-3 text-center">
                        <div className="h-5 w-5 mx-auto mb-1 rounded-full bg-purple-500 flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold">%</span>
                        </div>
                        <p className="text-2xl font-bold">{orderKpis.confirmationRate}%</p>
                        <p className="text-xs text-muted-foreground">Taux Confirm.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Board View Button */}
            <div className="flex justify-end">
                <Button onClick={() => setShowBoard(true)} variant="outline" className="gap-2">
                    <Package className="h-4 w-4" />
                    Vue Kanban
                </Button>
            </div>

            <VisualBoardModal
                open={showBoard}
                onOpenChange={setShowBoard}
                title="Tableau des Commandes"
                description="Glissez-déposez les commandes pour les déplacer dans le flux."
                columns={BOARD_COLUMNS}
            />

            {/* Confirmation Workflow */}
            <FeatureCluster
                title="Flux de Confirmation"
                icon={<Phone className="h-5 w-5" />}
                storageKey="sales-confirmation-workflow"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-green))]"
            >
                <ConfirmationWorkflow />
            </FeatureCluster>

            {/* Call Scripts + GPS Collection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FeatureCluster
                    title="Scripts d'Appel"
                    icon={<MessageSquare className="h-5 w-5" />}
                    storageKey="sales-call-scripts"
                    defaultExpanded={false}
                    headerClassName="bg-[hsl(var(--accent-blue))]"
                >
                    <CallCenterScripts />
                </FeatureCluster>

                <FeatureCluster
                    title="Collecte GPS WhatsApp"
                    icon={<MapPin className="h-5 w-5" />}
                    storageKey="sales-gps-collection"
                    defaultExpanded={false}
                    headerClassName="bg-[hsl(var(--accent-orange))]"
                >
                    <LocationCollector />
                </FeatureCluster>
            </div>

            {/* Shipment Tracker */}
            <FeatureCluster
                title="Suivi des Expéditions"
                icon={<Truck className="h-5 w-5" />}
                storageKey="sales-shipment-tracker"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-purple))]"
            >
                <ShipmentTracker />
            </FeatureCluster>
        </div>
    );
}
