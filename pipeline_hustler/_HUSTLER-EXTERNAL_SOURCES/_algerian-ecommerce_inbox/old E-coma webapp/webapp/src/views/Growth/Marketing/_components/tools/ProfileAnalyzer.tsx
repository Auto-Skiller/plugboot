"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Badge } from "@/components/core/ui/badge";
import { Progress } from "@/components/core/ui/progress";
import {
    User, Search, TrendingUp, Users, Heart, MessageCircle,
    BarChart3, AlertTriangle, CheckCircle, Loader2, Instagram
} from "lucide-react";
import { toast } from "sonner";

export default function ProfileAnalyzer() {
    const [handle, setHandle] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [profileData, setProfileData] = useState<{
        handle: string;
        followers: string;
        engagement: number;
        authenticity: number;
        avgLikes: string;
        avgComments: string;
        postFrequency: string;
        bestTimes: string[];
        audienceGender: { male: number; female: number };
        topLocations: string[];
    } | null>(null);

    const analyzeProfile = () => {
        if (!handle.trim()) {
            toast.error("Please enter an Instagram handle");
            return;
        }

        setIsAnalyzing(true);

        // Simulate analysis
        setTimeout(() => {
            setProfileData({
                handle: handle.startsWith("@") ? handle : `@${handle}`,
                followers: "45.2K",
                engagement: 4.8,
                authenticity: 87,
                avgLikes: "2.1K",
                avgComments: "145",
                postFrequency: "5 posts/week",
                bestTimes: ["14:00", "20:00", "22:00"],
                audienceGender: { male: 35, female: 65 },
                topLocations: ["Alger (42%)", "Oran (18%)", "Constantine (12%)"],
            });
            setIsAnalyzing(false);
            toast.success("Profile analyzed successfully!");
        }, 2500);
    };

    const getAuthenticityColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    Profile Analyzer
                </CardTitle>
                <CardDescription>
                    Analyze Instagram influencer profiles for engagement and authenticity
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Search Input */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Enter Instagram handle (e.g., @fashion_dz)"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button onClick={analyzeProfile} disabled={isAnalyzing} className="gap-2">
                        {isAnalyzing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <><Search className="h-4 w-4" /> Analyze</>
                        )}
                    </Button>
                </div>

                {/* Analysis Results */}
                {profileData && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                                {profileData.handle.charAt(1).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-lg font-bold">{profileData.handle}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Users className="h-4 w-4" /> {profileData.followers} followers
                                </p>
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 rounded-lg border text-center">
                                <TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold">{profileData.engagement}%</p>
                                <p className="text-xs text-muted-foreground">Engagement Rate</p>
                            </div>
                            <div className="p-3 rounded-lg border text-center">
                                <Heart className="h-5 w-5 text-red-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold">{profileData.avgLikes}</p>
                                <p className="text-xs text-muted-foreground">Avg. Likes</p>
                            </div>
                            <div className="p-3 rounded-lg border text-center">
                                <MessageCircle className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold">{profileData.avgComments}</p>
                                <p className="text-xs text-muted-foreground">Avg. Comments</p>
                            </div>
                            <div className="p-3 rounded-lg border text-center">
                                <BarChart3 className="h-5 w-5 text-purple-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold">{profileData.postFrequency}</p>
                                <p className="text-xs text-muted-foreground">Post Frequency</p>
                            </div>
                        </div>

                        {/* Authenticity Score */}
                        <div className="p-4 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium flex items-center gap-2">
                                    {profileData.authenticity >= 80 ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    )}
                                    Authenticity Score
                                </span>
                                <span className={`text-xl font-bold ${getAuthenticityColor(profileData.authenticity)}`}>
                                    {profileData.authenticity}%
                                </span>
                            </div>
                            <Progress value={profileData.authenticity} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-2">
                                {profileData.authenticity >= 80
                                    ? "High quality audience with real engagement"
                                    : "Some suspicious activity detected - verify manually"}
                            </p>
                        </div>

                        {/* Best Posting Times & Audience */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border">
                                <p className="font-medium mb-3">Best Posting Times</p>
                                <div className="flex gap-2">
                                    {profileData.bestTimes.map((time, i) => (
                                        <Badge key={i} variant="secondary">{time}</Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 rounded-lg border">
                                <p className="font-medium mb-3">Top Locations</p>
                                <div className="space-y-1">
                                    {profileData.topLocations.map((loc, i) => (
                                        <p key={i} className="text-sm text-muted-foreground">{loc}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
