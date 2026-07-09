"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Badge } from "@/components/core/ui/badge";
import { Sparkles, BarChart3, TrendingUp, Trophy } from "lucide-react";

// Mock Data
const AI_SCORED_PRODUCTS = [
    {
        id: 1,
        name: "Magnetic Phone Mount",
        score: 94,
        category: "winner",
        potential: "High",
        reason: "Viral on TikTok + Rising Search Volume"
    },
    {
        id: 2,
        name: "Waterproof Pet Bed",
        score: 88,
        category: "potential",
        potential: "Medium",
        reason: "Seasonal Trend (Winter) + Low Competition"
    },
    {
        id: 3,
        name: "LED Galaxy Projector",
        score: 91,
        category: "winner",
        potential: "High",
        reason: "Consistent Best Seller + New Variant Hype"
    }
];

export default function WinningProductAiScore() {
    return (
        <Card className="bg-gradient-to-br from-indigo-50/50 to-pink-50/50 dark:from-indigo-900/10 dark:to-pink-900/10">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
                            <Sparkles className="h-5 w-5 text-indigo-500" />
                            Products AI Score Rating
                        </CardTitle>
                        <CardDescription>AI analysis of winning product potential</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {AI_SCORED_PRODUCTS.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-indigo-100/50 dark:border-indigo-800/30">
                            <div className="flex items-center gap-4">
                                <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-full font-bold text-sm ${product.score > 90 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-md' :
                                        'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }`}>
                                    {product.score}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">{product.name}</h4>
                                    <p className="text-xs text-muted-foreground">{product.reason}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={product.category === 'winner' ? 'default' : 'secondary'}>
                                    {product.category === 'winner' ? <Trophy className="h-3 w-3 mr-1" /> : null}
                                    {product.potential} Potential
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
