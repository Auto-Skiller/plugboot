"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import {
    Instagram, Facebook, Video, Link2,
    ExternalLink, Edit, BarChart3,
    ArrowUpRight, TrendingUp
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";

// Mock Data - Combined platform info with growth data
const PLATFORMS = [
    {
        id: "instagram",
        name: "Instagram",
        icon: Instagram,
        color: "text-pink-500",
        bg: "bg-pink-50 dark:bg-pink-900/10",
        barColor: "bg-pink-500",
        stats: { followers: "12.5K", engagement: "4.2%" },
        biolink: { url: "bio.link/store", clicks: 1240 },
        growth: { followers: 45000, engagement: 25000, reach: 120000 }
    },
    {
        id: "facebook",
        name: "Facebook",
        icon: Facebook,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/10",
        barColor: "bg-blue-500",
        stats: { followers: "8.3K", engagement: "2.8%" },
        biolink: { url: "fb.me/store", clicks: 850 },
        growth: { followers: 12500, engagement: 8500, reach: 45000 }
    },
    {
        id: "tiktok",
        name: "TikTok",
        icon: Video,
        color: "text-black dark:text-white",
        bg: "bg-gray-50 dark:bg-gray-900/10",
        barColor: "bg-gray-800 dark:bg-gray-200",
        stats: { followers: "25.1K", engagement: "8.5%" },
        biolink: { url: "tiktok.com/@store", clicks: 3400 },
        growth: { followers: 28000, engagement: 18000, reach: 85000 }
    },
];

// Find max values for scaling mini bars
const maxReach = Math.max(...PLATFORMS.map(p => p.growth.reach));

// Mini progress bar component
function MiniBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
    const percentage = (value / max) * 100;
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground uppercase font-medium tracking-wide">{label}</span>
                <span className="font-bold">{(value / 1000).toFixed(1)}K</span>
            </div>
            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

// Exported component: Platform Cards with Growth Trends merged
export function PlatformCards() {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                Platform Hub
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PLATFORMS.map((platform) => (
                    <Card key={platform.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-card relative z-10 group border-none shadow-md">
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${platform.bg.replace('bg-', 'bg-gradient-to-br from-').replace(' ', ' to-transparent ')}`} />

                        <CardHeader className={`pb-4 border-b relative overflow-hidden`}>
                            <div className={`absolute inset-0 opacity-10 ${platform.bg}`} />
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 bg-white dark:bg-background rounded-xl shadow-sm ${platform.color} group-hover:scale-110 transition-transform duration-300`}>
                                        <platform.icon className="h-6 w-6" />
                                    </div>
                                    <span className="font-bold text-lg">{platform.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20">
                                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {/* Stats Section */}
                            <div className="grid grid-cols-2 divide-x border-b bg-muted/5">
                                <div className="p-5 text-center group-hover:bg-muted/10 transition-colors">
                                    <p className="text-2xl font-bold tracking-tight">{platform.stats.followers}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Followers</p>
                                </div>
                                <div className="p-5 text-center group-hover:bg-muted/10 transition-colors">
                                    <p className="text-2xl font-bold text-green-600">{platform.stats.engagement}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Engagement</p>
                                </div>
                            </div>

                            {/* Growth Trends Section (merged from PlatformGrowthTrends) */}
                            <div className="p-4 space-y-2 border-b bg-muted/5">
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                                    <span className="text-xs font-semibold">Growth Metrics</span>
                                </div>
                                <MiniBar value={platform.growth.reach} max={maxReach} color={platform.barColor} label="Reach" />
                                <MiniBar value={platform.growth.engagement} max={maxReach} color={platform.barColor} label="Engagement" />
                                <MiniBar value={platform.growth.followers} max={maxReach} color={platform.barColor} label="Followers" />
                            </div>

                            {/* Biolink Section */}
                            <div className="p-5 bg-background space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Link2 className="h-4 w-4 text-purple-500" />
                                    <span className="text-sm font-semibold">Biolink Manager</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-muted/30 border border-transparent hover:border-border rounded-xl transition-all group/link">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold truncate text-blue-600 hover:underline cursor-pointer">
                                            {platform.biolink.url}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                            {platform.biolink.clicks} clicks this week
                                        </p>
                                    </div>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover/link:opacity-100 transition-opacity">
                                        <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div >
    );
}

// Exported component: Platform Growth Trends chart only (kept for backward compatibility)
export function PlatformGrowthTrends() {
    // Now returns null since trends are merged into cards
    return null;
}

// Default export: Combined Platform Hub (for backward compatibility)
export default function PlatformHub() {
    return (
        <div className="space-y-4">
            <PlatformCards />
        </div>
    );
}

