"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import {
    Sparkles,
    MessageSquare,
    Image,
    Languages,
    PenTool,
    Wand2
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import MultiContentGenerator from "../MultiContentGenerator";
import HookGenerator from "../HookGenerator";
import HookAnalyzer from "../HookAnalyzer";
import AIMediaEditor from "../AIMediaEditor";
import DarjaOptimizer from "../DarjaOptimizer";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";
import { ToolCard } from "../shared/ToolCard";

// AI Stats
const aiStats = {
    contentsGenerated: 156,
    hooksCreated: 89,
    imagesEdited: 42,
    darjaConversions: 67,
};

export function CreationIATab() {
    const [activeTool, setActiveTool] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            {/* AI Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
                    <CardContent className="p-4 text-center">
                        <Sparkles className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{aiStats.contentsGenerated}</p>
                        <p className="text-xs text-muted-foreground">Contenus Générés</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
                    <CardContent className="p-4 text-center">
                        <MessageSquare className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                        <p className="text-2xl font-bold">{aiStats.hooksCreated}</p>
                        <p className="text-xs text-muted-foreground">Accroches Créées</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/20 dark:to-background">
                    <CardContent className="p-4 text-center">
                        <Image className="h-6 w-6 mx-auto mb-2 text-pink-500" />
                        <p className="text-2xl font-bold">{aiStats.imagesEdited}</p>
                        <p className="text-xs text-muted-foreground">Images Éditées</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
                    <CardContent className="p-4 text-center">
                        <Languages className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold">{aiStats.darjaConversions}</p>
                        <p className="text-xs text-muted-foreground">Darja Conversions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Tools Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ToolCard
                    title="AI Copywriter"
                    description="Génère des textes marketing"
                    icon={PenTool}
                    colorCategory="creation"
                    isActive={activeTool === "copywriter"}
                    onClick={() => setActiveTool(activeTool === "copywriter" ? null : "copywriter")}
                />
                <ToolCard
                    title="Hook Generator"
                    description="Accroches virales"
                    icon={MessageSquare}
                    colorCategory="creation"
                    isActive={activeTool === "hook"}
                    onClick={() => setActiveTool(activeTool === "hook" ? null : "hook")}
                />
                <ToolCard
                    title="AI Media Editor"
                    description="Édition photo/vidéo IA"
                    icon={Image}
                    colorCategory="creation"
                    isActive={activeTool === "media"}
                    onClick={() => setActiveTool(activeTool === "media" ? null : "media")}
                />
                <ToolCard
                    title="Darja Optimizer"
                    description="Conversion Arabe Algérien"
                    icon={Languages}
                    colorCategory="algeria"
                    isActive={activeTool === "darja"}
                    onClick={() => setActiveTool(activeTool === "darja" ? null : "darja")}
                />
            </div>

            {/* Tool Panels */}
            {activeTool && (
                <Card>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Wand2 className="h-5 w-5 text-[hsl(var(--accent-purple))]" />
                                {activeTool === "copywriter" && "AI Copywriter"}
                                {activeTool === "hook" && "Hook Generator"}
                                {activeTool === "media" && "AI Media Editor"}
                                {activeTool === "darja" && "Darja Optimizer"}
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setActiveTool(null)}>
                                Fermer
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {activeTool === "hook" && <HookGenerator />}
                        {activeTool === "media" && <AIMediaEditor />}
                        {activeTool === "darja" && <DarjaOptimizer />}
                        {activeTool === "copywriter" && <HookAnalyzer />}
                    </CardContent>
                </Card>
            )}

            {/* Multi Content Generator */}
            <FeatureCluster
                title="Générateur Multi-Contenu"
                icon={<Sparkles className="h-5 w-5" />}
                storageKey="creatives-multi-gen"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-blue))]"
            >
                <MultiContentGenerator />
            </FeatureCluster>
        </div>
    );
}
