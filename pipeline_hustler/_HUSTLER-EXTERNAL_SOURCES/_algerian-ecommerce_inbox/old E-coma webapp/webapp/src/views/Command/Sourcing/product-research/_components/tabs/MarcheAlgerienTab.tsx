"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    MapPin,
    TrendingUp,
    MessageSquare,
    BarChart3
} from "lucide-react";
import TrendingProductAds from "../TrendingProductAds";
import SocialMediaTopics from "../SocialMediaTopics";
import AlgeriaTrends from "../AlgeriaTrends";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Algeria market stats
const algeriaStats = {
    topRegions: ["Alger", "Oran", "Constantine", "Annaba"],
    avgOrderValue: "8,500 DA",
    paymentPreference: "94% COD",
    mobileUsage: "78%",
};

export function MarcheAlgerienTab() {
    return (
        <div className="space-y-6">
            {/* Algeria Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-5 w-5 text-green-500" />
                            <span className="text-sm text-muted-foreground">Top Wilayas</span>
                        </div>
                        <p className="font-bold">{algeriaStats.topRegions.join(", ")}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            <span className="text-sm text-muted-foreground">Valeur Moy.</span>
                        </div>
                        <p className="text-2xl font-bold">{algeriaStats.avgOrderValue}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="h-5 w-5 text-orange-500" />
                            <span className="text-sm text-muted-foreground">Paiement</span>
                        </div>
                        <p className="text-2xl font-bold">{algeriaStats.paymentPreference}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-5 w-5 text-purple-500" />
                            <span className="text-sm text-muted-foreground">Mobile</span>
                        </div>
                        <p className="text-2xl font-bold">{algeriaStats.mobileUsage}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Algeria Trends */}
            <FeatureCluster
                title="Tendances Marché Algérien"
                icon={<MapPin className="h-5 w-5" />}
                storageKey="research-algeria-trends"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-green))]"
            >
                <AlgeriaTrends />
            </FeatureCluster>

            {/* Market Intelligence: Ads + Topics */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Trending Ads */}
                <div className="xl:col-span-7">
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                                Pubs Performantes
                            </CardTitle>
                            <CardDescription>Analyse des créatives virales</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TrendingProductAds />
                        </CardContent>
                    </Card>
                </div>

                {/* Niche Topics */}
                <div className="xl:col-span-5">
                    <Card className="shadow-sm h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-[hsl(var(--accent-purple))]" />
                                Sujets de Niche
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SocialMediaTopics />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
