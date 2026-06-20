"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/core/ui/tabs";
import { Megaphone, MessageCircle, Share2, TrendingUp, Users, Star, Wrench } from "lucide-react";

// Import existing components
import { AffiliationTab } from "./_components/tabs/AffiliationTab";
import PlatformHub from "./_components/PlatformHub";
import { AICommentResponder } from "./_components/AICommentResponder";
import TrendingProductAds from "@/views/Command/Sourcing/product-research/_components/TrendingProductAds";
import CompetitorTrackerEnhanced from "@/views/Command/Sourcing/product-research/_components/CompetitorTrackerEnhanced";

// Integrated components
import { CommentsGuard } from "./_components/CommentsGuard";
import { InfluencerMarketplace } from "./_components/InfluencerMarketplace";
import HashtagGenerator from "./_components/tools/HashtagGenerator";

export default function MarketingPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <Megaphone className="h-6 w-6 text-green-500" />
                    </div>
                    Marketing & Growth
                </h1>
                <p className="text-muted-foreground mt-1">
                    Affiliates, AI Bots, and Social Automation
                </p>
            </div>

            <Tabs defaultValue="affiliates" className="space-y-6">
                <TabsList className="grid w-full max-w-6xl grid-cols-7">
                    <TabsTrigger value="affiliates" className="gap-2">
                        <Users className="h-4 w-4" /> Affiliates
                    </TabsTrigger>
                    <TabsTrigger value="influencers" className="gap-2">
                        <Star className="h-4 w-4" /> Influencers
                    </TabsTrigger>
                    <TabsTrigger value="social-hub" className="gap-2">
                        <Share2 className="h-4 w-4" /> Platforms
                    </TabsTrigger>
                    <TabsTrigger value="ai-responders" className="gap-2">
                        <MessageCircle className="h-4 w-4" /> AI Bots
                    </TabsTrigger>
                    <TabsTrigger value="trends" className="gap-2">
                        <TrendingUp className="h-4 w-4" /> Trends
                    </TabsTrigger>
                    <TabsTrigger value="competitors" className="gap-2">
                        <Users className="h-4 w-4" /> Competitors
                    </TabsTrigger>
                    <TabsTrigger value="tools" className="gap-2">
                        <Wrench className="h-4 w-4" /> Tools
                    </TabsTrigger>
                </TabsList>

                {/* Affiliates */}
                <TabsContent value="affiliates">
                    <AffiliationTab />
                </TabsContent>

                {/* Influencers - NEW */}
                <TabsContent value="influencers">
                    <InfluencerMarketplace />
                </TabsContent>

                {/* Platform Hub */}
                <TabsContent value="social-hub">
                    <PlatformHub />
                </TabsContent>

                {/* AI Responders & Guard */}
                <TabsContent value="ai-responders" className="space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <AICommentResponder />
                        <CommentsGuard />
                    </div>
                </TabsContent>

                {/* Trending Ads DZ */}
                <TabsContent value="trends">
                    <TrendingProductAds />
                </TabsContent>

                {/* Competitor Tracker */}
                <TabsContent value="competitors">
                    <CompetitorTrackerEnhanced />
                </TabsContent>

                {/* Tools - NEW */}
                <TabsContent value="tools">
                    <div className="max-w-2xl">
                        <HashtagGenerator />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

