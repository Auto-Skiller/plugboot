"use client";

import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { PageHeader } from "@/components/core/layout/PageHeader";
import { Tabs, TabsContent } from "@/components/core/ui/tabs";
import { usePageActions } from "@/components/core/layout/PageActionsContext";

// Import Tab Components
import { EtatStockTab } from "./_components/tabs/EtatStockTab";
import { AlertesMouvementsTab } from "./_components/tabs/AlertesMouvementsTab";
import { SitesRetoursTab } from "./_components/tabs/SitesRetoursTab";
import { FournisseursImportTab } from "./_components/tabs/FournisseursImportTab";

export default function StockPage() {
    const { setSuggestions } = usePageActions();
    const [activeTab, setActiveTab] = useState("etat-stock");

    // Listen for tab changes from Ecosystem Bar
    useEffect(() => {
        const handleTabChange = (e: CustomEvent<{ tabId: string; pathname: string }>) => {
            if (e.detail.pathname === '/stock') {
                setActiveTab(e.detail.tabId);
            }
        };
        window.addEventListener('page-tab-change', handleTabChange as EventListener);
        return () => window.removeEventListener('page-tab-change', handleTabChange as EventListener);
    }, []);

    useEffect(() => {
        setSuggestions([
            { id: "1", type: "trend", title: "Alerte Stock", description: "3 produits sous le seuil de réapprovisionnement" },
            { id: "2", type: "timing", title: "Timing Réappro", description: "Réapprovisionnez les Écouteurs avant le weekend" },
            { id: "3", type: "improvement", title: "Stock Lent", description: "Envisagez des promotions sur 2 articles à faible rotation" }
        ]);
        return () => setSuggestions([]);
    }, [setSuggestions]);

    return (
        <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto pb-20">
            {/* Hub Header */}
            <PageHeader
                title="Entrepôt"
                description="Gestion des Stocks, Fournisseurs & Import"
                icon={<Package className="h-6 w-6 text-[hsl(var(--accent-green))]" />}
            />

            {/* Tab Contents - Navigation handled by Ecosystem Bar */}
            <Tabs value={activeTab} className="w-full">
                <TabsContent value="etat-stock" className="mt-0">
                    <EtatStockTab />
                </TabsContent>

                <TabsContent value="alertes-mouvements" className="mt-0">
                    <AlertesMouvementsTab />
                </TabsContent>

                <TabsContent value="sites-retours" className="mt-0">
                    <SitesRetoursTab />
                </TabsContent>

                <TabsContent value="fournisseurs-import" className="mt-0">
                    <FournisseursImportTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
