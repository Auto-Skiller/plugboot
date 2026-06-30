"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Sparkles, Upload, Image as ImageIcon, Wand2 } from "lucide-react";

export default function EnhancePhotoModule() {
    return (
        <Card className="bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-900/10 dark:to-rose-900/10 border-pink-200/60 dark:border-pink-800/30">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-pink-800 dark:text-pink-500">
                            <Wand2 className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                            Enhance Product Photos
                        </CardTitle>
                        <CardDescription>AI-powered studio lighting and background removal</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full border-2 border-dashed border-pink-200 dark:border-pink-800/40 rounded-xl p-8 flex flex-col items-center justify-center bg-white/40 dark:bg-white/5 hover:bg-pink-50/50 dark:hover:bg-pink-900/20 transition-colors cursor-pointer group">
                        <div className="p-4 rounded-full bg-pink-100 dark:bg-pink-900/30 group-hover:scale-110 transition-transform">
                            <Upload className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                        </div>
                        <p className="mt-4 text-sm font-medium text-center">Click to upload raw photo</p>
                        <p className="text-xs text-muted-foreground text-center">Supports JPG, PNG (Max 5MB)</p>
                    </div>

                    <div className="flex items-center justify-center">
                        <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
                    </div>

                    <div className="flex-1 w-full p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-pink-100/50 dark:border-pink-800/30">
                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant="outline" className="text-pink-600 border-pink-200">AI Magic</Badge>
                            <span className="text-xs text-muted-foreground">Studio Quality</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Remove Background</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Adjust Lighting</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>Upscale Resolution</span>
                            </div>
                        </div>
                        <Button className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white gap-2">
                            <Sparkles className="h-4 w-4" /> Enhance Now
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

import { ArrowRight, CheckCircle } from "lucide-react";
