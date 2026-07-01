"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Users, Flame, CreditCard, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { NumberTicker } from "@/components/core/ui/advanced-motion";

interface FunnelStage {
    id: string;
    label: string;
    count: number;
    icon: React.ReactNode;
    color: string;
}

interface LifecycleFunnelProps {
    stages?: FunnelStage[];
    className?: string;
}

const defaultStages: FunnelStage[] = [
    { id: "new", label: "New Lead", count: 120, icon: <Users className="h-4 w-4" />, color: "bg-blue-500" },
    { id: "hot", label: "Hot Lead", count: 85, icon: <Flame className="h-4 w-4" />, color: "bg-orange-500" },
    { id: "payment", label: "Payment", count: 52, icon: <CreditCard className="h-4 w-4" />, color: "bg-purple-500" },
    { id: "customer", label: "Customer", count: 48, icon: <UserCheck className="h-4 w-4" />, color: "bg-green-500" },
];

export function LifecycleFunnel({ stages = defaultStages, className }: LifecycleFunnelProps) {
    const totalLeads = stages[0]?.count || 1;

    return (
        <Card className={cn("hover:shadow-lg transition-shadow", className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Lead Lifecycle Funnel</CardTitle>
                <p className="text-sm text-muted-foreground">Track lead progression to customer</p>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between gap-2">
                    {stages.map((stage, index) => {
                        const conversionRate = ((stage.count / totalLeads) * 100).toFixed(0);
                        const dropOff = index > 0
                            ? ((stages[index - 1].count - stage.count) / stages[index - 1].count * 100).toFixed(0)
                            : null;

                        return (
                            <React.Fragment key={stage.id}>
                                <div className="flex-1 text-center group">
                                    {/* Stage Icon & Count */}
                                    <div className={cn(
                                        "mx-auto w-12 h-12 rounded-full flex items-center justify-center text-white mb-2",
                                        "transition-transform group-hover:scale-110",
                                        stage.color
                                    )}>
                                        {stage.icon}
                                    </div>

                                    {/* Count */}
                                    <p className="text-lg font-bold">
                                        <NumberTicker value={stage.count} duration={1} />
                                    </p>

                                    {/* Label */}
                                    <p className="text-xs text-muted-foreground truncate">{stage.label}</p>

                                    {/* Conversion Rate */}
                                    <p className={cn(
                                        "text-xs font-medium mt-1",
                                        index === stages.length - 1 ? "text-green-500" : "text-muted-foreground"
                                    )}>
                                        {conversionRate}%
                                    </p>

                                    {/* Drop-off indicator */}
                                    {dropOff && parseInt(dropOff) > 0 && (
                                        <p className="text-[10px] text-red-400">-{dropOff}%</p>
                                    )}
                                </div>

                                {/* Arrow between stages */}
                                {index < stages.length - 1 && (
                                    <ArrowRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Overall conversion */}
                <div className="mt-4 pt-3 border-t flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall Conversion</span>
                    <span className="font-bold text-green-500">
                        {((stages[stages.length - 1]?.count || 0) / totalLeads * 100).toFixed(1)}%
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
