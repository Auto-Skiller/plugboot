"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Progress } from "@/components/core/ui/progress";
import {
    Zap, TrendingUp, DollarSign, Target, ArrowRight,
    CheckCircle, AlertTriangle, Sparkles, RefreshCw
} from "lucide-react";

// Mock optimization suggestions
const OPTIMIZATION_SUGGESTIONS = [
    {
        id: 1,
        type: "budget",
        title: "Increase budget for top performer",
        description: "Ad 'Summer Collection Video' has 4.1x ROAS. Consider increasing daily budget by 30%.",
        impact: "high",
        potentialGain: "+35,000 DA revenue",
        action: "Apply"
    },
    {
        id: 2,
        type: "targeting",
        title: "Expand audience in Oran",
        description: "Your Oran audience shows 25% better conversion rate. Expand targeting to similar demographics.",
        impact: "medium",
        potentialGain: "+15% conversions",
        action: "Expand"
    },
    {
        id: 3,
        type: "creative",
        title: "Replace fatigued creative",
        description: "Product Carousel ad shows 68% fatigue. Replace with fresh creative to maintain performance.",
        impact: "high",
        potentialGain: "Prevent -40% CTR drop",
        action: "Refresh"
    },
    {
        id: 4,
        type: "timing",
        title: "Adjust ad schedule",
        description: "Best performance between 20:00-23:00. Consider shifting 40% of budget to evening hours.",
        impact: "low",
        potentialGain: "+8% CTR",
        action: "Schedule"
    },
];

const AB_TESTS = [
    { name: "Headline Test A/B", status: "running", winner: null, confidence: 72 },
    { name: "Image vs Video", status: "complete", winner: "Video", confidence: 95 },
    { name: "CTA Button Color", status: "running", winner: null, confidence: 45 },
];

export default function AdOptimizationHub() {
    const getImpactBadge = (impact: string) => {
        switch (impact) {
            case "high": return <Badge className="bg-red-100 text-red-700">High Impact</Badge>;
            case "medium": return <Badge className="bg-yellow-100 text-yellow-700">Medium Impact</Badge>;
            case "low": return <Badge className="bg-blue-100 text-blue-700">Low Impact</Badge>;
            default: return null;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "budget": return <DollarSign className="h-5 w-5 text-green-500" />;
            case "targeting": return <Target className="h-5 w-5 text-blue-500" />;
            case "creative": return <Sparkles className="h-5 w-5 text-purple-500" />;
            case "timing": return <RefreshCw className="h-5 w-5 text-orange-500" />;
            default: return <Zap className="h-5 w-5" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            AI Optimization Hub
                        </CardTitle>
                        <CardDescription>
                            AI-powered recommendations to improve your ad performance
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="gap-1">
                        <Sparkles className="h-3 w-3" /> 4 Suggestions
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Optimization Score */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">Account Optimization Score</span>
                        <span className="text-2xl font-bold text-green-600">78%</span>
                    </div>
                    <Progress value={78} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-2">
                        Apply the suggestions below to reach 95%+ optimization
                    </p>
                </div>

                {/* Suggestions List */}
                <div className="space-y-3">
                    <p className="text-sm font-medium">AI Recommendations</p>
                    {OPTIMIZATION_SUGGESTIONS.map((suggestion) => (
                        <div
                            key={suggestion.id}
                            className="p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex gap-3">
                                    <div className="p-2 bg-muted rounded-lg">
                                        {getTypeIcon(suggestion.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium">{suggestion.title}</p>
                                            {getImpactBadge(suggestion.impact)}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {suggestion.description}
                                        </p>
                                        <p className="text-sm font-medium text-green-600">
                                            Potential: {suggestion.potentialGain}
                                        </p>
                                    </div>
                                </div>
                                <Button size="sm" className="shrink-0">
                                    {suggestion.action}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* A/B Tests */}
                <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-3">Active A/B Tests</p>
                    <div className="space-y-2">
                        {AB_TESTS.map((test, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    {test.status === "complete" ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                                    )}
                                    <div>
                                        <p className="font-medium text-sm">{test.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {test.status === "complete"
                                                ? `Winner: ${test.winner}`
                                                : `${test.confidence}% confidence`}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant={test.status === "complete" ? "default" : "secondary"}>
                                    {test.status === "complete" ? "Complete" : "Running"}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
