"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    Store,
    Users,
    DollarSign,
    TrendingUp,
    FileText
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import { InfluencerMarketplace } from "./InfluencerMarketplace";
import { InfluencerRateCalculator } from "./InfluencerRateCalculator";
import { TierComparison } from "./TierComparison";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Influencer Stats
const influencerStats = {
    activePartnerships: 8,
    totalReach: "2.4M",
    avgEngagement: "4.8%",
    totalSpent: "320,000 DA",
};

export function InfluenceursUGCTab() {
    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="h-5 w-5 text-orange-500" />
                            <span className="text-sm text-muted-foreground">Partenariats Actifs</span>
                        </div>
                        <p className="text-2xl font-bold">{influencerStats.activePartnerships}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            <span className="text-sm text-muted-foreground">Portée Totale</span>
                        </div>
                        <p className="text-2xl font-bold">{influencerStats.totalReach}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <span className="text-sm text-muted-foreground">Engagement Moyen</span>
                        </div>
                        <p className="text-2xl font-bold">{influencerStats.avgEngagement}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5 text-purple-500" />
                            <span className="text-sm text-muted-foreground">Dépensé Total</span>
                        </div>
                        <p className="text-2xl font-bold">{influencerStats.totalSpent}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Influencer Marketplace */}
            <FeatureCluster
                title="Marketplace Influenceurs"
                icon={<Store className="h-5 w-5" />}
                storageKey="marketing-influencer-marketplace"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-orange))]"
            >
                <InfluencerMarketplace />
            </FeatureCluster>

            {/* Rate Calculator */}
            <FeatureCluster
                title="Calculateur de Tarifs"
                icon={<DollarSign className="h-5 w-5" />}
                storageKey="marketing-rate-calculator"
                defaultExpanded={false}
                headerClassName="bg-[hsl(var(--accent-green))]"
            >
                <InfluencerRateCalculator />
            </FeatureCluster>

            {/* Tier Comparison */}
            <FeatureCluster
                title="Comparaison des Paliers"
                icon={<TrendingUp className="h-5 w-5" />}
                storageKey="marketing-tier-comparison"
                defaultExpanded={false}
                headerClassName="bg-[hsl(var(--accent-blue))]"
            >
                <TierComparison />
            </FeatureCluster>
        </div>
    );
}
