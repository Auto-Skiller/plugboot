"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    Eye,
    Target,
    MessageSquare,
    TrendingUp,
    Clock
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import CompetitorTrackerEnhanced from "../CompetitorTrackerEnhanced";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Social validation stats
const validationStats = {
    productsAnalyzed: 342,
    avgSocialScore: "7.8/10",
    viralPotential: 28,
    competitorsTracked: 156,
};

// Recent social signals
const socialSignals = [
    { product: "Écouteurs Sans Fil Pro", platform: "TikTok", signal: "Viralité en hausse", trend: "+340%", sentiment: "positive" },
    { product: "Montre Connectée", platform: "Instagram", signal: "Mentions organiques", trend: "+85", sentiment: "positive" },
    { product: "Clavier Mécanique", platform: "Facebook", signal: "Reviews négatives", trend: "-12", sentiment: "negative" },
    { product: "Support Laptop", platform: "YouTube", signal: "Unboxing vidéos", trend: "+28", sentiment: "neutral" },
];

export function SocialValidationTab() {
    return (
        <div className="space-y-6">
            {/* Validation Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Eye className="h-5 w-5 text-blue-500" />
                            <span className="text-sm text-muted-foreground">Produits Analysés</span>
                        </div>
                        <p className="text-2xl font-bold">{validationStats.productsAnalyzed}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            <span className="text-sm text-muted-foreground">Score Social Moy.</span>
                        </div>
                        <p className="text-2xl font-bold">{validationStats.avgSocialScore}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-5 w-5 text-purple-500" />
                            <span className="text-sm text-muted-foreground">Potentiel Viral</span>
                        </div>
                        <p className="text-2xl font-bold">{validationStats.viralPotential}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="h-5 w-5 text-orange-500" />
                            <span className="text-sm text-muted-foreground">Concurrents Suivis</span>
                        </div>
                        <p className="text-2xl font-bold">{validationStats.competitorsTracked}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Social Signals */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-[hsl(var(--accent-purple))]" />
                        Signaux Sociaux Récents
                    </CardTitle>
                    <CardDescription>Alertes en temps réel sur les tendances produits</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {socialSignals.map((signal, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline">{signal.platform}</Badge>
                                    <div>
                                        <p className="font-medium">{signal.product}</p>
                                        <p className="text-sm text-muted-foreground">{signal.signal}</p>
                                    </div>
                                </div>
                                <Badge variant={
                                    signal.sentiment === "positive" ? "default" :
                                        signal.sentiment === "negative" ? "destructive" :
                                            "secondary"
                                } className={
                                    signal.sentiment === "positive" ? "bg-green-100 text-green-700" :
                                        signal.sentiment === "negative" ? "bg-red-100 text-red-700" :
                                            ""
                                }>
                                    {signal.trend}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Competitor Tracker */}
            <FeatureCluster
                title="Suivi des Concurrents"
                icon={<Target className="h-5 w-5" />}
                storageKey="research-competitors"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-orange))]"
            >
                <CompetitorTrackerEnhanced />
            </FeatureCluster>

            {/* Coming Soon: AI Validation */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/95 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <Badge variant="secondary" className="gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        Bientôt Disponible
                    </Badge>
                </div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                        Validation IA Automatique
                    </CardTitle>
                    <CardDescription>Score de viabilité produit basé sur l'engagement social</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-32 bg-muted/30 rounded-lg" />
                </CardContent>
            </Card>
        </div>
    );
}
