"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ROASData {
    adSpend: number;
    revenue: number;
    orders: number;
    leads: number;
    productCost: number;
}

export function ROASCalculatorCard({ data }: { data: ROASData }) {
    const roas = data.adSpend > 0 ? data.revenue / data.adSpend : 0;
    const cpo = data.orders > 0 ? data.adSpend / data.orders : 0;
    const cpl = data.leads > 0 ? data.adSpend / data.leads : 0;
    const profit = data.revenue - data.adSpend - data.productCost;
    const profitMargin = data.revenue > 0 ? (profit / data.revenue) * 100 : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Calculateur ROAS
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Dépenses Pub</p>
                    <p className="text-2xl font-bold text-red-600">{data.adSpend.toLocaleString()} DA</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Revenus</p>
                    <p className="text-2xl font-bold text-green-600">{data.revenue.toLocaleString()} DA</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
                    <p className="text-sm text-muted-foreground">ROAS</p>
                    <p className="text-3xl font-bold text-primary">{roas.toFixed(2)}x</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Coût Par Commande</p>
                    <p className="text-xl font-bold">{cpo.toFixed(0)} DA</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Coût Par Lead</p>
                    <p className="text-xl font-bold">{cpl.toFixed(0)} DA</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Marge Profit</p>
                    <p className={cn(
                        "text-xl font-bold",
                        profitMargin >= 20 ? "text-green-600" : profitMargin >= 0 ? "text-yellow-600" : "text-red-600"
                    )}>
                        {profitMargin.toFixed(1)}%
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
