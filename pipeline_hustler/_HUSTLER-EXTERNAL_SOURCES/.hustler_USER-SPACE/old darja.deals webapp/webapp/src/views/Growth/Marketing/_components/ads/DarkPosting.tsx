"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Input } from "@/components/core/ui/input";
import { Textarea } from "@/components/core/ui/textarea";
import { Switch } from "@/components/core/ui/switch";
import {
    EyeOff, Users, Target, Clock, Send,
    Facebook, Instagram, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function DarkPosting() {
    const [formData, setFormData] = useState({
        headline: "",
        description: "",
        targetAudience: "custom",
        schedule: false,
        scheduleDate: "",
    });

    const handleCreate = () => {
        if (!formData.headline || !formData.description) {
            toast.error("Please fill in all required fields");
            return;
        }
        toast.success("Dark post created successfully! (Mock)");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <EyeOff className="h-5 w-5 text-slate-500" />
                    Dark Posting
                </CardTitle>
                <CardDescription>
                    Create unpublished posts for ad campaigns without showing on your page
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Info Banner */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-blue-800 dark:text-blue-200">What is a Dark Post?</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Dark posts are sponsored content that won&apos;t appear on your Page timeline.
                            They&apos;re only shown to targeted audiences through ads.
                        </p>
                    </div>
                </div>

                {/* Platform Selection */}
                <div>
                    <p className="text-sm font-medium mb-3">Select Platform</p>
                    <div className="flex gap-2">
                        <Button variant="default" className="gap-2">
                            <Facebook className="h-4 w-4" /> Facebook
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Instagram className="h-4 w-4" /> Instagram
                        </Button>
                    </div>
                </div>

                {/* Post Content */}
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Headline</label>
                        <Input
                            placeholder="Write an attention-grabbing headline..."
                            value={formData.headline}
                            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Description</label>
                        <Textarea
                            placeholder="Write your post content..."
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                {/* Audience Targeting */}
                <div>
                    <p className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" /> Target Audience
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: "custom", label: "Custom Audience", desc: "Your uploaded lists" },
                            { id: "lookalike", label: "Lookalike", desc: "Similar to buyers" },
                            { id: "broad", label: "Broad Targeting", desc: "Algeria 18-65" },
                        ].map((option) => (
                            <div
                                key={option.id}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${formData.targetAudience === option.id
                                        ? "border-primary bg-primary/5"
                                        : "hover:border-primary/50"
                                    }`}
                                onClick={() => setFormData({ ...formData, targetAudience: option.id })}
                            >
                                <p className="font-medium text-sm">{option.label}</p>
                                <p className="text-xs text-muted-foreground">{option.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Schedule Option */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Schedule for Later</p>
                            <p className="text-sm text-muted-foreground">Set a specific date and time</p>
                        </div>
                    </div>
                    <Switch
                        checked={formData.schedule}
                        onCheckedChange={(checked) => setFormData({ ...formData, schedule: checked })}
                    />
                </div>

                {formData.schedule && (
                    <Input
                        type="datetime-local"
                        value={formData.scheduleDate}
                        onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                    />
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end pt-4">
                    <Button variant="outline">Save as Draft</Button>
                    <Button onClick={handleCreate} className="gap-2">
                        <Send className="h-4 w-4" /> Create Dark Post
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
