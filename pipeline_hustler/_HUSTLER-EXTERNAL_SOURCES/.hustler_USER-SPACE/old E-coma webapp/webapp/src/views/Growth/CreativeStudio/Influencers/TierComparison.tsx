"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Badge } from "@/components/core/ui/badge";
import { BarChart, TrendingUp, Users, Target, Star } from "lucide-react";

const TIER_DATA = [
    {
        tier: "Nano",
        followers: "1K - 10K",
        avgCPA: "45 DZD",
        engagement: "12.1%",
        reach: "Low",
        authenticity: "Very High",
        bestFor: "Local products, niche markets, community building",
        color: "bg-blue-500"
    },
    {
        tier: "Micro",
        followers: "10K - 100K",
        avgCPA: "38 DZD",
        engagement: "8.5%",
        reach: "Medium",
        authenticity: "High",
        bestFor: "Product reviews, tutorials, targeted campaigns",
        color: "bg-green-500"
    },
    {
        tier: "Macro",
        followers: "100K - 500K",
        avgCPA: "52 DZD",
        engagement: "4.2%",
        reach: "High",
        authenticity: "Medium",
        bestFor: "Brand awareness, mass market products, launches",
        color: "bg-purple-500"
    },
    {
        tier: "Mega",
        followers: "500K+",
        avgCPA: "68 DZD",
        engagement: "2.8%",
        reach: "Very High",
        authenticity: "Low",
        bestFor: "National campaigns, celebrity endorsements",
        color: "bg-orange-500"
    },
];

export function TierComparison() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-purple-500" />
                    Influencer Tier Comparison
                </h2>
                <p className="text-sm text-muted-foreground">
                    Compare performance metrics across different influencer tiers to make data-driven budget allocation decisions.
                </p>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {TIER_DATA.map((tier) => (
                    <Card key={tier.tier} className="relative overflow-hidden border-2 hover:shadow-lg transition-all">
                        <div className={`absolute top-0 left-0 right-0 h-1 ${tier.color}`} />
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between mb-2">
                                <Badge className={`${tier.color} text-white`}>{tier.tier}</Badge>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-lg">{tier.followers}</CardTitle>
                            <CardDescription className="text-xs">followers</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Metrics */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Target className="h-3 w-3" />
                                        <span>Avg CPA</span>
                                    </div>
                                    <span className="font-bold text-sm">{tier.avgCPA}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>Engagement</span>
                                    </div>
                                    <span className="font-bold text-sm text-green-600">{tier.engagement}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Users className="h-3 w-3" />
                                        <span>Reach</span>
                                    </div>
                                    <span className="font-bold text-sm">{tier.reach}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Star className="h-3 w-3" />
                                        <span>Authenticity</span>
                                    </div>
                                    <span className="font-bold text-sm">{tier.authenticity}</span>
                                </div>
                            </div>

                            {/* Best For */}
                            <div className="pt-3 border-t">
                                <p className="text-xs text-muted-foreground mb-1.5">Best For:</p>
                                <p className="text-xs leading-relaxed">{tier.bestFor}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recommendations */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-lg">Smart Budget Allocation Recommendations</CardTitle>
                    <CardDescription>Based on historical campaign performance in Algeria</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-background p-4 rounded-lg border">
                            <p className="font-semibold mb-2 text-sm">💰 High Budget Campaigns</p>
                            <p className="text-xs text-muted-foreground">
                                Mix of <strong>Macro</strong> (60%) for awareness + <strong>Micro</strong> (40%) for conversions
                            </p>
                        </div>
                        <div className="bg-background p-4 rounded-lg border">
                            <p className="font-semibold mb-2 text-sm">🎯 ROI-Focused Campaigns</p>
                            <p className="text-xs text-muted-foreground">
                                Invest heavily in <strong>Micro</strong> (70%) + <strong>Nano</strong> (30%) for best CPA
                            </p>
                        </div>
                        <div className="bg-background p-4 rounded-lg border">
                            <p className="font-semibold mb-2 text-sm">🚀 New Product Launch</p>
                            <p className="text-xs text-muted-foreground">
                                Start with <strong>Nano/Micro</strong> for testing, scale to <strong>Macro</strong> if proven
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
