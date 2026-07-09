"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import { Calculator, TrendingUp, Users, Target, Lightbulb, Info } from "lucide-react";
import { Badge } from "@/components/core/ui/badge";

export function InfluencerRateCalculator() {
    const [followers, setFollowers] = useState("");
    const [engagement, setEngagement] = useState("");
    const [deliverable, setDeliverable] = useState("post");
    const [calculatedRate, setCalculatedRate] = useState<{ min: number; max: number; tier: string } | null>(null);

    const calculateRate = () => {
        const followerCount = parseInt(followers.replace(/,/g, ""));
        const engagementRate = parseFloat(engagement);

        if (!followerCount || !engagementRate) return;

        let baseMin = 0;
        let baseMax = 0;
        let tier = "";

        // Tier-based pricing (DZD)
        if (followerCount < 10000) {
            tier = "Nano";
            baseMin = 2000;
            baseMax = 5000;
        } else if (followerCount < 100000) {
            tier = "Micro";
            baseMin = 15000;
            baseMax = 100000;
        } else if (followerCount < 500000) {
            tier = "Macro";
            baseMin = 80000;
            baseMax = 500000;
        } else {
            tier = "Mega";
            baseMin = 300000;
            baseMax = 1000000;
        }

        // Adjust for engagement rate
        const engagementMultiplier = engagementRate > 5 ? 1.2 : engagementRate > 3 ? 1.0 : 0.85;

        // Adjust for deliverable type
        const deliverableMultiplier =
            deliverable === "story" ? 0.6 :
                deliverable === "reel" ? 1.3 :
                    deliverable === "video" ? 1.5 : 1.0;

        const finalMin = Math.round(baseMin * engagementMultiplier * deliverableMultiplier);
        const finalMax = Math.round(baseMax * engagementMultiplier * deliverableMultiplier);

        setCalculatedRate({ min: finalMin, max: finalMax, tier });
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat().format(num);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-500" />
                    Influencer Rate Calculator
                </h2>
                <p className="text-sm text-muted-foreground">
                    Calculate fair pricing for influencer campaigns based on market standards in Algeria (DZD).
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Campaign Details</CardTitle>
                        <CardDescription>Enter influencer metrics and deliverable type</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="followers">Follower Count</Label>
                            <Input
                                id="followers"
                                type="text"
                                placeholder="e.g., 50000"
                                value={followers}
                                onChange={(e) => setFollowers(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="engagement">Engagement Rate (%)</Label>
                            <Input
                                id="engagement"
                                type="text"
                                placeholder="e.g., 4.5"
                                value={engagement}
                                onChange={(e) => setEngagement(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deliverable">Deliverable Type</Label>
                            <Select value={deliverable} onValueChange={setDeliverable}>
                                <SelectTrigger id="deliverable">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="post">Feed Post</SelectItem>
                                    <SelectItem value="story">Story (24h)</SelectItem>
                                    <SelectItem value="reel">Reel/Short Video</SelectItem>
                                    <SelectItem value="video">Long-form Video</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={calculateRate} className="w-full gap-2">
                            <Calculator className="h-4 w-4" /> Calculate Rate
                        </Button>
                    </CardContent>
                </Card>

                {/* Results */}
                <Card className={calculatedRate ? "border-primary/50 bg-primary/5" : ""}>
                    <CardHeader>
                        <CardTitle className="text-lg">Suggested Rate</CardTitle>
                        <CardDescription>Based on Algerian market standards</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {calculatedRate ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Influencer Tier</span>
                                    <Badge className="bg-primary">{calculatedRate.tier}</Badge>
                                </div>

                                <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-6 rounded-xl border border-primary/30">
                                    <p className="text-sm text-muted-foreground mb-2">Suggested Price Range</p>
                                    <p className="text-3xl font-bold">
                                        {formatNumber(calculatedRate.min)} - {formatNumber(calculatedRate.max)} DZD
                                    </p>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                                        <p className="text-muted-foreground">
                                            This range reflects current market rates for {calculatedRate.tier.toLowerCase()}-tier influencers in Algeria.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                                        <p className="text-muted-foreground">
                                            Price adjusted for engagement rate and deliverable type.
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Users className="h-4 w-4 text-purple-500 mt-0.5" />
                                        <p className="text-muted-foreground">
                                            <strong>vs Market Average:</strong> {
                                                (() => {
                                                    const midPoint = (calculatedRate.min + calculatedRate.max) / 2;
                                                    const avgMarket = calculatedRate.tier === "Nano" ? 3500 :
                                                        calculatedRate.tier === "Micro" ? 57500 :
                                                            calculatedRate.tier === "Macro" ? 290000 : 650000;
                                                    const diff = ((midPoint - avgMarket) / avgMarket * 100).toFixed(0);
                                                    const isAbove = parseFloat(diff) > 0;
                                                    return <span className={isAbove ? "text-orange-500" : "text-green-500"}>
                                                        {isAbove ? `+${diff}%` : `${diff}%`} {isAbove ? "above" : "below"} average
                                                    </span>;
                                                })()
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <Calculator className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                                <p className="text-muted-foreground">
                                    Enter campaign details to calculate the suggested rate
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Reference Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Rate Reference Guide (DZD)</CardTitle>
                    <CardDescription>Standard pricing tiers for feed posts in Algeria</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg bg-muted/30">
                            <Badge className="mb-2" variant="secondary">Nano</Badge>
                            <p className="text-xs text-muted-foreground mb-1">1K - 10K followers</p>
                            <p className="font-bold">2,000 - 5,000 DZD</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                            <Badge className="mb-2" variant="secondary">Micro</Badge>
                            <p className="text-xs text-muted-foreground mb-1">10K - 100K followers</p>
                            <p className="font-bold">15,000 - 100,000 DZD</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                            <Badge className="mb-2" variant="secondary">Macro</Badge>
                            <p className="text-xs text-muted-foreground mb-1">100K - 500K followers</p>
                            <p className="font-bold">80,000 - 500,000 DZD</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                            <Badge className="mb-2" variant="secondary">Mega</Badge>
                            <p className="text-xs text-muted-foreground mb-1">500K+ followers</p>
                            <p className="font-bold">300,000+ DZD</p>
                        </div>
                    </div>
                </CardContent>
            </Card>


            {/* Negotiation Tips */}
            <Card className="border-blue-500/20 bg-blue-500/5">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        Negotiation Baseline & Tips
                    </CardTitle>
                    <CardDescription>Strategies for fair and effective collaboration</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <p className="text-sm font-semibold flex items-center gap-2">
                            <Info className="h-4 w-4 text-blue-500" />
                            Negotiation Tactics
                        </p>
                        <ul className="text-xs space-y-2 text-muted-foreground list-disc list-inside">
                            <li><strong>Start with the Baseline:</strong> Use the suggested range as your opening offer.</li>
                            <li><strong>Value Alignment:</strong> Offer higher if their audience perfectly matches your niche.</li>
                            <li><strong>Long-term Deals:</strong> Ask for a 15-20% discount for a 3-month partnership.</li>
                            <li><strong>Bundle Packages:</strong> Negotiate a fixed price for multiple stories + 1 reel.</li>
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <p className="text-sm font-semibold flex items-center gap-2">
                            <Target className="h-4 w-4 text-purple-500" />
                            What to Watch For
                        </p>
                        <ul className="text-xs space-y-2 text-muted-foreground list-disc list-inside">
                            <li><strong>Production Quality:</strong> Premium production justify higher-end rates.</li>
                            <li><strong>Usage Rights:</strong> Expect to pay 20-30% more for usage in your ads.</li>
                            <li><strong>Exclusivity:</strong> 30-day exclusivity usually adds 50% to the base fee.</li>
                            <li><strong>Urgency:</strong> Rush deliveries (under 48h) usually incur a &quot;rush fee&quot;.</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
