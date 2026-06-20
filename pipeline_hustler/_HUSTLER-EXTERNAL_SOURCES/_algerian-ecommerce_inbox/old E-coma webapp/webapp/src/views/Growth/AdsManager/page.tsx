"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/core/ui/tabs";
import { Activity, BarChart3, Settings, Target, TrendingUp, Zap } from "lucide-react";

// Import existing components that were previously disconnected
import AdsCentral from "@/views/Growth/Marketing/_components/ads/AdsCentral";
import { CampagnesROASTab } from "@/views/Growth/AdsManager/ads/_components/tabs/CampagnesROASTab";
import { TraficTunnelTab } from "@/views/Growth/AdsManager/ads/_components/tabs/TraficTunnelTab";
import { BudgetReglesTab } from "@/views/Growth/AdsManager/ads/_components/tabs/BudgetReglesTab";
import { CompteRapportsTab } from "@/views/Growth/AdsManager/ads/_components/tabs/CompteRapportsTab";
import AccountHealthMonitor from "@/views/Growth/AdsManager/ads/_components/AccountHealthMonitor";

export default function AdsManagerPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <Target className="h-6 w-6 text-green-500" />
                    </div>
                    Gestionnaire Pubs (Ads Manager)
                </h1>
                <p className="text-muted-foreground mt-1">
                    Campaign Management, ROAS, and Traffic Analytics
                </p>
            </div>

            <Tabs defaultValue="campaigns" className="space-y-6">
                <TabsList className="grid w-full max-w-5xl grid-cols-6">
                    <TabsTrigger value="campaigns" className="gap-2">
                        <Target className="h-4 w-4" /> Campaigns
                    </TabsTrigger>
                    <TabsTrigger value="ai-rating" className="gap-2">
                        <Zap className="h-4 w-4" /> AI Rating
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2">
                        <BarChart3 className="h-4 w-4" /> Analytics
                    </TabsTrigger>
                    <TabsTrigger value="conversion-funnel" className="gap-2">
                        <TrendingUp className="h-4 w-4" /> Funnel
                    </TabsTrigger>
                    <TabsTrigger value="automation" className="gap-2">
                        <Settings className="h-4 w-4" /> Automation
                    </TabsTrigger>
                    <TabsTrigger value="accounts" className="gap-2">
                        <Activity className="h-4 w-4" /> Health
                    </TabsTrigger>
                </TabsList>

                {/* Campaigns - Combined view with AdsCentral and CampagnesROASTab */}
                <TabsContent value="campaigns" className="space-y-6">
                    <CampagnesROASTab />
                    <AdsCentral />
                </TabsContent>

                {/* AI Campaign Rating - Uses ROAS tab with AI scoring */}
                <TabsContent value="ai-rating">
                    <CampagnesROASTab />
                </TabsContent>

                {/* Traffic Analytics - Full traffic and funnel view */}
                <TabsContent value="analytics">
                    <TraficTunnelTab viewMode="analytics" />
                </TabsContent>

                {/* Conversion Funnel - Funnel visualization */}
                <TabsContent value="conversion-funnel">
                    <TraficTunnelTab viewMode="funnel" />
                </TabsContent>

                {/* Rules & Automation - Budget and stop-loss rules */}
                <TabsContent value="automation">
                    <BudgetReglesTab />
                </TabsContent>

                {/* Account Health - Health monitoring */}
                <TabsContent value="accounts">
                    <AccountHealthMonitor />
                </TabsContent>
            </Tabs>
        </div>
    );
}
