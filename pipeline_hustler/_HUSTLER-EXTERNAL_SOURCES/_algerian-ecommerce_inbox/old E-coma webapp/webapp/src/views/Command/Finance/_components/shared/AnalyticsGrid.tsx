"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { ShoppingCart, DollarSign, BarChart, TrendingUp, Layout, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnalyticsData {
    orders: { value: string; change: number };
    revenue: { value: string; change: number };
    traffic: { value: string; change: number };
    bestsellers: { value: string; change: number };
    landingpages: { value: string; change: number };
    bundles: { value: string; change: number };
}

const STAT_SECTIONS = [
    { id: 'orders', label: 'Commandes', icon: ShoppingCart },
    { id: 'revenue', label: 'Revenu Des Ventes', icon: DollarSign },
    { id: 'traffic', label: 'Trafic Total', icon: BarChart },
    { id: 'bestsellers', label: 'Produits Les Plus Vendus', icon: TrendingUp },
    { id: 'landingpages', label: 'Meilleurs Landing Pages', icon: Layout },
    { id: 'bundles', label: 'Meilleurs Lots', icon: Package },
] as const;

export function AnalyticsGrid({ data }: { data: AnalyticsData }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STAT_SECTIONS.map(section => (
                <Card key={section.id}>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {section.label}
                            </CardTitle>
                            <section.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data[section.id].value}</div>
                        <div className={cn(
                            "text-xs mt-1",
                            data[section.id].change >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                            {data[section.id].change >= 0 ? '+' : ''}{data[section.id].change}% vs période précédente
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
