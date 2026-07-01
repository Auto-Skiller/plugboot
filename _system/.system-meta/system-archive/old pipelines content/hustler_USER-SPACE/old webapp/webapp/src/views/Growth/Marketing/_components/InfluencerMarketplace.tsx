"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/core/ui/dialog";
import { Lock, Instagram, Eye, Star, TrendingUp, AlertCircle, CheckCircle, Shield, RotateCcw, Clock } from "lucide-react";
import { toast } from "sonner";

// Mock Influencer Data
const INFLUENCERS = [
    {
        id: "inf_1",
        tier: "Macro",
        niche: "Fashion & Lifestyle",
        followers: "250K - 500K",
        engagement: "4.2%",
        avg_likes: "15.2K",
        price: "120,000 DZD",
        verified: true,
        past_campaigns: 12,
        rating: 4.8,
        description: "High-end fashion content creator with strong audience in Algiers and Oran.",
        revealed: false,
    },
    {
        id: "inf_2",
        tier: "Micro",
        niche: "Tech & Gaming",
        followers: "50K - 100K",
        engagement: "8.5%",
        avg_likes: "6.8K",
        price: "45,000 DZD",
        verified: true,
        past_campaigns: 8,
        rating: 4.9,
        description: "Tech reviewer known for honest opinions and detailed unboxings.",
        revealed: false,
    },
    {
        id: "inf_3",
        tier: "Nano",
        niche: "Food & Cooking",
        followers: "10K - 50K",
        engagement: "12.1%",
        avg_likes: "3.2K",
        price: "15,000 DZD",
        verified: false,
        past_campaigns: 3,
        rating: 4.5,
        description: "Focuses on traditional Algerian recipes with a modern twist.",
        revealed: false,
    },
    {
        id: "inf_4",
        tier: "Macro",
        niche: "Beauty",
        followers: "300K+",
        engagement: "3.8%",
        avg_likes: "12K",
        price: "150,000 DZD",
        verified: true,
        past_campaigns: 20,
        rating: 4.7,
        description: "Professional makeup artist sharing tutorials and product reviews.",
        revealed: false,
    },
];

export function InfluencerMarketplace() {
    const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [revealedInfluencers, setRevealedInfluencers] = useState<string[]>([]);

    const handleRevealClick = (id: string) => {
        setSelectedInfluencer(id);
        setIsPaymentOpen(true);
    };

    const confirmPayment = () => {
        if (selectedInfluencer) {
            setRevealedInfluencers([...revealedInfluencers, selectedInfluencer]);
            setIsPaymentOpen(false);
            toast.success("Payment successful! Identity revealed.");
        }
    };

    const isRevealed = (id: string) => revealedInfluencers.includes(id);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Verified Influencer Marketplace
                </h2>
                <p className="text-sm text-muted-foreground">
                    Find high-performing creators for your brand. Identity matches are hidden until secured via escrow.
                    <br />
                    <span className="text-xs opacity-80 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        24-hour refund window if the match isn&apos;t right.
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {INFLUENCERS.map((influencer) => (
                    <Card key={influencer.id} className={`overflow-hidden transition-all hover:shadow-md border-muted-foreground/20`}>
                        <div className="h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 relative p-4 flex items-center justify-center">
                            {isRevealed(influencer.id) ? (
                                <div className="text-center animate-in fade-in duration-500">
                                    <div className="w-16 h-16 bg-white rounded-full mx-auto mb-2 flex items-center justify-center shadow-lg">
                                        <Instagram className="h-8 w-8 text-pink-600" />
                                    </div>
                                    <p className="font-bold text-sm bg-white/50 backdrop-blur-sm px-2 py-0.5 rounded-full inline-block">@real_handle_{influencer.id}</p>
                                </div>
                            ) : (
                                <div className="text-center blur-sm select-none opacity-50">
                                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2" />
                                    <p className="font-bold text-sm bg-gray-200 px-2 py-0.5 rounded-full inline-block">@hidden_handle</p>
                                </div>
                            )}

                            {!isRevealed(influencer.id) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                                    <div className="bg-background/90 p-2 rounded-full shadow-sm">
                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                            )}

                            <Badge className="absolute top-2 right-2 bg-background/80 hover:bg-background text-foreground backdrop-blur-md">
                                {influencer.tier}
                            </Badge>
                        </div>

                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{influencer.niche}</CardTitle>
                                    <CardDescription className="line-clamp-2 mt-1">{influencer.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pb-2 space-y-3">
                            {isRevealed(influencer.id) && (
                                <div className="p-2 rounded-lg bg-green-500/5 border border-green-500/20 flex items-center justify-between text-xs mb-2">
                                    <div className="flex items-center gap-1.5 text-green-600 font-medium">
                                        <Shield className="h-3 w-3" />
                                        <span>Escrow Secured</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>23h 59m left</span>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-muted/30 p-2 rounded-lg">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Followers</p>
                                    <p className="font-semibold">{influencer.followers}</p>
                                </div>
                                <div className="bg-muted/30 p-2 rounded-lg">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Engagement</p>
                                    <p className="font-semibold text-green-600">{influencer.engagement}</p>
                                </div>
                                <div className="bg-muted/30 p-2 rounded-lg">
                                    <p className="text-xs text-muted-foreground">Avg Likes</p>
                                    <p className="font-semibold">{influencer.avg_likes}</p>
                                </div>
                                <div className="bg-muted/30 p-2 rounded-lg">
                                    <p className="text-xs text-muted-foreground">Rating</p>
                                    <p className="font-semibold flex items-center gap-1">
                                        {influencer.rating} <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                    </p>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="pt-2 flex flex-col gap-2 border-t bg-muted/10">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">Est. Price</span>
                                    <span className="font-bold text-lg">{influencer.price}</span>
                                </div>
                                {isRevealed(influencer.id) ? (
                                    <Button variant="outline" className="gap-2 border-green-500 text-green-600 hover:bg-green-50">
                                        <CheckCircle className="h-4 w-4" /> Book
                                    </Button>
                                ) : (
                                    <Button onClick={() => handleRevealClick(influencer.id)} className="gap-2">
                                        <Eye className="h-4 w-4" /> Reveal
                                    </Button>
                                )}
                            </div>

                            {isRevealed(influencer.id) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-[10px] h-7 text-muted-foreground hover:text-red-600 hover:bg-red-50 gap-1.5"
                                    onClick={() => toast.info("Refund request submitted to escrow. Our team will review it within 24h.")}
                                >
                                    <RotateCcw className="h-3 w-3" /> Request 24h Refund
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unlock Influencer Identity</DialogTitle>
                        <DialogDescription>
                            You are about to unlock the details for this <strong>{INFLUENCERS.find(i => i.id === selectedInfluencer)?.tier}</strong> influencer in the <strong>{INFLUENCERS.find(i => i.id === selectedInfluencer)?.niche}</strong> niche.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span>Service Fee (Escrow)</span>
                            <span className="font-bold">500 DZD</span>
                        </div>
                        <p className="text-xs text-muted-foreground pt-2">
                            * This small fee prevents spam. It is deducted from the final campaign cost if you proceed.
                            <br />
                            * 100% refundable within 24 hours if the influencer is not a match.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
                        <Button onClick={confirmPayment}>Pay & Reveal</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
