"use client";

import { useState, useEffect, Suspense } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/core/layout/PageHeader";
import { Tabs, TabsContent } from "@/components/core/ui/tabs";
import { usePageActions } from "@/components/core/layout/PageActionsContext";

// Import Tab Components
import { RechercheTendancesTab } from "./_components/tabs/RechercheTendancesTab";
import { MarcheAlgerienTab } from "./_components/tabs/MarcheAlgerienTab";
import { FournisseursCoutsTab } from "./_components/tabs/FournisseursCoutsTab";
import { SocialValidationTab } from "./_components/tabs/SocialValidationTab";

function ProductResearchContent() {
    const { setSuggestions } = usePageActions();
    const [activeTab, setActiveTab] = useState("recherche-tendances");

    // Listen for tab changes from Ecosystem Bar
    useEffect(() => {
        const handleTabChange = (e: CustomEvent<{ tabId: string; pathname: string }>) => {
            if (e.detail.pathname === '/product-research') {
                setActiveTab(e.detail.tabId);
            }
        };
        window.addEventListener('page-tab-change', handleTabChange as EventListener);
        return () => window.removeEventListener('page-tab-change', handleTabChange as EventListener);
    }, []);

    useEffect(() => {
        setSuggestions([
            { id: "1", type: "trend", title: "Produit Tendance", description: "Écouteurs Sans Fil +30% cette semaine en Algérie" },
            { id: "2", type: "content", title: "Niche Opportunité", description: "Produits organisation maison = faible concurrence" },
            { id: "3", type: "improvement", title: "Alerte Prix", description: "Concurrent a baissé les prix sur 3 articles suivis" }
        ]);
        return () => setSuggestions([]);
    }, [setSuggestions]);

    return (
        <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto pb-20">
            {/* Hub Header */}
            <PageHeader
                title="Découverte Produits"
                description="Recherche Produits Gagnants avec Analyse IA"
                icon={<Search className="h-6 w-6 text-[hsl(var(--accent-purple))]" />}
            />

            {/* Tab Contents - Navigation handled by Ecosystem Bar */}
            <Tabs value={activeTab} className="w-full">
                <TabsContent value="recherche-tendances" className="mt-0">
                    <RechercheTendancesTab />
                </TabsContent>

                <TabsContent value="marche-algerien" className="mt-0">
                    <MarcheAlgerienTab />
                </TabsContent>

                <TabsContent value="fournisseurs-couts" className="mt-0">
                    <FournisseursCoutsTab />
                </TabsContent>

                <TabsContent value="social-validation" className="mt-0">
                    <SocialValidationTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function ProductResearchPage() {
    return (
        <Suspense fallback={<div className="p-6 flex items-center justify-center h-screen">Chargement Découverte Produits...</div>}>
            <ProductResearchContent />
        </Suspense>
    );
}
