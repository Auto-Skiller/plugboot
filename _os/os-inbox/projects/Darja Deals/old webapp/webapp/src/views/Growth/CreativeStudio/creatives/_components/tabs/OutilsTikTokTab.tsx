"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    Video,
    Smartphone,
    DollarSign,
    Clock,
    Settings,
    Zap,
    Download,
    Upload,
    Users
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import TikTokMonetizationWizard from "../TikTokMonetizationWizard";
import QualityOptimizer from "../QualityOptimizer";
import { UGCServiceBanner } from "@/views/Growth/Marketing/_components/UGCServiceBanner";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// TikTok stats
const tiktokStats = {
    eligibleContent: 28,
    potentialRevenue: "15,000 DA",
    avgViews: "45K",
    creatorStatus: "Non Connecté",
};

// Platform optimization status
const platformStatus = [
    { platform: "TikTok", optimized: 24, total: 28, percentage: 86 },
    { platform: "Instagram Reels", optimized: 18, total: 22, percentage: 82 },
    { platform: "Facebook", optimized: 15, total: 15, percentage: 100 },
    { platform: "YouTube Shorts", optimized: 8, total: 12, percentage: 67 },
];

export function OutilsTikTokTab() {
    const [showMonetization, setShowMonetization] = useState(false);

    return (
        <div className="space-y-6">
            {/* TikTok Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/20 dark:to-background">
                    <CardContent className="p-4 text-center">
                        <Video className="h-6 w-6 mx-auto mb-2 text-pink-500" />
                        <p className="text-2xl font-bold">{tiktokStats.eligibleContent}</p>
                        <p className="text-xs text-muted-foreground">Contenus Éligibles</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                    <CardContent className="p-4 text-center">
                        <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">{tiktokStats.potentialRevenue}</p>
                        <p className="text-xs text-muted-foreground">Revenus Potentiels</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
                    <CardContent className="p-4 text-center">
                        <Zap className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{tiktokStats.avgViews}</p>
                        <p className="text-xs text-muted-foreground">Vues Moyennes</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-950/20 dark:to-background">
                    <CardContent className="p-4 text-center">
                        <Settings className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                        <p className="text-sm font-bold">{tiktokStats.creatorStatus}</p>
                        <p className="text-xs text-muted-foreground">Statut Creator Fund</p>
                    </CardContent>
                </Card>
            </div>

            {/* TikTok Monetization Wizard */}
            <FeatureCluster
                title="TikTok Monétisation"
                icon={<Video className="h-5 w-5" />}
                storageKey="creatives-tiktok-monetization"
                defaultExpanded={true}
                headerClassName="bg-gradient-to-r from-pink-500 to-purple-500"
            >
                <TikTokMonetizationWizard />
            </FeatureCluster>

            {/* Quality Optimizer for 4G/ADSL */}
            <FeatureCluster
                title="Optimiseur Qualité (4G/ADSL)"
                icon={<Smartphone className="h-5 w-5" />}
                storageKey="creatives-quality-optimizer"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-green))]"
            >
                <QualityOptimizer />
            </FeatureCluster>

            {/* Platform Optimization Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-[hsl(var(--accent-orange))]" />
                        Optimisation par Plateforme
                    </CardTitle>
                    <CardDescription>Contenus optimisés pour chaque plateforme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {platformStatus.map((platform) => (
                        <div key={platform.platform} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{platform.platform}</span>
                                <span className="text-muted-foreground">
                                    {platform.optimized}/{platform.total} contenus
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${platform.percentage >= 80 ? 'bg-green-500' :
                                                platform.percentage >= 60 ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                            }`}
                                        style={{ width: `${platform.percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium w-10">{platform.percentage}%</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* UGC Service Banner */}
            <UGCServiceBanner />

            {/* Import/Export Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                            <Download className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="font-medium">Exporter Contenus</p>
                            <p className="text-sm text-muted-foreground">Téléchargez vos contenus optimisés</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                            <Upload className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="font-medium">Importer Médias</p>
                            <p className="text-sm text-muted-foreground">Ajoutez des photos et vidéos</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
