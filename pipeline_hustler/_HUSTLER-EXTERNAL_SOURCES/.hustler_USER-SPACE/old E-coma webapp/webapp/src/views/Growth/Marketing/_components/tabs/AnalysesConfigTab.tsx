"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    BarChart3,
    DollarSign,
    TrendingUp,
    Users,
    ArrowUpRight,
    Download,
    FileText,
    Settings,
    Clock
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";

// KPI Data
const kpiData = [
    { title: "Total Affiliés", value: "24", change: "+3", icon: Users },
    { title: "Commissions Totales", value: "145,200 DA", change: "+12%", icon: DollarSign },
    { title: "Ventes Affiliés", value: "342", change: "+18%", icon: TrendingUp },
    { title: "Taux Conversion", value: "8.2%", change: "+1.2%", icon: BarChart3 },
];

// Performance by channel
const channelPerformance = [
    { name: "Instagram", affiliates: 12, sales: 180, revenue: "85,000 DA", growth: "+15%" },
    { name: "Facebook", affiliates: 8, sales: 120, revenue: "48,000 DA", growth: "+8%" },
    { name: "TikTok", affiliates: 4, sales: 42, revenue: "12,200 DA", growth: "+35%" },
];

export function AnalysesConfigTab() {
    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpiData.map((kpi) => (
                    <Card key={kpi.title} className="border-2 hover:shadow-md">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <kpi.icon className="h-4 w-4 text-primary" />
                                </div>
                                <span className="text-xs font-medium text-green-600 flex items-center gap-0.5">
                                    {kpi.change}<ArrowUpRight className="h-3 w-3" />
                                </span>
                            </div>
                            <p className="text-2xl font-bold">{kpi.value}</p>
                            <p className="text-xs text-muted-foreground">{kpi.title}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Channel Performance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                        Performance par Canal
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {channelPerformance.map((channel) => (
                            <div key={channel.name} className="flex items-center justify-between p-4 rounded-lg border">
                                <div className="flex items-center gap-4">
                                    <div className="font-medium">{channel.name}</div>
                                    <Badge variant="secondary">{channel.affiliates} affiliés</Badge>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="font-bold">{channel.sales} ventes</p>
                                        <p className="text-xs text-muted-foreground">{channel.revenue}</p>
                                    </div>
                                    <Badge variant="outline" className="text-green-600">
                                        {channel.growth}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                            <FileText className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="font-medium">Générer Rapport</p>
                            <p className="text-sm text-muted-foreground">Rapport de performance</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                            <Download className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                            <p className="font-medium">Exporter Données</p>
                            <p className="text-sm text-muted-foreground">CSV, Excel</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                            <Settings className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="font-medium">Paramètres</p>
                            <p className="text-sm text-muted-foreground">Configuration</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Scheduled Reports - Coming Soon */}
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/95 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <Badge variant="secondary" className="gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        Bientôt Disponible
                    </Badge>
                </div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-[hsl(var(--accent-purple))]" />
                        Rapports Automatiques
                    </CardTitle>
                    <CardDescription>Configurez les rapports programmés</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-24 bg-muted/30 rounded-lg" />
                </CardContent>
            </Card>
        </div>
    );
}
