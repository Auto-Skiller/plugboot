"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    Wallet,
    ShieldCheck,
    Play,
    Pause,
    Plus,
    DollarSign,
    Clock
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import CurrencyTracker from "../CurrencyTracker";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Stop-loss rules
const stopLossRules = [
    { id: 1, name: "Alerte ROAS Faible", condition: "ROAS < 2.0x pendant 24h", action: "Pause Campagne", status: "active", triggered: 3 },
    { id: 2, name: "Dépassement Budget", condition: "Dépense > 110% budget jour", action: "Stop Pubs", status: "active", triggered: 1 },
    { id: 3, name: "CTR en Baisse", condition: "CTR < 0.5%", action: "Notification", status: "paused", triggered: 0 },
];

// Budget stats
const budgetStats = {
    dailyBudget: "15,000 DA",
    spent: "8,450 DA",
    remaining: "6,550 DA",
    projectedSpend: "14,200 DA",
};

export function BudgetReglesTab() {
    return (
        <div className="space-y-6">
            {/* Budget Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Wallet className="h-5 w-5 text-blue-500" />
                            <span className="text-sm text-muted-foreground">Budget Jour</span>
                        </div>
                        <p className="text-2xl font-bold">{budgetStats.dailyBudget}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5 text-orange-500" />
                            <span className="text-sm text-muted-foreground">Dépensé</span>
                        </div>
                        <p className="text-2xl font-bold">{budgetStats.spent}</p>
                        <p className="text-xs text-muted-foreground">56% du budget</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Wallet className="h-5 w-5 text-green-500" />
                            <span className="text-sm text-muted-foreground">Restant</span>
                        </div>
                        <p className="text-2xl font-bold">{budgetStats.remaining}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-5 w-5 text-purple-500" />
                            <span className="text-sm text-muted-foreground">Projection</span>
                        </div>
                        <p className="text-2xl font-bold">{budgetStats.projectedSpend}</p>
                        <p className="text-xs text-muted-foreground">Fin de journée</p>
                    </CardContent>
                </Card>
            </div>

            {/* Stop-Loss Rules */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShieldCheck className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                            Règles Stop-Loss Intelligentes
                        </CardTitle>
                        <CardDescription>Protection automatique de vos dépenses</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="h-3.5 w-3.5" />
                        Ajouter Règle
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {stopLossRules.map((rule) => (
                            <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${rule.status === "active" ? "bg-green-100 text-green-600" : "bg-muted"}`}>
                                        {rule.status === "active" ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{rule.name}</p>
                                        <p className="text-xs text-muted-foreground">{rule.condition}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary">{rule.action}</Badge>
                                    {rule.triggered > 0 && (
                                        <span className="text-xs text-muted-foreground">{rule.triggered}x déclenché</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Currency Tracker */}
            <FeatureCluster
                title="Suivi des Devises EUR/DZD"
                icon={<DollarSign className="h-5 w-5" />}
                storageKey="ads-currency"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-green))]"
            >
                <CurrencyTracker />
            </FeatureCluster>
        </div>
    );
}
