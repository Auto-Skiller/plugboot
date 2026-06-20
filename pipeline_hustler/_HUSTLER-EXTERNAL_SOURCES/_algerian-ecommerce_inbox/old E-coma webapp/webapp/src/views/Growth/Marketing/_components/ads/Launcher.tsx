"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Input } from "@/components/core/ui/input";
import {
    Rocket, Target, DollarSign, Calendar, CheckCircle,
    Facebook, Instagram, ArrowRight, Sparkles
} from "lucide-react";
import { toast } from "sonner";

export default function Launcher() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        platform: "facebook",
        objective: "conversions",
        budget: "10000",
        duration: "7",
    });

    const handleLaunch = () => {
        toast.success("Ad campaign launched successfully! (Mock)");
        setStep(3);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-orange-500" />
                    Quick Ad Launcher
                </CardTitle>
                <CardDescription>
                    Launch a new ad campaign in under 2 minutes
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {step < 3 && (
                    <>
                        {/* Platform Selection */}
                        <div>
                            <p className="text-sm font-medium mb-3">1. Select Platform</p>
                            <div className="flex gap-2">
                                {[
                                    { id: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-500" },
                                    { id: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-500" },
                                ].map((p) => (
                                    <Button
                                        key={p.id}
                                        variant={formData.platform === p.id ? "default" : "outline"}
                                        onClick={() => setFormData({ ...formData, platform: p.id })}
                                        className="gap-2 flex-1"
                                    >
                                        <p.icon className={`h-4 w-4 ${formData.platform === p.id ? "" : p.color}`} />
                                        {p.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Objective */}
                        <div>
                            <p className="text-sm font-medium mb-3">2. Campaign Objective</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: "conversions", label: "Conversions", desc: "Get sales" },
                                    { id: "traffic", label: "Traffic", desc: "Website visits" },
                                    { id: "awareness", label: "Awareness", desc: "Brand reach" },
                                ].map((obj) => (
                                    <div
                                        key={obj.id}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${formData.objective === obj.id
                                                ? "border-primary bg-primary/5"
                                                : "hover:border-primary/50"
                                            }`}
                                        onClick={() => setFormData({ ...formData, objective: obj.id })}
                                    >
                                        <p className="font-medium text-sm">{obj.label}</p>
                                        <p className="text-xs text-muted-foreground">{obj.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Budget & Duration */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" /> Daily Budget (DA)
                                </p>
                                <Input
                                    type="number"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                    placeholder="10000"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Duration (days)
                                </p>
                                <Input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="7"
                                />
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="p-4 rounded-lg bg-muted/50 border">
                            <p className="text-sm font-medium mb-2">Campaign Summary</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>Platform: <span className="font-medium capitalize">{formData.platform}</span></div>
                                <div>Objective: <span className="font-medium capitalize">{formData.objective}</span></div>
                                <div>Budget: <span className="font-medium">{Number(formData.budget).toLocaleString()} DA/day</span></div>
                                <div>Duration: <span className="font-medium">{formData.duration} days</span></div>
                                <div className="col-span-2 pt-2 border-t mt-2">
                                    Total Spend: <span className="font-bold text-primary">
                                        {(Number(formData.budget) * Number(formData.duration)).toLocaleString()} DA
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Launch Button */}
                        <Button onClick={handleLaunch} className="w-full gap-2" size="lg">
                            <Rocket className="h-5 w-5" /> Launch Campaign
                        </Button>
                    </>
                )}

                {step === 3 && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Campaign Launched! 🚀</h3>
                        <p className="text-muted-foreground mb-6">
                            Your {formData.platform} campaign is now live and targeting {formData.objective}.
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={() => setStep(1)}>
                                Launch Another
                            </Button>
                            <Button className="gap-2">
                                View Campaign <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
