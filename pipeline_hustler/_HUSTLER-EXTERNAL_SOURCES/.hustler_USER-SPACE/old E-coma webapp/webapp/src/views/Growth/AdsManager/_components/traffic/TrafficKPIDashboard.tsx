"use client";

import { Card, CardContent } from "@/components/core/ui/card";
import { Users, Eye, LogOut, Clock, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrafficData {
    visitors: string;
    visitorsChange: number;
    pageviews: string;
    pageviewsChange: number;
    bounceRate: number;
    bounceChange: number;
    avgSession: string;
    sessionChange: number;
    conversionRate: number;
    conversionChange: number;
}

export function TrafficKPIDashboard({ data }: { data: TrafficData }) {
    const kpis = [
        {
            id: 'visitors',
            label: 'Visiteurs Uniques',
            value: data.visitors,
            change: data.visitorsChange,
            icon: Users,
            color: 'text-blue-600'
        },
        {
            id: 'pageviews',
            label: 'Pages Vues',
            value: data.pageviews,
            change: data.pageviewsChange,
            icon: Eye,
            color: 'text-green-600'
        },
        {
            id: 'bounce',
            label: 'Taux de Rebond',
            value: `${data.bounceRate}%`,
            change: -data.bounceChange, // negative is good for bounce rate
            icon: LogOut,
            color: 'text-orange-600',
            inverted: true
        },
        {
            id: 'session',
            label: 'Durée Moyenne',
            value: data.avgSession,
            change: data.sessionChange,
            icon: Clock,
            color: 'text-purple-600'
        },
        {
            id: 'conversion',
            label: 'Taux de Conversion',
            value: `${data.conversionRate}%`,
            change: data.conversionChange,
            icon: TrendingUp,
            color: 'text-emerald-600'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {kpis.map(kpi => (
                <Card key={kpi.id}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">{kpi.label}</span>
                            <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                        </div>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <div className={cn(
                            "text-xs mt-1 flex items-center gap-1",
                            (kpi.inverted ? kpi.change <= 0 : kpi.change >= 0)
                                ? "text-green-600"
                                : "text-red-600"
                        )}>
                            {kpi.change >= 0 ? (
                                <ArrowUp className="h-3 w-3" />
                            ) : (
                                <ArrowDown className="h-3 w-3" />
                            )}
                            {Math.abs(kpi.change)}%
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
