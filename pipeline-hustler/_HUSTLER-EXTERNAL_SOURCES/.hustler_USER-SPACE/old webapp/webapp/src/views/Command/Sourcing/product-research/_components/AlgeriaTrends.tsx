"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/core/ui/tabs";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/core/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import {
    TrendingUp, TrendingDown, Minus, Hash, ShoppingBag, Video,
    Facebook, Instagram, RefreshCw, Plus, ExternalLink, Flame,
    BarChart3, Clock, Eye, Sparkles, Music2, Play
} from "lucide-react";
import { ALGERIA_TRENDS, type TrendingHashtag, type TrendingProduct, type ContentFormat, type TrendingSound } from "@/data/mock-research-data";

// TikTok icon
function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
    );
}

function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
    if (platform === "instagram") return <Instagram className={className} />;
    if (platform === "facebook") return <Facebook className={className} />;
    if (platform === "tiktok") return <TikTokIcon className={className} />;
    return null;
}

function PlatformBadge({ platform }: { platform: string }) {
    const colors: Record<string, string> = {
        facebook: "bg-blue-600 text-white",
        instagram: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
        tiktok: "bg-black text-white"
    };
    return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${colors[platform] || 'bg-muted'}`}>
            <PlatformIcon platform={platform} className="h-2.5 w-2.5" />
            {platform.toUpperCase()}
        </span>
    );
}

function VelocityBadge({ velocity }: { velocity: string }) {
    if (velocity === "rising") return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
            <TrendingUp className="h-3 w-3" /> Rising
        </Badge>
    );
    if (velocity === "declining") return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 gap-1">
            <TrendingDown className="h-3 w-3" /> Declining
        </Badge>
    );
    return (
        <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 gap-1">
            <Minus className="h-3 w-3" /> Stable
        </Badge>
    );
}

export default function AlgeriaTrends() {
    const [activeTab, setActiveTab] = useState("hashtags");
    const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);

    const lastUpdated = new Date(ALGERIA_TRENDS.lastUpdated).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
    const nextRefresh = new Date(ALGERIA_TRENDS.nextRefresh).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
    });

    // Filter by platform
    const filteredHashtags = selectedPlatform === "all"
        ? ALGERIA_TRENDS.hashtags
        : ALGERIA_TRENDS.hashtags.filter(h => h.platform === selectedPlatform);

    const filteredProducts = selectedPlatform === "all"
        ? ALGERIA_TRENDS.products
        : ALGERIA_TRENDS.products.filter(p => p.platforms.includes(selectedPlatform as any));

    const filteredFormats = selectedPlatform === "all"
        ? ALGERIA_TRENDS.formats
        : ALGERIA_TRENDS.formats.filter(f => f.platform === selectedPlatform);

    const filteredSounds = selectedPlatform === "all"
        ? ALGERIA_TRENDS.sounds
        : ALGERIA_TRENDS.sounds.filter(s => s.platform === selectedPlatform);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        Algeria Trends
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Trending hashtags, products, and content formats in the Algerian market
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        Updated: {lastUpdated}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-xs">
                        <RefreshCw className="h-3 w-3" />
                        Next: {nextRefresh}
                    </Badge>
                    <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1">
                                <Plus className="h-3 w-3" />
                                Submit Trend
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Submit a Trend</DialogTitle>
                                <DialogDescription>
                                    Spotted a trending hashtag or product? Share it with the community.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Type</Label>
                                    <Select defaultValue="hashtag">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hashtag">Hashtag</SelectItem>
                                            <SelectItem value="product">Product</SelectItem>
                                            <SelectItem value="format">Content Format</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Name / Hashtag</Label>
                                    <Input placeholder="e.g., #algeriashopping or Wireless Charger" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Platform</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select platform" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="facebook">Facebook</SelectItem>
                                            <SelectItem value="instagram">Instagram</SelectItem>
                                            <SelectItem value="tiktok">TikTok</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Notes (optional)</Label>
                                    <Input placeholder="Why do you think this is trending?" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
                                <Button onClick={() => setShowSubmitDialog(false)}>Submit</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Platform Filter */}
            <div className="flex gap-2">
                {["all", "facebook", "instagram", "tiktok"].map(platform => (
                    <Button
                        key={platform}
                        size="sm"
                        variant={selectedPlatform === platform ? "default" : "outline"}
                        onClick={() => setSelectedPlatform(platform)}
                        className="gap-1"
                    >
                        {platform !== "all" && <PlatformIcon platform={platform} className="h-3 w-3" />}
                        {platform === "all" ? "All Platforms" : platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Button>
                ))}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="hashtags" className="gap-1">
                        <Hash className="h-3 w-3" />
                        Hashtags
                    </TabsTrigger>
                    <TabsTrigger value="products" className="gap-1">
                        <ShoppingBag className="h-3 w-3" />
                        Products
                    </TabsTrigger>
                    <TabsTrigger value="formats" className="gap-1">
                        <Video className="h-3 w-3" />
                        Formats
                    </TabsTrigger>
                    <TabsTrigger value="sounds" className="gap-1">
                        <Music2 className="h-3 w-3" />
                        Sounds
                    </TabsTrigger>
                </TabsList>

                {/* Hashtags Tab */}
                <TabsContent value="hashtags" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {filteredHashtags.map(hashtag => (
                            <Card key={hashtag.id} className="hover:shadow-md transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Hash className="h-4 w-4 text-purple-500" />
                                            <span className="font-bold text-sm">{hashtag.tag}</span>
                                        </div>
                                        <PlatformBadge platform={hashtag.platform} />
                                    </div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-muted-foreground text-xs">{hashtag.posts} posts</span>
                                        <VelocityBadge velocity={hashtag.velocity} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Weekly growth</span>
                                        <span className={`font-bold text-sm ${hashtag.weeklyGrowth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                            {hashtag.weeklyGrowth}
                                        </span>
                                    </div>
                                    {hashtag.relatedProducts && hashtag.relatedProducts.length > 0 && (
                                        <div className="mt-2 pt-2 border-t">
                                            <p className="text-[10px] text-muted-foreground mb-1">Related products:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {hashtag.relatedProducts.map(p => (
                                                    <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredProducts.map(product => (
                            <Card key={product.id} className="hover:shadow-md transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-bold flex items-center gap-2">
                                                {product.name}
                                                {product.demandScore >= 85 && (
                                                    <Flame className="h-4 w-4 text-orange-500" />
                                                )}
                                            </h4>
                                            <p className="text-xs text-muted-foreground">{product.category}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {product.platforms.map(p => (
                                                <PlatformBadge key={p} platform={p} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="p-2 bg-muted/50 rounded">
                                            <BarChart3 className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                                            <p className="text-lg font-bold">{product.adFrequency}</p>
                                            <p className="text-[10px] text-muted-foreground">Ads/Week</p>
                                        </div>
                                        <div className="p-2 bg-muted/50 rounded">
                                            <TrendingUp className="h-4 w-4 mx-auto text-green-500 mb-1" />
                                            <p className="text-lg font-bold text-green-500">{product.demandScore}</p>
                                            <p className="text-[10px] text-muted-foreground">Demand Score</p>
                                        </div>
                                        <div className="p-2 bg-muted/50 rounded">
                                            <ShoppingBag className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                                            <p className="text-sm font-bold">{product.priceRange}</p>
                                            <p className="text-[10px] text-muted-foreground">Price Range</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full mt-3 gap-1">
                                        <Eye className="h-3 w-3" />
                                        View Similar Products
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Content Formats Tab */}
                <TabsContent value="formats" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filteredFormats.map(format => (
                            <Card key={format.id} className={`hover:shadow-md transition-all ${format.isHot ? 'ring-2 ring-orange-400' : ''}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Video className="h-4 w-4 text-blue-500" />
                                            <span className="font-bold text-sm">{format.name}</span>
                                        </div>
                                        {format.isHot && (
                                            <Badge className="bg-orange-100 text-orange-600 gap-1 text-xs">
                                                <Flame className="h-3 w-3" /> Hot
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-3">{format.description}</p>
                                    <div className="flex items-center justify-between mb-3">
                                        <PlatformBadge platform={format.platform} />
                                        <span className="text-green-500 font-bold text-sm">{format.engagementRate} eng.</span>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <p className="text-[10px] text-muted-foreground mb-1">Examples:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {format.examples.map(ex => (
                                                <Badge key={ex} variant="outline" className="text-[10px]">{ex}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Sounds Tab */}
                <TabsContent value="sounds" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {filteredSounds.map(sound => (
                            <Card key={sound.id} className={`hover:shadow-md transition-all ${sound.isHot ? 'ring-2 ring-orange-400' : ''}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                                                <Music2 className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-sm block">{sound.name}</span>
                                                {sound.artist && <span className="text-xs text-muted-foreground">{sound.artist}</span>}
                                            </div>
                                        </div>
                                        {sound.isHot && (
                                            <Badge className="bg-orange-100 text-orange-600 gap-1 text-xs">
                                                <Flame className="h-3 w-3" /> Hot
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <PlatformBadge platform={sound.platform} />
                                        <Badge variant="outline" className="text-xs">{sound.category}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-muted-foreground text-xs">{sound.uses} uses</span>
                                        <VelocityBadge velocity={sound.velocity} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Weekly growth</span>
                                        <span className={`font-bold text-sm ${sound.weeklyGrowth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                            {sound.weeklyGrowth}
                                        </span>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full mt-3 gap-1">
                                        <Play className="h-3 w-3" />
                                        Preview Sound
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
