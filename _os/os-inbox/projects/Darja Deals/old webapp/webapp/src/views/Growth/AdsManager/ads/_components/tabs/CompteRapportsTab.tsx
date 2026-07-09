"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    ShieldAlert,
    Users,
    Download,
    FileText,
    UploadCloud,
    Clock,
    Settings
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import AccountHealthMonitor from "../AccountHealthMonitor";
import AgencyAccountManager from "../AgencyAccountManager";
import { OfflineConversionSync } from '@/views/Command/Finance/sales-dashboard/_components/OfflineConversionSync';
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Report history
const recentReports = [
    { id: 1, name: "Rapport Hebdo - Sem. 52", date: "30 Déc 2025", type: "Performance", size: "2.4 MB" },
    { id: 2, name: "ROAS Mensuel - Décembre", date: "01 Jan 2026", type: "ROAS", size: "1.8 MB" },
    { id: 3, name: "Audiences Export", date: "28 Déc 2025", type: "Audiences", size: "4.2 MB" },
];

export function CompteRapportsTab() {
    return (
        <div className="space-y-6">
            {/* Account Health + Agency Manager */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FeatureCluster
                    title="Santé du Compte"
                    icon={<ShieldAlert className="h-5 w-5" />}
                    storageKey="ads-account-health"
                    defaultExpanded={true}
                    headerClassName="bg-[hsl(var(--accent-orange))]"
                >
                    <AccountHealthMonitor />
                </FeatureCluster>

                <FeatureCluster
                    title="Gestion Comptes Agence"
                    icon={<Users className="h-5 w-5" />}
                    storageKey="ads-agency-manager"
                    defaultExpanded={true}
                    headerClassName="bg-[hsl(var(--accent-blue))]"
                >
                    <AgencyAccountManager />
                </FeatureCluster>
            </div>

            {/* Platform Sync */}
            <FeatureCluster
                title="Sync Plateformes Pub"
                icon={<UploadCloud className="h-5 w-5" />}
                storageKey="ads-platform-sync"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-purple))]"
            >
                <OfflineConversionSync />
            </FeatureCluster>

            {/* Reports History */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                                Rapports Récents
                            </CardTitle>
                            <CardDescription>Téléchargez vos rapports de performance</CardDescription>
                        </div>
                        <Button variant="outline" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Nouveau Rapport
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {recentReports.map((report) => (
                            <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{report.name}</p>
                                        <p className="text-xs text-muted-foreground">{report.date} • {report.size}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary">{report.type}</Badge>
                                    <Button variant="ghost" size="sm">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Scheduled Reports - Coming Soon */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/95 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <Badge variant="secondary" className="gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        Bientôt Disponible
                    </Badge>
                </div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-[hsl(var(--accent-purple))]" />
                        Rapports Programmés
                    </CardTitle>
                    <CardDescription>Recevez vos rapports automatiquement par email</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-24 bg-muted/30 rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Configuration des rapports automatiques</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
