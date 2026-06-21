"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import {
    Globe,
    Target,
    Eye,
    MousePointerClick,
    Activity,
    TrendingUp
} from "lucide-react";
import { TrafficKPIDashboard } from '@/views/Growth/Marketing/_components/traffic/TrafficKPIDashboard';
import { TrafficSourcesChart } from '@/views/Growth/Marketing/_components/traffic/TrafficSourcesChart';
import { TopLandingPages } from '@/views/Growth/Marketing/_components/traffic/TopLandingPages';
import { TrafficTimelineChart } from '@/views/Growth/Marketing/_components/traffic/TrafficTimeline';
import { LifecycleFunnel } from "@/components/core/ui/charts/lifecycle-funnel";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Mock data
const trafficKpiData = {
    visitors: "24,521", visitorsChange: 12,
    pageviews: "89,432", pageviewsChange: 15,
    bounceRate: 38.2, bounceChange: -3,
    avgSession: "03:45", sessionChange: 8,
    conversionRate: 2.4, conversionChange: 0.5
};

const sourceData = [
    { name: 'Facebook Ads', value: 10298, percentage: 42 },
    { name: 'Instagram', value: 5885, percentage: 24 },
    { name: 'Direct', value: 4414, percentage: 18 },
    { name: 'WhatsApp', value: 2452, percentage: 10 },
    { name: 'Google', value: 1472, percentage: 6 },
];

const landingPages = [
    { title: 'Écouteurs Sans Fil', url: '/produits/ecouteurs', visitors: 12432, bounceRate: 32, conversions: 1020 },
    { title: 'Montre Connectée', url: '/produits/montre', visitors: 8921, bounceRate: 28, conversions: 670 },
];

const timelineData = [
    { date: '2023-11-01', visitors: 3200, pageviews: 12400, sessions: 3500 },
    { date: '2023-11-02', visitors: 3800, pageviews: 14200, sessions: 4100 },
    { date: '2023-11-03', visitors: 4100, pageviews: 15800, sessions: 4500 },
];

const ORDERS_SOURCE_DATA = [
    { name: "Facebook DM", value: 180, percentage: 40, fill: "#1877F2" },
    { name: "Instagram DM", value: 135, percentage: 30, fill: "#E4405F" },
    { name: "TikTok", value: 90, percentage: 20, fill: "#000000" },
    { name: "Autres", value: 45, percentage: 10, fill: "#64748b" },
];

const TRAFFIC_SOURCES_DATA = [
    { name: "Facebook Ads", visitors: 12500, orders: 520, revenue: 2600000, conversion: 4.2 },
    { name: "Instagram Organic", visitors: 8500, orders: 340, revenue: 1700000, conversion: 4.0 },
    { name: "TikTok Ads", visitors: 6200, orders: 248, revenue: 1240000, conversion: 4.0 },
    { name: "WhatsApp Referral", visitors: 3100, orders: 186, revenue: 930000, conversion: 6.0 },
];

// Engagement KPIs
const engagementData = [
    { metric: "Portée Totale", value: "1.2M", change: "+18%", icon: Eye },
    { metric: "Taux Engagement", value: "4.8%", change: "+0.6%", icon: Activity },
    { metric: "Taux de Clic", value: "2.3%", change: "+0.4%", icon: MousePointerClick },
    { metric: "Conversions", value: "3,420", change: "+22%", icon: Target },
];

interface TraficTunnelTabProps {
    viewMode?: "all" | "analytics" | "funnel";
}

export function TraficTunnelTab({ viewMode = "all" }: TraficTunnelTabProps) {
    const showAnalytics = viewMode === "all" || viewMode === "analytics";
    const showFunnel = viewMode === "all" || viewMode === "funnel";

    return (
        <div className="space-y-6">
            {/* Engagement KPIs - Always visible or maybe only in analytics? Keeping it for both for now as it seems relevant, or strictly analytics? 
                The user said "Analytics" shows traffic metrics and "Funnel" shows conversion funnel. 
                KPIs seem more analytics-heavy. Let's put them in Analytics for now, or keep them common?
                The original code had them at top. Let's keep them common IF they make sense, 
                but looking at the data (visitors, conversionRate) it seems relevant to both.
                However, to be clean, I will include it in Analytics mainly.
            */}

            {showAnalytics && (
                <>
                    {/* Engagement KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {engagementData.map((item) => (
                            <Card key={item.metric}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <item.icon className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-xs text-[hsl(var(--accent-green))]">{item.change}</span>
                                    </div>
                                    <p className="text-2xl font-bold mt-2">{item.value}</p>
                                    <p className="text-xs text-muted-foreground">{item.metric}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Traffic Analytics */}
                    <FeatureCluster
                        title="Analytics Trafic Pubs"
                        icon={<Globe className="h-5 w-5" />}
                        storageKey="ads-traffic-analytics"
                        defaultExpanded={true}
                        headerClassName="bg-[hsl(var(--accent-blue))]"
                    >
                        <div className="space-y-6">
                            <TrafficKPIDashboard data={trafficKpiData} />
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2"><TrafficTimelineChart data={timelineData} /></div>
                                <div><TrafficSourcesChart data={sourceData} /></div>
                            </div>
                            <TopLandingPages pages={landingPages} />
                        </div>
                    </FeatureCluster>
                </>
            )}

            {showFunnel && (
                /* Conversion Funnel */
                <FeatureCluster
                    title="Tunnel de Conversion"
                    icon={<TrendingUp className="h-5 w-5" />}
                    storageKey="ads-conversion-funnel"
                    defaultExpanded={true}
                    headerClassName="bg-[hsl(var(--accent-green))]"
                >
                    <LifecycleFunnel
                        ordersSourceData={ORDERS_SOURCE_DATA}
                        trafficSourcesData={TRAFFIC_SOURCES_DATA}
                        confirmationRate={78}
                        deliverySuccess={92}
                        returnRate={8}
                        hideTrafficSection={true}
                    />
                </FeatureCluster>
            )}
        </div>
    );
}
