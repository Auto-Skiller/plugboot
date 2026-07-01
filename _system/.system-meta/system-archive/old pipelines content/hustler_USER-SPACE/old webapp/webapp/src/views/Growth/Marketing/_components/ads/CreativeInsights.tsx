"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Progress } from "@/components/core/ui/progress";
import {
    Lightbulb, TrendingUp, TrendingDown, Eye, MousePointer,
    Video, Image as ImageIcon, Type, AlertTriangle, ArrowRight
} from "lucide-react";

// Mock creative performance data
const CREATIVE_INSIGHTS = [
    {
        id: 1,
        name: "Summer Sale Video",
        type: "video",
        impressions: "245K",
        ctr: 3.2,
        ctrTrend: "up",
        fatigue: 15,
        recommendation: "Performing well, keep running"
    },
    {
        id: 2,
        name: "Product Carousel",
        type: "carousel",
        impressions: "189K",
        ctr: 2.8,
        ctrTrend: "down",
        fatigue: 68,
        recommendation: "High fatigue - refresh creative"
    },
    {
        id: 3,
        name: "Testimonial Image",
        type: "image",
        impressions: "156K",
        ctr: 2.1,
        ctrTrend: "stable",
        fatigue: 42,
        recommendation: "Test new headline variations"
    },
    {
        id: 4,
        name: "UGC Review Video",
        type: "video",
        impressions: "312K",
        ctr: 4.1,
        ctrTrend: "up",
        fatigue: 8,
        recommendation: "Top performer - scale budget"
    },
];

const INSIGHTS_SUMMARY = [
    { label: "Videos outperform images by 45% CTR", type: "success" },
    { label: "3 creatives showing fatigue signs", type: "warning" },
    { label: "Best performing: UGC content", type: "info" },
];

export default function CreativeInsights() {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case "video": return <Video className="h-4 w-4" />;
            case "image": return <ImageIcon className="h-4 w-4" />;
            case "carousel": return <Type className="h-4 w-4" />;
            default: return <ImageIcon className="h-4 w-4" />;
        }
    };

    const getFatigueColor = (fatigue: number) => {
        if (fatigue < 30) return "bg-green-500";
        if (fatigue < 60) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                            Creative Insights
                        </CardTitle>
                        <CardDescription>
                            Analyze creative performance and get AI recommendations
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">Export Report</Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Quick Insights */}
                <div className="grid grid-cols-3 gap-3">
                    {INSIGHTS_SUMMARY.map((insight, i) => (
                        <div
                            key={i}
                            className={`p-3 rounded-lg border ${insight.type === "success" ? "bg-green-50 dark:bg-green-950/20 border-green-200" :
                                    insight.type === "warning" ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200" :
                                        "bg-blue-50 dark:bg-blue-950/20 border-blue-200"
                                }`}
                        >
                            <p className="text-sm font-medium">{insight.label}</p>
                        </div>
                    ))}
                </div>

                {/* Creative Performance Table */}
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-3 text-xs font-medium">Creative</th>
                                <th className="text-right p-3 text-xs font-medium">Impressions</th>
                                <th className="text-right p-3 text-xs font-medium">CTR</th>
                                <th className="text-left p-3 text-xs font-medium">Fatigue Level</th>
                                <th className="text-left p-3 text-xs font-medium">Recommendation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CREATIVE_INSIGHTS.map((creative) => (
                                <tr key={creative.id} className="border-t hover:bg-muted/30">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-muted rounded">
                                                {getTypeIcon(creative.type)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{creative.name}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{creative.type}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-right font-medium">{creative.impressions}</td>
                                    <td className="p-3 text-right">
                                        <span className="flex items-center justify-end gap-1">
                                            {creative.ctr}%
                                            {creative.ctrTrend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                                            {creative.ctrTrend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <Progress value={creative.fatigue} className={`h-2 w-20 ${getFatigueColor(creative.fatigue)}`} />
                                            <span className="text-xs text-muted-foreground">{creative.fatigue}%</span>
                                            {creative.fatigue >= 60 && (
                                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <p className="text-sm text-muted-foreground">{creative.recommendation}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* AI Recommendations */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white dark:bg-background rounded-lg">
                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium mb-1">AI Recommendation</p>
                            <p className="text-sm text-muted-foreground">
                                Based on your data, we recommend creating more UGC-style video content.
                                Your audience responds 45% better to authentic user-generated content compared to polished ads.
                            </p>
                            <Button size="sm" variant="link" className="px-0 mt-2">
                                Generate New Creatives <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
