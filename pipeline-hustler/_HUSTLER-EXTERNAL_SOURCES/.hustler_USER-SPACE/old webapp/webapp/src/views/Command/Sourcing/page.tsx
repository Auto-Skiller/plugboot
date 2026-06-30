"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/core/ui/tabs";
import { Calculator, Globe, MapPin, Package, Search, Sparkles, TrendingUp } from "lucide-react";

// Existing Components
import SupplierDatabase from "@/views/Command/Sourcing/Suppliers/SupplierDatabase";
import { MarcheAlgerienTab } from "@/views/Command/Sourcing/product-research/_components/tabs/MarcheAlgerienTab";
import { RechercheTendancesTab } from "@/views/Command/Sourcing/product-research/_components/tabs/RechercheTendancesTab";
import { FournisseursCoutsTab } from "@/views/Command/Sourcing/product-research/_components/tabs/FournisseursCoutsTab";
import { ImportBudgetTracker } from "@/views/Command/Sourcing/_components/ImportBudgetTracker";
import CurrencyTracker from "@/views/Growth/AdsManager/ads/_components/CurrencyTracker";
import { TopProductsTable } from "@/views/Command/Sourcing/_components/TopProductsTable";

export default function SourcingPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Package className="h-6 w-6 text-orange-500" />
                    </div>
                    Découverte Produits (Sourcing)
                </h1>
                <p className="text-muted-foreground mt-1">
                    Product Search, Suppliers, and Import Intelligence
                </p>
            </div>

            <Tabs defaultValue="product-search" className="space-y-6">
                <TabsList className="grid w-full max-w-5xl grid-cols-6">
                    <TabsTrigger value="product-search" className="gap-2">
                        <Search className="h-4 w-4" /> Search
                    </TabsTrigger>
                    <TabsTrigger value="ai-winning" className="gap-2">
                        <Sparkles className="h-4 w-4" /> AI Score
                    </TabsTrigger>
                    <TabsTrigger value="algeria-trends" className="gap-2">
                        <TrendingUp className="h-4 w-4" /> DZ Trends
                    </TabsTrigger>
                    <TabsTrigger value="cost-calculator" className="gap-2">
                        <Calculator className="h-4 w-4" /> Costs
                    </TabsTrigger>
                    <TabsTrigger value="suppliers" className="gap-2">
                        <Package className="h-4 w-4" /> Suppliers
                    </TabsTrigger>
                    <TabsTrigger value="import-tracker" className="gap-2">
                        <Globe className="h-4 w-4" /> Import
                    </TabsTrigger>
                </TabsList>

                {/* Product Search */}
                <TabsContent value="product-search">
                    <RechercheTendancesTab />
                </TabsContent>

                {/* AI Winning Score */}
                <TabsContent value="ai-winning">
                    <Card>
                        <CardHeader><CardTitle>AI Winning Score</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <TopProductsTable />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Algeria Trends */}
                <TabsContent value="algeria-trends">
                    <MarcheAlgerienTab />
                </TabsContent>

                {/* Cost Calculator */}
                <TabsContent value="cost-calculator">
                    <FournisseursCoutsTab />
                </TabsContent>

                {/* Supplier Database */}
                <TabsContent value="suppliers">
                    <SupplierDatabase />
                </TabsContent>

                {/* Import Tracker */}
                <TabsContent value="import-tracker" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ImportBudgetTracker />
                        <CurrencyTracker />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
