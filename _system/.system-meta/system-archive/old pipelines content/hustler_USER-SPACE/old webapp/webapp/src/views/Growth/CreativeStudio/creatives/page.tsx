"use client";

import { useState, useEffect, Suspense } from "react";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/core/layout/PageHeader";
import { Tabs, TabsContent } from "@/components/core/ui/tabs";
import { usePageActions } from "@/components/core/layout/PageActionsContext";

// Import Tab Components
import { CreationIATab } from "./_components/tabs/CreationIATab";
import { ModelesFluxTab } from "./_components/tabs/ModelesFluxTab";
import { MarqueConformiteTab } from "./_components/tabs/MarqueConformiteTab";
import { OutilsTikTokTab } from "./_components/tabs/OutilsTikTokTab";

function CreativesContent() {
    const { setSuggestions } = usePageActions();
    const [activeTab, setActiveTab] = useState("creation-ia");

    // Listen for tab changes from Ecosystem Bar
    useEffect(() => {
        const handleTabChange = (e: CustomEvent<{ tabId: string; pathname: string }>) => {
            if (e.detail.pathname === '/creatives') {
                setActiveTab(e.detail.tabId);
            }
        };
        window.addEventListener('page-tab-change', handleTabChange as EventListener);
        return () => window.removeEventListener('page-tab-change', handleTabChange as EventListener);
    }, []);

    useEffect(() => {
        setSuggestions([
            { id: "1", type: "timing", title: "Heure Optimale", description: "Publications 9-11h = +23% engagement en Algérie" },
            { id: "2", type: "trend", title: "Hashtag Tendance", description: "#AlgeriaVibes est trending - ajoutez-le" },
            { id: "3", type: "content", title: "Idée Contenu", description: "Les vidéos unboxing ont 4x plus d'engagement" }
        ]);
        return () => setSuggestions([]);
    }, [setSuggestions]);

    return (
        <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto pb-20">
            {/* Hub Header */}
            <PageHeader
                title="Studio Créatif"
                description="Création de Contenu IA & Publishing"
                icon={<Sparkles className="h-6 w-6 text-[hsl(var(--accent-purple))]" />}
            />

            {/* Tab Contents - Navigation handled by Ecosystem Bar */}
            <Tabs value={activeTab} className="w-full">
                <TabsContent value="creation-ia" className="mt-0">
                    <CreationIATab />
                </TabsContent>

                <TabsContent value="modeles-flux" className="mt-0">
                    <ModelesFluxTab />
                </TabsContent>

                <TabsContent value="marque-conformite" className="mt-0">
                    <MarqueConformiteTab />
                </TabsContent>

                <TabsContent value="outils-tiktok" className="mt-0">
                    <OutilsTikTokTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function CreativesPage() {
    return (
        <Suspense fallback={<div className="p-6 flex items-center justify-center h-screen">Chargement Studio Créatif...</div>}>
            <CreativesContent />
        </Suspense>
    );
}
