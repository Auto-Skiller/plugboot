"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import {
    Instagram, Facebook, Youtube, Music2, ArrowRight,
    CheckCircle2, Circle, Sparkles, TrendingUp, DollarSign,
    Users, Zap, Target, Camera, Video, Hash, Clock
} from "lucide-react";

// Platform configurations
const PLATFORMS = [
    { id: "tiktok", name: "TikTok", icon: Music2, color: "bg-black", accent: "text-cyan-400" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400", accent: "text-pink-400" },
    { id: "facebook", name: "Facebook", icon: Facebook, color: "bg-blue-600", accent: "text-blue-400" },
    { id: "youtube", name: "YouTube", icon: Youtube, color: "bg-red-600", accent: "text-red-400" },
];

// Guide steps for each platform
const PLATFORM_GUIDES: Record<string, { title: string; steps: { title: string; content: string; icon: typeof Circle }[] }> = {
    tiktok: {
        title: "TikTok Monetization from Algeria",
        steps: [
            { title: "Remove SIM Card", content: "Never use an Algerian SIM in your TikTok phone. TikTok detects region via Mobile Country Code (MCC).", icon: Circle },
            { title: "Use VPN", content: "Connect to a high-quality VPN targeting France, UK, or US before opening TikTok.", icon: Circle },
            { title: "Clean Account", content: "Factory reset or use a new profile. Sign up with email (not phone number).", icon: Circle },
            { title: "Verify Access", content: "Check 'Creator Tools' for 'Creator Fund' or 'Creativity Program Beta' to confirm success.", icon: CheckCircle2 },
        ]
    },
    instagram: {
        title: "Instagram Growth Strategy",
        steps: [
            { title: "Optimize Profile", content: "Use a clear profile photo, compelling bio with keywords, and link to your store/landing page.", icon: Circle },
            { title: "Content Mix", content: "Post: 40% Reels (highest reach), 30% Carousels (highest saves), 20% Stories, 10% single images.", icon: Circle },
            { title: "Engagement Times", content: "Best times for Algeria: 12-2 PM (lunch), 7-9 PM (evening). Post consistently 4-7x per week.", icon: Clock },
            { title: "Hashtag Strategy", content: "Mix: 3 large (1M+), 5 medium (100K-1M), 7 niche (<100K). Use location hashtags.", icon: Hash },
            { title: "Boost with Reels", content: "Hook in first 0.5 seconds, trend audio, 15-30 sec length, add captions for 80% more watch time.", icon: CheckCircle2 },
        ]
    },
    facebook: {
        title: "Facebook Ads Setup Guide",
        steps: [
            { title: "Business Manager", content: "Create a Business Manager account at business.facebook.com. Add your Facebook Page and Ad Account.", icon: Circle },
            { title: "Install Pixel", content: "Add Meta Pixel to your website/store. This tracks visitors and enables retargeting + lookalike audiences.", icon: Circle },
            { title: "Audience Strategy", content: "Start with: Interest targeting (broad), then use pixel data for Custom Audiences (website visitors) and Lookalikes.", icon: Target },
            { title: "Ad Structure", content: "Campaign = Objective. Ad Set = Audience + Budget. Ad = Creative. Test 3-5 creatives per ad set.", icon: Circle },
            { title: "COD Optimization", content: "For Algeria COD: Optimize for 'Lead' not 'Purchase'. Use Instant Forms for quick checkout. Follow up within 1h.", icon: CheckCircle2 },
        ]
    },
    youtube: {
        title: "YouTube Shorts Strategy",
        steps: [
            { title: "Shorts Format", content: "Vertical 9:16, under 60 seconds. Hook viewers in first 1 second with text overlay or shocking visual.", icon: Video },
            { title: "Thumbnail & Title", content: "Even for Shorts, title matters for search. Use 3-5 keywords. Keep titles under 40 characters.", icon: Circle },
            { title: "Cross-Post", content: "Repurpose TikTok/Reels to Shorts. Remove watermarks first. Adjust for YouTube's audience (slightly longer attention span).", icon: Circle },
            { title: "Consistency", content: "Post 1-3 Shorts daily for growth. Best times: 2-4 PM local time. Use end screens to link to long-form.", icon: Clock },
            { title: "Monetization", content: "Shorts Fund: 1000 subs + 10M Shorts views in 90 days. Partner Program: 1000 subs + 4000 watch hours.", icon: CheckCircle2 },
        ]
    },
};

export default function PlatformGuides() {
    const [activePlatform, setActivePlatform] = useState("tiktok");
    const [currentStep, setCurrentStep] = useState(0);

    const guide = PLATFORM_GUIDES[activePlatform];
    const platform = PLATFORMS.find(p => p.id === activePlatform)!;

    const handlePlatformChange = (platformId: string) => {
        setActivePlatform(platformId);
        setCurrentStep(0);
    };

    return (
        <Card className="h-full border-none shadow-md overflow-hidden flex flex-col">
            {/* Platform Tabs */}
            <div className="flex border-b border-border/50 bg-muted/30">
                {PLATFORMS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => handlePlatformChange(p.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${activePlatform === p.id
                            ? 'bg-background border-b-2 border-primary text-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                            }`}
                    >
                        <p.icon className={`h-4 w-4 ${activePlatform === p.id ? p.accent : ''}`} />
                        <span className="hidden sm:inline">{p.name}</span>
                    </button>
                ))}
            </div>

            {/* Header */}
            <CardHeader className={`${platform.color} text-white pb-4 flex-shrink-0`}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <platform.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-lg text-white">{guide.title}</CardTitle>
                        <CardDescription className="text-white/70">
                            Step {currentStep + 1} of {guide.steps.length}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="p-0 flex-grow flex flex-col">
                <div className="p-6 flex-grow flex flex-col justify-between min-h-[180px]">
                    <div>
                        {(() => {
                            const currentStepData = guide.steps[currentStep];
                            const IconComponent = currentStepData.icon;
                            return (
                                <>
                                    <div className="flex items-center gap-2 mb-3">
                                        <IconComponent className={`h-5 w-5 ${platform.accent}`} />
                                        <h3 className="font-bold text-lg">{currentStepData.title}</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {currentStepData.content}
                                    </p>
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Navigation */}
                <div className="p-4 bg-muted/30 border-t border-border/50 flex justify-between items-center">
                    <div className="flex gap-1">
                        {guide.steps.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentStep(i)}
                                className={`h-1.5 w-6 rounded-full transition-all ${i === currentStep ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentStep === 0}
                            onClick={() => setCurrentStep(prev => prev - 1)}
                        >
                            Back
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setCurrentStep(prev => Math.min(prev + 1, guide.steps.length - 1))}
                            disabled={currentStep === guide.steps.length - 1}
                        >
                            Next <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
