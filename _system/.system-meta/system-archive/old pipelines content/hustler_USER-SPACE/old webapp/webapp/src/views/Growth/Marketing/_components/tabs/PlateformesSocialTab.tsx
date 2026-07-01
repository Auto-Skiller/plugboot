"use client";

import { Card, CardContent } from "@/components/core/ui/card";
import {
    MessageSquare,
    Heart,
    Share2,
    TrendingUp,
    Bot,
    Shield
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import { AICommentResponder } from "../AICommentResponder";
import { CommentsGuard } from "../CommentsGuard";
import PlatformHub from "../PlatformHub";
import { FeatureCluster } from "@/components/core/ui/FeatureCluster";

// Engagement stats
const engagementStats = {
    totalEngagement: "2.4K",
    engagementChange: "+340 aujourd'hui",
    likes: 1850,
    comments: 320,
    shares: 230
};

// Popular topics
const popularTopics = [
    { id: 1, topic: "Prix Collection Été", sentiment: "mixed", mentions: 145, trend: "+12%", keywords: ["cher", "qualité", "livraison"] },
    { id: 2, topic: "Vitesse Livraison", sentiment: "positive", mentions: 89, trend: "+5%", keywords: ["rapide", "à temps", "livreur"] },
    { id: 3, topic: "Demande Couleurs", sentiment: "neutral", mentions: 67, trend: "+24%", keywords: ["bleu", "rouge", "mat"] },
    { id: 4, topic: "Guide Tailles", sentiment: "negative", mentions: 45, trend: "-2%", keywords: ["taille", "tableur", "petit"] },
];

export function PlateformesSocialTab() {
    return (
        <div className="space-y-6">
            {/* Audience Buzz */}
            <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="flex items-center gap-2 text-base font-semibold">
                            <MessageSquare className="h-4 w-4 text-indigo-500" />
                            Buzz Audience
                        </h3>
                        <Badge variant="outline" className="text-green-600 bg-green-50">
                            {engagementStats.engagementChange}
                        </Badge>
                    </div>

                    {/* Engagement Stats */}
                    <div className="mb-6 p-4 rounded-lg bg-white/50 dark:bg-white/5 border">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Engagement Total</p>
                                <p className="text-2xl font-bold text-indigo-600">{engagementStats.totalEngagement}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 rounded bg-background/50">
                                <Heart className="h-3 w-3 mx-auto mb-1 text-orange-500" />
                                <span className="block text-sm font-bold">{engagementStats.likes.toLocaleString()}</span>
                                <span className="text-[10px] text-muted-foreground">likes</span>
                            </div>
                            <div className="text-center p-2 rounded bg-background/50">
                                <MessageSquare className="h-3 w-3 mx-auto mb-1 text-blue-500" />
                                <span className="block text-sm font-bold">{engagementStats.comments.toLocaleString()}</span>
                                <span className="text-[10px] text-muted-foreground">commentaires</span>
                            </div>
                            <div className="text-center p-2 rounded bg-background/50">
                                <Share2 className="h-3 w-3 mx-auto mb-1 text-green-500" />
                                <span className="block text-sm font-bold">{engagementStats.shares.toLocaleString()}</span>
                                <span className="text-[10px] text-muted-foreground">partages</span>
                            </div>
                        </div>
                    </div>

                    {/* Topics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {popularTopics.map((topic) => (
                            <div key={topic.id} className="p-3 rounded-lg bg-white/60 dark:bg-white/5 border">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-sm">{topic.topic}</h4>
                                    <Badge variant="secondary" className={`text-[10px] ${topic.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                            topic.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {topic.sentiment === 'positive' ? 'Positif' : topic.sentiment === 'negative' ? 'Négatif' : 'Mixte'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {topic.mentions}</span>
                                    <span className="flex items-center gap-1 text-green-600"><TrendingUp className="h-3 w-3" /> {topic.trend}</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {topic.keywords.map((kw) => (
                                        <span key={kw} className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600">
                                            #{kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Bots & Automation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FeatureCluster
                    title="AI Répondeur"
                    icon={<Bot className="h-5 w-5" />}
                    storageKey="marketing-ai-responder"
                    defaultExpanded={true}
                    headerClassName="bg-[hsl(var(--accent-blue))]"
                >
                    <AICommentResponder />
                </FeatureCluster>

                <FeatureCluster
                    title="Garde Commentaires"
                    icon={<Shield className="h-5 w-5" />}
                    storageKey="marketing-comments-guard"
                    defaultExpanded={true}
                    headerClassName="bg-[hsl(var(--accent-orange))]"
                >
                    <CommentsGuard />
                </FeatureCluster>
            </div>

            {/* Platform Hub */}
            <FeatureCluster
                title="Hub Plateformes"
                icon={<Share2 className="h-5 w-5" />}
                storageKey="marketing-platform-hub"
                defaultExpanded={true}
                headerClassName="bg-[hsl(var(--accent-purple))]"
            >
                <PlatformHub />
            </FeatureCluster>
        </div>
    );
}
