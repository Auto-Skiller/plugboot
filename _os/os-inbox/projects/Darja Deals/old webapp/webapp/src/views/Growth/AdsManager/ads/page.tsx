"use client";

import { useState, useEffect, Suspense } from "react";
import { Megaphone } from "lucide-react";
import { PageHeader } from "@/components/core/layout/PageHeader";
import { Tabs, TabsContent } from "@/components/core/ui/tabs";
import { usePageActions } from "@/components/core/layout/PageActionsContext";

// Import Tab Components
import { CampagnesROASTab } from "./_components/tabs/CampagnesROASTab";
import { BudgetReglesTab } from "./_components/tabs/BudgetReglesTab";
import { TraficTunnelTab } from "./_components/tabs/TraficTunnelTab";
import { CompteRapportsTab } from "./_components/tabs/CompteRapportsTab";

function AdsContent() {
    const { setSuggestions } = usePageActions();
    const [activeTab, setActiveTab] = useState("campagnes-roas");

    // Listen for tab changes from Ecosystem Bar
    useEffect(() => {
        const handleTabChange = (e: CustomEvent<{ tabId: string; pathname: string }>) => {
            if (e.detail.pathname === '/ads') {
                setActiveTab(e.detail.tabId);
            }
        };
        window.addEventListener('page-tab-change', handleTabChange as EventListener);
        return () => window.removeEventListener('page-tab-change', handleTabChange as EventListener);
    }, []);

    useEffect(() => {
        setSuggestions([
            { id: "1", type: "trend", title: "Alerte ROAS", description: "Campagne 'Promo Été' a 3.2x ROAS - augmentez le budget" },
            { id: "2", type: "timing", title: "Heures de Pointe", description: "Vos pubs performent 35% mieux entre 18h-21h" },
            { id: "3", type: "improvement", title: "CTR Faible", description: "Flash Sale a un CTR bas. Essayez de nouvelles créas." }
        ]);
        return () => setSuggestions([]);
    }, [setSuggestions]);

    return (
        <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto pb-20">
            {/* Hub Header */}
            <PageHeader
                title="Gestionnaire Pubs"
                description="Campagnes, ROAS & Performance Multi-Plateformes"
                icon={<Megaphone className="h-6 w-6 text-[hsl(var(--accent-blue))]" />}
            />

            {/* Tab Contents - Navigation handled by Ecosystem Bar */}
            <Tabs value={activeTab} className="w-full">
                <TabsContent value="campagnes-roas" className="mt-0">
                    <CampagnesROASTab />
                </TabsContent>

                <TabsContent value="budget-regles" className="mt-0">
                    <BudgetReglesTab />
                </TabsContent>

                <TabsContent value="trafic-tunnel" className="mt-0">
                    <TraficTunnelTab />
                </TabsContent>

                <TabsContent value="compte-rapports" className="mt-0">
                    <CompteRapportsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function AdsPage() {
    return (
        <Suspense fallback={<div className="p-6 flex items-center justify-center h-screen">Chargement Gestionnaire Pubs...</div>}>
            <AdsContent />
        </Suspense>
    );
}
