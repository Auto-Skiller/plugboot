"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    Globe,
    Package,
    DollarSign,
    Clock,
    Calculator,
    FileText,
    Ship,
    Plane
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import SupplierDatabase from "@/views/Command/Sourcing/Suppliers/SupplierDatabase";
import { ChinaImportService } from "../ChinaImportService";
import { ImportBudgetTracker } from "@/views/Command/Sourcing/_components/ImportBudgetTracker";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Import stats
const importStats = {
    activeImports: 3,
    pendingCustoms: 1,
    totalValue: "850,000 DA",
    avgLeadTime: "21 jours",
};

// Recent imports
const recentImports = [
    { id: 1, supplier: "Shenzhen Electronics", items: 15, status: "in_transit", eta: "12 Jan 2026", value: "320,000 DA" },
    { id: 2, supplier: "Guangzhou Accessories", items: 8, status: "customs", eta: "8 Jan 2026", value: "180,000 DA" },
    { id: 3, supplier: "Yiwu Trading", items: 22, status: "ordered", eta: "25 Jan 2026", value: "450,000 DA" },
];

export function FournisseursImportTab() {
    return (
        <div className="space-y-6">
            {/* Import Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20">
                    <CardContent className="p-4 text-center">
                        <Ship className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{importStats.activeImports}</p>
                        <p className="text-xs text-muted-foreground">Imports Actifs</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20">
                    <CardContent className="p-4 text-center">
                        <FileText className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                        <p className="text-2xl font-bold">{importStats.pendingCustoms}</p>
                        <p className="text-xs text-muted-foreground">En Douane</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20">
                    <CardContent className="p-4 text-center">
                        <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">{importStats.totalValue}</p>
                        <p className="text-xs text-muted-foreground">Valeur Totale</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20">
                    <CardContent className="p-4 text-center">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                        <p className="text-2xl font-bold">{importStats.avgLeadTime}</p>
                        <p className="text-xs text-muted-foreground">Délai Moyen</p>
                    </CardContent>
                </Card>
            </div>

            {/* Active Imports */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plane className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                        Imports en Cours
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentImports.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50">
                                <div className="flex items-center gap-4">
                                    <Globe className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{item.supplier}</p>
                                        <p className="text-sm text-muted-foreground">{item.items} articles</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="font-bold">{item.value}</p>
                                        <p className="text-xs text-muted-foreground">ETA: {item.eta}</p>
                                    </div>
                                    <Badge variant={
                                        item.status === "in_transit" ? "default" :
                                            item.status === "customs" ? "destructive" :
                                                "secondary"
                                    }>
                                        {item.status === "in_transit" ? "En Transit" :
                                            item.status === "customs" ? "Douane" :
                                                "Commandé"}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Import Budget Tracker */}
            <FeatureCluster
                title="Suivi Budget Import"
                icon={<Calculator className="h-5 w-5" />}
                storageKey="stock-import-budget"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-orange))]"
            >
                <ImportBudgetTracker />
            </FeatureCluster>

            {/* China Import Service */}
            <FeatureCluster
                title="Service Import Chine"
                icon={<Ship className="h-5 w-5" />}
                storageKey="stock-china-import"
                defaultExpanded={false}
                headerClassName="bg-[hsl(var(--accent-blue))]"
            >
                <ChinaImportService />
            </FeatureCluster>

            {/* Supplier Database */}
            <FeatureCluster
                title="Base Fournisseurs"
                icon={<Globe className="h-5 w-5" />}
                storageKey="stock-suppliers"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-green))]"
            >
                <SupplierDatabase />
            </FeatureCluster>
        </div>
    );
}
