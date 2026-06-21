"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    Target,
    DollarSign,
    TrendingUp,
    Play,
    Pause,
    Search,
    Sparkles
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Switch } from "@/components/core/ui/switch";
import { ScrollArea } from "@/components/core/ui/scroll-area";
import { cn } from "@/lib/utils";
import DeliveryRateKPI from "../DeliveryRateKPI";

// Mock campaign data
const campaigns = [
    { id: 1, name: "Promo Été - Video A", status: "active", spend: "12,500 DA", conversions: 45, roas: "3.2x", aiRating: 92, platform: "Instagram", impressions: "450K", ctr: "3.2%", revenue: "40,000 DA", deliveryRate: "85%" },
    { id: 2, name: "Flash Sale - Image B", status: "paused", spend: "8,200 DA", conversions: 12, roas: "1.8x", aiRating: 65, platform: "Facebook", impressions: "120K", ctr: "1.5%", revenue: "14,760 DA", deliveryRate: "60%" },
    { id: 3, name: "Nouvelle Collection", status: "draft", spend: "0 DA", conversions: 0, roas: "-", aiRating: null, platform: "TikTok", impressions: "-", ctr: "-", revenue: "0 DA", deliveryRate: "-" },
    { id: 4, name: "Retargeting Catalogue", status: "active", spend: "5,400 DA", conversions: 28, roas: "4.5x", aiRating: 88, platform: "Google", impressions: "85K", ctr: "2.1%", revenue: "24,300 DA", deliveryRate: "92%" },
];

// KPI data
const kpiData = [
    { title: "ROAS Global", value: "3.6x", change: "+9%", icon: Target, color: "text-[hsl(var(--accent-blue))]" },
    { title: "Dépenses Totales", value: "163,500 DA", change: "+11%", icon: DollarSign, color: "text-[hsl(var(--accent-green))]" },
    { title: "Revenus Totaux", value: "582,900 DA", change: "+14%", icon: TrendingUp, color: "text-[hsl(var(--accent-blue))]" },
    { title: "Campagnes Actives", value: "12", change: "+2", icon: Play, color: "text-[hsl(var(--accent-orange))]" },
];

export function CampagnesROASTab() {
    const [selectedId, setSelectedId] = useState<number | null>(1);
    const [showRealData, setShowRealData] = useState(false);

    const RATE_MULTIPLIER = 240 / 134;
    const selectedCampaign = campaigns.find(c => c.id === selectedId);

    return (
        <div className="space-y-6">
            {/* Data Toggle */}
            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border">
                <span className="text-sm font-medium">Mode Données</span>
                <div className="flex items-center gap-3">
                    <span className={`text-xs ${!showRealData ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                        Taux Officiel
                    </span>
                    <Switch checked={showRealData} onCheckedChange={setShowRealData} />
                    <span className={`text-xs ${showRealData ? 'font-bold text-[hsl(var(--accent-orange))]' : 'text-muted-foreground'}`}>
                        Coût Réel (+79%)
                    </span>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {kpiData.map((kpi) => (
                    <Card key={kpi.title} className="bg-card/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between pb-2">
                                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                            </div>
                            <div className="flex items-baseline gap-2 mt-2">
                                <h3 className="text-2xl font-bold">{kpi.value}</h3>
                                <span className="text-xs font-medium text-[hsl(var(--accent-green))]">{kpi.change}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                <DeliveryRateKPI delivered={480} totalOrders={600} trend={2.5} />
            </div>

            {/* Split View: Campaign List + Details */}
            <div className="grid grid-cols-12 gap-6 min-h-[400px]">
                {/* Campaign List */}
                <Card className="col-span-12 md:col-span-4 flex flex-col overflow-hidden">
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Rechercher..." className="pl-9" />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-3 space-y-2">
                            {campaigns.map((campaign) => (
                                <div
                                    key={campaign.id}
                                    onClick={() => setSelectedId(campaign.id)}
                                    className={cn(
                                        "p-4 rounded-lg border cursor-pointer transition-all",
                                        selectedId === campaign.id ? "bg-primary/5 border-primary/50" : "hover:bg-muted/30"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className={cn(
                                            "capitalize",
                                            campaign.status === "active" && "bg-green-100 text-green-700",
                                            campaign.status === "paused" && "bg-orange-100 text-orange-700",
                                            campaign.status === "draft" && "bg-gray-100 text-gray-700"
                                        )}>
                                            {campaign.status === "active" ? "Actif" : campaign.status === "paused" ? "Pause" : "Brouillon"}
                                        </Badge>
                                        {campaign.aiRating && (
                                            <span className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                                <Sparkles className="h-2.5 w-2.5" />{campaign.aiRating}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-sm mb-2">{campaign.name}</h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                        <div><span className="text-[10px] uppercase">Dépense</span><br /><span className="font-medium text-foreground">{campaign.spend}</span></div>
                                        <div><span className="text-[10px] uppercase">ROAS</span><br /><span className="font-medium text-foreground">{campaign.roas}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Campaign Details */}
                <Card className="col-span-12 md:col-span-8 overflow-hidden">
                    <CardContent className="p-6">
                        {selectedCampaign ? (
                            <div className="space-y-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedCampaign.name}</h2>
                                        <p className="text-muted-foreground text-sm">{selectedCampaign.platform} • {selectedCampaign.status}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">Éditer</Button>
                                        <Button variant="outline" size="sm">
                                            {selectedCampaign.status === "active" ? "Pause" : "Reprendre"}
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Card className="bg-primary/5"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Impressions</p><p className="text-xl font-bold">{selectedCampaign.impressions}</p></CardContent></Card>
                                    <Card className="bg-primary/5"><CardContent className="p-4"><p className="text-xs text-muted-foreground">CTR</p><p className="text-xl font-bold">{selectedCampaign.ctr}</p></CardContent></Card>
                                    <Card className="bg-primary/5"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Conversions</p><p className="text-xl font-bold">{selectedCampaign.conversions}</p></CardContent></Card>
                                    <Card className="bg-primary/5"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Taux Livraison</p><p className="text-xl font-bold">{selectedCampaign.deliveryRate}</p></CardContent></Card>
                                </div>
                                <Card className="bg-green-50 dark:bg-green-950/20">
                                    <CardContent className="p-4">
                                        <p className="text-xs text-green-600">Revenus</p>
                                        <p className="text-xl font-bold text-green-600">{selectedCampaign.revenue}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                Sélectionnez une campagne
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
