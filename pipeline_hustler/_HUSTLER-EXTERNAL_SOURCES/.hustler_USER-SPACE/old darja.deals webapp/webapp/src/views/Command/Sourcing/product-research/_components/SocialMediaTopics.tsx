"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/core/ui/tabs";
import { Flame, TrendingUp, MessageCircle, ThumbsUp, Bell, ExternalLink } from "lucide-react";
import TrackingModal from "./TrackingModal";
import { isItemTracked } from "@/lib/tracking";

import { SOCIAL_TOPICS } from "@/data/mock-research-data";
import type { SocialMediaTopic } from "@/data/mock-research-data";

// Dynamically generate niches from data
const NICHES = ["All", ...Array.from(new Set(SOCIAL_TOPICS.map(t => t.niche)))];

export default function SocialMediaTopics() {
    const [selectedNiche, setSelectedNiche] = useState("All");
    const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
    const [trackingModal, setTrackingModal] = useState<{ open: boolean; topic: SocialMediaTopic | null }>({
        open: false,
        topic: null
    });

    // Filter topics
    const filteredTopics = SOCIAL_TOPICS.filter(topic => {
        const nicheMatch = selectedNiche === "All" || topic.niche === selectedNiche;
        const platformMatch = selectedPlatform === "all" || topic.platforms.includes(selectedPlatform as any);
        return nicheMatch && platformMatch;
    });

    const handleTrack = (topic: SocialMediaTopic) => {
        setTrackingModal({ open: true, topic });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-purple-500" />
                    Social Media Topics by NICHE
                </h3>
                <p className="text-sm text-muted-foreground">
                    Trending product topics and reviews from Facebook, Instagram, and TikTok
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <Select value={selectedNiche} onValueChange={setSelectedNiche}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Niche" />
                    </SelectTrigger>
                    <SelectContent>
                        {NICHES.map(niche => (
                            <SelectItem key={niche} value={niche}>{niche}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform} className="w-auto">
                    <TabsList>
                        <TabsTrigger value="all">All Platforms</TabsTrigger>
                        <TabsTrigger value="facebook">Facebook</TabsTrigger>
                        <TabsTrigger value="instagram">Instagram</TabsTrigger>
                        <TabsTrigger value="tiktok">TikTok</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTopics.map((topic) => (
                    <Card key={topic.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-muted/60">
                        <CardContent className="p-5 space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-lg flex items-center gap-2 group-hover:text-primary transition-colors">
                                        {topic.title}
                                        {topic.trendingDays <= 7 && (
                                            <Badge variant="secondary" className="bg-orange-100 text-orange-600 hover:bg-orange-200 border-none gap-1 px-1.5 py-0 h-5">
                                                <Flame className="h-3 w-3" />
                                                Hot
                                            </Badge>
                                        )}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Badge variant="outline" className="font-normal">{topic.niche}</Badge>
                                        <span>•</span>
                                        <span>{topic.lastUpdated}</span>
                                    </div>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`h-8 w-8 transition-colors ${isItemTracked(topic.id, 'topic') ? "text-purple-600 bg-purple-50" : "text-muted-foreground hover:text-purple-600"}`}
                                    onClick={() => handleTrack(topic)}
                                >
                                    <Bell className={`h-4 w-4 ${isItemTracked(topic.id, 'topic') ? "fill-current" : ""}`} />
                                </Button>
                            </div>

                            {/* Engagement Grid */}
                            <div className="grid grid-cols-3 gap-2 p-3 bg-muted/30 rounded-lg">
                                <div className="text-center">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Mentions</p>
                                    <p className="font-bold text-sm">{topic.mentions.toLocaleString()}</p>
                                </div>
                                <div className="text-center border-l border-border/50">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Reach</p>
                                    <p className="font-bold text-sm">{topic.totalReach}</p>
                                </div>
                                <div className="text-center border-l border-border/50">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Eng. Rate</p>
                                    <p className="font-bold text-sm text-green-600">{topic.engagementRate}</p>
                                </div>
                            </div>

                            {/* Sentiment Analysis */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-medium text-muted-foreground">Sentiment Analysis</span>
                                    <span className="text-green-600 font-bold">{topic.sentiment.positive}% Positive</span>
                                </div>
                                <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-muted relative">
                                    {/* Gradient Bar */}
                                    <div
                                        className="h-full absolute left-0 top-0 transition-all duration-500 ease-out"
                                        style={{
                                            width: '100%',
                                            background: `linear-gradient(to right, 
                                                #22c55e 0%, 
                                                #22c55e ${topic.sentiment.positive}%, 
                                                #9ca3af ${topic.sentiment.positive}% ${topic.sentiment.positive + topic.sentiment.neutral}%, 
                                                #ef4444 ${topic.sentiment.positive + topic.sentiment.neutral}% 100%)`
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Top Opinion */}
                            {topic.topOpinions.length > 0 && (
                                <div className="relative pl-3 border-l-2 border-purple-200 py-1">
                                    <p className="text-xs italic text-muted-foreground line-clamp-2">
                                        &quot;{topic.topOpinions[0].text}&quot;
                                    </p>
                                    <div className="flex items-center gap-1 mt-1.5 opacity-70">
                                        <Badge variant="secondary" className="h-4 px-1 text-[10px] hover:bg-secondary">
                                            {topic.topOpinions[0].platform}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground">
                                            • {topic.topOpinions[0].author}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div className="pt-2 flex items-center justify-between gap-3">
                                <div className="flex -space-x-1.5 overflow-hidden">
                                    {topic.platforms.includes('tiktok') && <div className="bg-black text-white p-1 rounded-full w-5 h-5 flex items-center justify-center border border-background shadow-sm text-[8px] z-30">TT</div>}
                                    {topic.platforms.includes('instagram') && <div className="bg-pink-600 text-white p-1 rounded-full w-5 h-5 flex items-center justify-center border border-background shadow-sm text-[8px] z-20">IG</div>}
                                    {topic.platforms.includes('facebook') && <div className="bg-blue-600 text-white p-1 rounded-full w-5 h-5 flex items-center justify-center border border-background shadow-sm text-[8px] z-10">FB</div>}
                                </div>
                                <Button size="sm" variant="ghost" className="h-8 text-xs font-medium hover:bg-purple-50 hover:text-purple-700">
                                    <ExternalLink className="h-3 w-3 mr-1.5" />
                                    Analyze Details
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tracking Modal */}
            {trackingModal.topic && (
                <TrackingModal
                    isOpen={trackingModal.open}
                    onClose={() => setTrackingModal({ open: false, topic: null })}
                    item={{
                        id: trackingModal.topic.id,
                        type: 'topic',
                        title: trackingModal.topic.title
                    }}
                    onSave={() => {
                        setTrackingModal({ open: false, topic: null });
                    }}
                />
            )}
        </div>
    );
}
