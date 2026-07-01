"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Calendar, TrendingUp, DollarSign, Target } from "lucide-react";
import { ScrollReveal, AnimatedKPI, NumberTicker } from "@/components/core/ui/advanced-motion";
import { StaggeredList } from "@/components/core/ui/page-transition";
import { ROASTrendChart, SpendVsRevenueChart } from "@/views/Growth/Marketing/_components/charts/marketing-charts";
import { KPIGrid } from "@/components/core/ui/kpi-card";

export default function ROASAnalyzerPage() {
    return (
        <div className="p-4 md:p-6 space-y-8 rounded-xl min-h-screen">
            <ScrollReveal direction="down">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Target className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                            ROAS Analyzer
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">Deep dive into your Return on Ad Spend.</p>
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Last 30 Days
                    </Button>
                </div>
            </ScrollReveal>

            <KPIGrid columns={3}>
                <AnimatedKPI
                    title="Average ROAS"
                    value={3.2}
                    suffix="x"
                    icon={<Target className="h-5 w-5" />}
                    trend="up"
                    index={0}
                />
                <AnimatedKPI
                    title="Total Revenue"
                    value={128500}
                    prefix="$"
                    icon={<DollarSign className="h-5 w-5" />}
                    trend="up"
                    index={1}
                />
                <AnimatedKPI
                    title="Ad Spend"
                    value={40150}
                    prefix="$"
                    icon={<TrendingUp className="h-5 w-5" />}
                    trend="down" // Spending more is "down" in some contexts, but let's keep it neutral or up if scaling
                    index={2}
                />
            </KPIGrid>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ScrollReveal delay={0.2} direction="right">
                    <Card className="border-slate-200 dark:border-border h-full">
                        <CardHeader>
                            <CardTitle>ROAS Over Time</CardTitle>
                            <CardDescription>Daily ROAS trend vs. Break-even point.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ROASTrendChart />
                        </CardContent>
                    </Card>
                </ScrollReveal>

                <ScrollReveal delay={0.3} direction="left">
                    <Card className="border-slate-200 dark:border-border h-full">
                        <CardHeader>
                            <CardTitle>Spend vs. Revenue</CardTitle>
                            <CardDescription>Correlation between ad spend and total sales.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                            <SpendVsRevenueChart />
                        </CardContent>
                    </Card>
                </ScrollReveal>
            </div>

            <ScrollReveal delay={0.4}>
                <Card className="border-slate-200 dark:border-border">
                    <CardHeader>
                        <CardTitle>Performance by Platform</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StaggeredList className="space-y-4">
                            {[
                                { platform: "Facebook", spend: 5400, revenue: 18900, roas: 3.5 },
                                { platform: "Instagram", spend: 3200, revenue: 12800, roas: 4.0 },
                                { platform: "TikTok", spend: 1500, revenue: 2250, roas: 1.5 },
                                { platform: "Google Ads", spend: 800, revenue: 3200, roas: 4.0 },
                            ].map((item) => (
                                <div key={item.platform} className="flex items-center justify-between p-4 bg-white dark:bg-card border border-slate-100 dark:border-border rounded-lg hover:shadow-md transition-shadow">
                                    <div className="font-bold text-slate-900 dark:text-foreground w-32">{item.platform}</div>
                                    <div className="text-center">
                                        <div className="text-xs text-slate-500 dark:text-muted-foreground uppercase">Spend</div>
                                        <div className="font-medium text-slate-900 dark:text-foreground"><NumberTicker value={item.spend} prefix="$" /></div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-slate-500 dark:text-muted-foreground uppercase">Revenue</div>
                                        <div className="font-medium text-slate-900 dark:text-foreground"><NumberTicker value={item.revenue} prefix="$" /></div>
                                    </div>
                                    <div className="text-right w-24">
                                        <div className="text-xs text-slate-500 dark:text-muted-foreground uppercase mb-1">ROAS</div>
                                        <Badge className={item.roas >= 3 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200"}>
                                            {item.roas}x
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </StaggeredList>
                    </CardContent>
                </Card>
            </ScrollReveal>
        </div>
    );
}
