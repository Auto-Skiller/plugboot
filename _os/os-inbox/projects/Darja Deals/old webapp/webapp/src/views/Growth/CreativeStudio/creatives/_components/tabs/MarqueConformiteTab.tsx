"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    Shield,
    Palette,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Eye,
    Languages
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import BrandVoiceProfile from "../BrandVoiceProfile";
import ContentSafetyChecker from "../ContentSafetyChecker";
import FormatPresets from "../FormatPresets";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Brand compliance stats
const complianceStats = {
    safeContent: 142,
    flaggedContent: 3,
    culturalIssues: 2,
    passRate: "97%",
};

// Recent safety checks
const recentChecks = [
    { id: 1, content: "Publication Ramadan", status: "safe", issues: 0, date: "Aujourd'hui" },
    { id: 2, content: "Promo Été", status: "warning", issues: 1, date: "Hier" },
    { id: 3, content: "Video TikTok", status: "safe", issues: 0, date: "Il y a 2 jours" },
    { id: 4, content: "Story Instagram", status: "flagged", issues: 2, date: "Il y a 3 jours" },
];

export function MarqueConformiteTab() {
    return (
        <div className="space-y-6">
            {/* Compliance Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                    <CardContent className="p-4 text-center">
                        <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">{complianceStats.safeContent}</p>
                        <p className="text-xs text-muted-foreground">Contenus Validés</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
                    <CardContent className="p-4 text-center">
                        <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                        <p className="text-2xl font-bold">{complianceStats.flaggedContent}</p>
                        <p className="text-xs text-muted-foreground">À Vérifier</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background">
                    <CardContent className="p-4 text-center">
                        <Languages className="h-6 w-6 mx-auto mb-2 text-red-500" />
                        <p className="text-2xl font-bold">{complianceStats.culturalIssues}</p>
                        <p className="text-xs text-muted-foreground">Problèmes Culturels</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
                    <CardContent className="p-4 text-center">
                        <Shield className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                        <p className="text-2xl font-bold">{complianceStats.passRate}</p>
                        <p className="text-xs text-muted-foreground">Taux Conformité</p>
                    </CardContent>
                </Card>
            </div>

            {/* Brand Voice Profile */}
            <FeatureCluster
                title="Profil Voice de Marque"
                icon={<Palette className="h-5 w-5" />}
                storageKey="creatives-brand-voice"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-purple))]"
            >
                <BrandVoiceProfile />
            </FeatureCluster>

            {/* Content Safety Checker */}
            <FeatureCluster
                title="Vérificateur de Sécurité"
                icon={<Shield className="h-5 w-5" />}
                storageKey="creatives-safety"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-orange))]"
            >
                <ContentSafetyChecker />
            </FeatureCluster>

            {/* Recent Safety Checks */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                        Historique Vérifications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {recentChecks.map((check) => (
                            <div key={check.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                    {check.status === "safe" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                    {check.status === "warning" && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                                    {check.status === "flagged" && <XCircle className="h-5 w-5 text-red-500" />}
                                    <div>
                                        <p className="font-medium">{check.content}</p>
                                        <p className="text-xs text-muted-foreground">{check.date}</p>
                                    </div>
                                </div>
                                <Badge variant={
                                    check.status === "safe" ? "default" :
                                        check.status === "warning" ? "secondary" :
                                            "destructive"
                                }>
                                    {check.issues === 0 ? "OK" : `${check.issues} problème(s)`}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Format Presets */}
            <FeatureCluster
                title="Préréglages de Format"
                icon={<Palette className="h-5 w-5" />}
                storageKey="creatives-formats"
                defaultExpanded={false}
                headerClassName="bg-[hsl(var(--accent-blue))]"
            >
                <FormatPresets />
            </FeatureCluster>
        </div>
    );
}
