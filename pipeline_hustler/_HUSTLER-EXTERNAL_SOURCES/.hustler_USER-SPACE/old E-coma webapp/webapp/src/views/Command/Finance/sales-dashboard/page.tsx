'use client';

import { useState, useEffect } from 'react';
import { BarChart } from 'lucide-react';
import { PageHeader } from "@/components/core/layout/PageHeader";
import { Tabs, TabsContent } from "@/components/core/ui/tabs";
import { usePageActions } from "@/components/core/layout/PageActionsContext";

// Import Tab Components
import { TraitementCommandesTab } from "./_components/tabs/TraitementCommandesTab";
import { RisqueClientsTab } from "./_components/tabs/RisqueClientsTab";
import { PerformanceSourcesTab } from "./_components/tabs/PerformanceSourcesTab";
import { CommsAutomatisationsTab } from "./_components/tabs/CommsAutomatisationsTab";

export default function SalesDashboardPage() {
    const { setSuggestions } = usePageActions();
    const [activeTab, setActiveTab] = useState("traitement-commandes");

    // Listen for tab changes from Ecosystem Bar
    useEffect(() => {
        const handleTabChange = (e: CustomEvent<{ tabId: string; pathname: string }>) => {
            if (e.detail.pathname === '/sales-dashboard') {
                setActiveTab(e.detail.tabId);
            }
        };
        window.addEventListener('page-tab-change', handleTabChange as EventListener);
        return () => window.removeEventListener('page-tab-change', handleTabChange as EventListener);
    }, []);

    useEffect(() => {
        setSuggestions([
            { id: "1", type: "trend", title: "Taux de Retour Élevé", description: "Vérifiez la qualité des 3 produits les plus retournés" },
            { id: "2", type: "timing", title: "Heures de Pointe", description: "La plupart des commandes confirmées entre 14h-17h" },
            { id: "3", type: "improvement", title: "Bot GPS", description: "Activez le bot GPS pour améliorer les livraisons" }
        ]);
        return () => setSuggestions([]);
    }, [setSuggestions]);

    return (
        <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto pb-20">
            {/* Hub Header */}
            <PageHeader
                title="Centre de Confirmation"
                description="Gestion des Commandes & Clients"
                icon={<BarChart className="h-6 w-6 text-[hsl(var(--accent-green))]" />}
            />

            {/* Tab Contents - Navigation handled by Ecosystem Bar */}
            <Tabs value={activeTab} className="w-full">
                <TabsContent value="traitement-commandes" className="mt-0">
                    <TraitementCommandesTab />
                </TabsContent>

                <TabsContent value="risque-clients" className="mt-0">
                    <RisqueClientsTab />
                </TabsContent>

                <TabsContent value="performance-sources" className="mt-0">
                    <PerformanceSourcesTab />
                </TabsContent>

                <TabsContent value="comms-automatisations" className="mt-0">
                    <CommsAutomatisationsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
