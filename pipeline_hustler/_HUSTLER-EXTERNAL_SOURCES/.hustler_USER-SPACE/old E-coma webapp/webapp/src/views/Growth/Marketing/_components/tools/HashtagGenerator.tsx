"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Badge } from "@/components/core/ui/badge";
import { Hash, Copy, CheckCircle, Sparkles, RefreshCw, Instagram, Facebook, Video } from "lucide-react";
import { toast } from "sonner";

// Mock trending hashtags for Algeria
const TRENDING_HASHTAGS = {
    general: ["#algeria", "#dz", "#algerie", "#alger", "#oran", "#constantine"],
    ecommerce: ["#shopping", "#promo", "#soldes", "#livraison", "#codalgerie", "#achatezvite"],
    fashion: ["#mode", "#style", "#tendance", "#hijab", "#abaya", "#fashion"],
    beauty: ["#beaute", "#skincare", "#makeup", "#soin", "#naturel"],
    tech: ["#tech", "#smartphone", "#gadget", "#accessoires", "#hightech"],
};

export default function HashtagGenerator() {
    const [productDescription, setProductDescription] = useState("");
    const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<"instagram" | "tiktok" | "facebook">("instagram");

    const generateHashtags = () => {
        if (!productDescription.trim()) {
            toast.error("Please enter a product description");
            return;
        }

        setIsGenerating(true);

        // Simulate AI generation
        setTimeout(() => {
            const baseHashtags = [...TRENDING_HASHTAGS.general, ...TRENDING_HASHTAGS.ecommerce];

            // Add category-specific hashtags based on keywords
            const description = productDescription.toLowerCase();
            if (description.includes("mode") || description.includes("vetement") || description.includes("robe")) {
                baseHashtags.push(...TRENDING_HASHTAGS.fashion);
            }
            if (description.includes("beaute") || description.includes("creme") || description.includes("maquillage")) {
                baseHashtags.push(...TRENDING_HASHTAGS.beauty);
            }
            if (description.includes("phone") || description.includes("tech") || description.includes("ecouteur")) {
                baseHashtags.push(...TRENDING_HASHTAGS.tech);
            }

            // Add custom hashtags from description
            const words = productDescription.split(" ").filter(w => w.length > 3);
            words.forEach(word => {
                baseHashtags.push(`#${word.toLowerCase().replace(/[^a-z0-9]/g, "")}`);
            });

            // Deduplicate and limit
            const unique = [...new Set(baseHashtags)].slice(0, selectedPlatform === "instagram" ? 30 : 5);
            setGeneratedHashtags(unique);
            setIsGenerating(false);
            toast.success(`Generated ${unique.length} hashtags for ${selectedPlatform}!`);
        }, 1500);
    };

    const copyAllHashtags = () => {
        const text = generatedHashtags.join(" ");
        navigator.clipboard.writeText(text);
        toast.success("All hashtags copied to clipboard!");
    };

    const platformConfig = {
        instagram: { icon: Instagram, color: "text-pink-500", max: 30 },
        tiktok: { icon: Video, color: "text-black dark:text-white", max: 5 },
        facebook: { icon: Facebook, color: "text-blue-500", max: 10 },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-pink-500" />
                    Hashtag Generator
                </CardTitle>
                <CardDescription>
                    Generate trending hashtags for your Algerian e-commerce products
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Platform Selection */}
                <div className="flex gap-2">
                    {(Object.keys(platformConfig) as Array<keyof typeof platformConfig>).map((platform) => {
                        const config = platformConfig[platform];
                        const Icon = config.icon;
                        return (
                            <Button
                                key={platform}
                                variant={selectedPlatform === platform ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedPlatform(platform)}
                                className="gap-2"
                            >
                                <Icon className={`h-4 w-4 ${selectedPlatform === platform ? "" : config.color}`} />
                                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </Button>
                        );
                    })}
                </div>

                {/* Input */}
                <div className="space-y-2">
                    <Input
                        placeholder="Describe your product (e.g., Écouteurs sans fil Bluetooth haute qualité)"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                    />
                    <Button onClick={generateHashtags} disabled={isGenerating} className="w-full gap-2">
                        {isGenerating ? (
                            <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</>
                        ) : (
                            <><Sparkles className="h-4 w-4" /> Generate Hashtags</>
                        )}
                    </Button>
                </div>

                {/* Generated Hashtags */}
                {generatedHashtags.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {generatedHashtags.length} hashtags (max {platformConfig[selectedPlatform].max} for {selectedPlatform})
                            </p>
                            <Button variant="outline" size="sm" onClick={copyAllHashtags} className="gap-2">
                                <Copy className="h-4 w-4" /> Copy All
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {generatedHashtags.map((tag, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                    onClick={() => {
                                        navigator.clipboard.writeText(tag);
                                        toast.success(`Copied: ${tag}`);
                                    }}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trending Section */}
                <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                        🔥 Trending in Algeria
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {TRENDING_HASHTAGS.general.slice(0, 6).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
