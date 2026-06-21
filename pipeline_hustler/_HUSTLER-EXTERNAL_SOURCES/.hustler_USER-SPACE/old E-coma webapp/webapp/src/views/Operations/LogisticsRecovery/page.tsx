"use client";

import { useState, useEffect } from "react";
import { Truck, Package, AlertTriangle, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/core/layout/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/core/ui/tabs";
import { usePageActions } from "@/components/core/layout/PageActionsContext";

// Import components from subdirectories
import { StockOverview } from "./Inventory/StockOverview";
import { LowStockAlerts } from "./Inventory/LowStockAlerts";
import StockLocations from "./Inventory/StockLocations";
import { CarrierStockSync } from "./Inventory/CarrierStockSync";
import { ValidationTabs } from "./_components/validation-tabs";

/**
 * LogisticsRecovery Page (Entrepôt)
 * Zone: Operations
 * Route: /operations/logistics
 * 
 * Manages warehouse logistics including:
 * - Stock Overview (État du Stock)
 * - Low Stock Alerts (Alertes)
 * - Stock Locations & Returns (Sites & Retours)
 * - Carrier Stock Sync
 */
export default function LogisticsRecoveryPage() {
    const { setSuggestions } = usePageActions();
    const [activeTab, setActiveTab] = useState("stock-overview");

    // Listen for tab changes from Ecosystem Bar
    useEffect(() => {
        const handleTabChange = (e: CustomEvent<{ tabId: string; pathname: string }>) => {
            if (e.detail.pathname === '/operations/logistics') {
                setActiveTab(e.detail.tabId);
            }
        };
        window.addEventListener('page-tab-change', handleTabChange as EventListener);
        return () => window.removeEventListener('page-tab-change', handleTabChange as EventListener);
    }, []);

    useEffect(() => {
        setSuggestions([
            { id: "1", type: "trend", title: "Stock Alert", description: "3 products below reorder threshold" },
            { id: "2", type: "timing", title: "Carrier Sync", description: "Sync pending with 2 delivery companies" },
            { id: "3", type: "improvement", title: "Returns", description: "5 returns awaiting processing" }
        ]);
        return () => setSuggestions([]);
    }, [setSuggestions]);

    return (
        <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto pb-20">
            {/* Hub Header */}
            <PageHeader
                title="Entrepôt"
                description="Logistics, Stock Management & Returns"
                icon={<Truck className="h-6 w-6 text-red-500" />}
            />

            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-2xl grid-cols-5">
                    <TabsTrigger value="stock-overview" className="gap-2">
                        <Package className="h-4 w-4" />
                        État du Stock
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Alertes
                    </TabsTrigger>
                    <TabsTrigger value="locations" className="gap-2">
                        <Truck className="h-4 w-4" />
                        Sites & Retours
                    </TabsTrigger>
                    <TabsTrigger value="carrier-sync" className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Carrier Sync
                    </TabsTrigger>
                    <TabsTrigger value="validation" className="gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Validation
                    </TabsTrigger>
                </TabsList>

                {/* Tab Contents */}
                <TabsContent value="stock-overview" className="mt-6">
                    <StockOverview />
                </TabsContent>

                <TabsContent value="alerts" className="mt-6">
                    <LowStockAlerts />
                </TabsContent>

                <TabsContent value="locations" className="mt-6">
                    <StockLocations />
                </TabsContent>

                <TabsContent value="carrier-sync" className="mt-6">
                    <CarrierStockSync />
                </TabsContent>

                <TabsContent value="validation" className="mt-6">
                    <ValidationTabs />
                </TabsContent>
            </Tabs>
        </div>
    );
}
