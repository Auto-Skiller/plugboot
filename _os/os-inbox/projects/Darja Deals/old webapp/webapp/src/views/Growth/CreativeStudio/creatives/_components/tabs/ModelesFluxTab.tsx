"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    LayoutTemplate,
    PenTool,
    Calendar,
    Clock,
    CheckCircle2,
    FileText,
    Layers
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import { ContentKanban } from "../kanban";
import { TemplateLibrary } from "../templates";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Template stats
const templateStats = {
    totalTemplates: 24,
    customTemplates: 8,
    recentlyUsed: 5,
    inProgress: 12,
};

// Recent templates
const recentTemplates = [
    { id: 1, name: "Product Launch", category: "lancement", uses: 15, lastUsed: "Aujourd'hui" },
    { id: 2, name: "Flash Sale", category: "promo", uses: 28, lastUsed: "Hier" },
    { id: 3, name: "UGC Review", category: "ugc", uses: 12, lastUsed: "Il y a 2 jours" },
    { id: 4, name: "Behind the Scenes", category: "story", uses: 9, lastUsed: "Cette semaine" },
];

export function ModelesFluxTab() {
    const [showTemplates, setShowTemplates] = useState(false);

    return (
        <div className="space-y-6">
            {/* Workflow Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
                    <CardContent className="p-4 text-center">
                        <LayoutTemplate className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                        <p className="text-2xl font-bold">{templateStats.totalTemplates}</p>
                        <p className="text-xs text-muted-foreground">Templates</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
                    <CardContent className="p-4 text-center">
                        <Layers className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{templateStats.customTemplates}</p>
                        <p className="text-xs text-muted-foreground">Personnalisés</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background">
                    <CardContent className="p-4 text-center">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                        <p className="text-2xl font-bold">{templateStats.inProgress}</p>
                        <p className="text-xs text-muted-foreground">En Production</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                    <CardContent className="p-4 text-center">
                        <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">{templateStats.recentlyUsed}</p>
                        <p className="text-xs text-muted-foreground">Utilisés Récemment</p>
                    </CardContent>
                </Card>
            </div>

            {/* Content Pipeline Kanban */}
            <FeatureCluster
                title="Pipeline de Contenu"
                icon={<PenTool className="h-5 w-5" />}
                storageKey="creatives-kanban"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-blue))]"
            >
                <ContentKanban />
            </FeatureCluster>

            {/* Templates Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <LayoutTemplate className="h-5 w-5 text-[hsl(var(--accent-purple))]" />
                            Bibliothèque de Templates
                        </CardTitle>
                        <Button variant="outline" onClick={() => setShowTemplates(true)} className="gap-2">
                            <LayoutTemplate className="h-4 w-4" />
                            Voir Tous
                        </Button>
                    </div>
                    <CardDescription>Templates récemment utilisés</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {recentTemplates.map((template) => (
                            <div
                                key={template.id}
                                className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                                </div>
                                <p className="font-medium text-sm mb-1">{template.name}</p>
                                <p className="text-xs text-muted-foreground">{template.uses} utilisations • {template.lastUsed}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Template Library Modal */}
            <TemplateLibrary
                isOpen={showTemplates}
                onClose={() => setShowTemplates(false)}
                onSelectTemplate={(template) => console.log("Selected:", template)}
            />

            {/* Scheduler Preview - Coming Soon */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/95 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <Badge variant="secondary" className="gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        Bientôt Disponible
                    </Badge>
                </div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-[hsl(var(--accent-orange))]" />
                        Calendrier de Publication
                    </CardTitle>
                    <CardDescription>Planifiez vos publications sur toutes les plateformes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
                        <p className="text-muted-foreground">Vue calendrier des publications</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
