/**
 * Zone 2: Growth Landing Page
 * Route: /growth
 * Shows overview and links to sub-pages
 */

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Target, Palette, ArrowRight, TrendingUp } from "lucide-react";

export default function GrowthPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-3 bg-green-500/10 rounded-xl">
                        <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                    Zone 2: النمو (Growth)
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    The Money Factory - Bring deliverable sales, not just traffic
                </p>
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <Link href="/growth/ads-manager">
                    <Card className="group hover:shadow-lg hover:border-green-200 dark:hover:border-green-800 transition-all cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-green-500" />
                                    Ads Manager
                                </span>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
                            </CardTitle>
                            <CardDescription>مدير الإعلانات</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Focus on Delivery Rate, not clicks. The real Algerian KPI for ad success.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/growth/creative-studio">
                    <Card className="group hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800 transition-all cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Palette className="h-5 w-5 text-purple-500" />
                                    Creative Studio
                                </span>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                            </CardTitle>
                            <CardDescription>ستوديو الإبداع</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Create content that sells - Darja Optimizer, UGC, Influencers. Darja converts better than Fusha!
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/growth/marketing">
                    <Card className="group hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-indigo-500" />
                                    Marketing Hub
                                </span>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                            </CardTitle>
                            <CardDescription>التسويق</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Influencer marketplace, Affiliate tracking, and comment automation bots.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}

export const metadata = {
    title: "Growth | E-Coma",
    description: "Zone 2: Growth - Ads Manager and Creative Studio"
};
