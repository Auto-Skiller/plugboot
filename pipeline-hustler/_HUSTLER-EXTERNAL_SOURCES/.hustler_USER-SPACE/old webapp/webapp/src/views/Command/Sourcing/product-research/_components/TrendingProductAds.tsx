"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import {
    TrendingUp, Target, Play, Bookmark, Copy, Bell, Filter,
    Instagram, Facebook
} from "lucide-react";
import TrackingModal from "./TrackingModal";
import { isItemTracked } from "@/lib/tracking";
import { TRENDING_ADS as TRENDING_PRODUCT_ADS } from "@/data/mock-research-data";
import type { TrendingProductAd } from "@/data/mock-research-data";

// TikTok icon
function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
    );
}

// Platform Icon Component
function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
    if (platform === "instagram") return <Instagram className={className} />;
    if (platform === "facebook") return <Facebook className={className} />;
    if (platform === "tiktok") return <TikTokIcon className={className} />;
    return null;
}



export default function TrendingProductAds() {
    const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"grid" | "trending" | "performance">("grid");
    const [sortBy, setSortBy] = useState<"engagement" | "roas" | "recent">("engagement");
    const [trackingModal, setTrackingModal] = useState<{ open: boolean; ad: TrendingProductAd | null }>({
        open: false,
        ad: null
    });

    // Filter ads
    const filteredAds = TRENDING_PRODUCT_ADS.filter(ad =>
        selectedPlatform === "all" || ad.platform === selectedPlatform
    );

    // Sort ads
    const sortedAds = [...filteredAds].sort((a, b) => {
        if (sortBy === "engagement") {
            const aEng = parseFloat(a.engagement || "0");
            const bEng = parseFloat(b.engagement || "0");
            return bEng - aEng;
        } else if (sortBy === "roas") {
            const aRoas = parseFloat(a.roas?.replace("x", "") || "0");
            const bRoas = parseFloat(b.roas?.replace("x", "") || "0");
            return bRoas - aRoas;
        } else {
            return (a.days || 0) - (b.days || 0);
        }
    });

    const handleTrack = (ad: TrendingProductAd) => {
        setTrackingModal({ open: true, ad });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-pink-500" />
                    Trending Products Ads
                </h3>
                <p className="text-sm text-muted-foreground">
                    Viral ads with proven conversion performance across platforms
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="View Mode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="grid">Grid View</SelectItem>
                        <SelectItem value="trending">Trending Focus</SelectItem>
                        <SelectItem value="performance">Performance Focus</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="roas">ROAS</SelectItem>
                        <SelectItem value="recent">Most Recent</SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="outline" size="sm" className="ml-auto">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                </Button>
            </div>

            {/* Ads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedAds.map((ad) => (
                    <Card key={ad.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-3">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <PlatformIcon platform={ad.platform} className="h-4 w-4" />
                                    <div>
                                        <h4 className="font-semibold text-sm">{ad.title}</h4>
                                        <p className="text-xs text-muted-foreground">{ad.brand}</p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="text-xs">{ad.days}d ago</Badge>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                {/* Always show engagement metrics */}
                                {viewMode !== "performance" && (
                                    <>
                                        <div>
                                            <p className="text-muted-foreground">Views</p>
                                            <p className="font-bold">{ad.views}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Engagement</p>
                                            <p className="font-bold text-green-500">{ad.engagement}</p>
                                        </div>
                                    </>
                                )}

                                {/* Show conversion metrics if available */}
                                {viewMode !== "trending" && ad.ctr && (
                                    <>
                                        <div>
                                            <p className="text-muted-foreground">CTR</p>
                                            <p className="font-bold">{ad.ctr}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Conversion</p>
                                            <p className="font-bold text-green-500">{ad.conversion}</p>
                                        </div>
                                    </>
                                )}

                                {/* ROAS always visible if available */}
                                {ad.roas && viewMode !== "trending" && (
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground">ROAS</p>
                                        <p className="font-bold text-blue-500">{ad.roas}</p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="flex-1 text-xs h-8">
                                    <Play className="h-3 w-3 mr-1" /> Preview
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 px-2">
                                    <Bookmark className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 px-2">
                                    <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant={isItemTracked(ad.id, 'ad') ? "default" : "outline"}
                                    onClick={() => handleTrack(ad)}
                                    className="h-8 px-2"
                                >
                                    <Bell className="h-3 w-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Load More */}
            <div className="text-center">
                <Button variant="outline">Load More Ads</Button>
            </div>

            {/* Tracking Modal */}
            {trackingModal.ad && (
                <TrackingModal
                    isOpen={trackingModal.open}
                    onClose={() => setTrackingModal({ open: false, ad: null })}
                    item={{
                        id: trackingModal.ad.id,
                        type: 'ad',
                        title: trackingModal.ad.title
                    }}
                    onSave={() => {
                        // Refresh to show tracking status
                        setTrackingModal({ open: false, ad: null });
                    }}
                />
            )}
        </div>
    );
}
