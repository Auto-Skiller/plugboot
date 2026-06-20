"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/core/ui/tabs";
import { Facebook, Instagram, Music2, Smartphone, MonitorPlay, Layers, Check } from "lucide-react";

interface Preset {
    id: string;
    label: string;
    ratio: string;
    resolution: string;
    icon: any;
    description: string;
}

const PRESETS: Record<string, Preset[]> = {
    facebook: [
        { id: "fb-feed", label: "FB Feed", ratio: "4:5", resolution: "1080 x 1350", icon: Layers, description: "Best for engagement in feed" },
        { id: "fb-story", label: "FB Story", ratio: "9:16", resolution: "1080 x 1920", icon: Smartphone, description: "Full screen vertical experience" },
    ],
    instagram: [
        { id: "ig-square", label: "IG Square", ratio: "1:1", resolution: "1080 x 1080", icon: Layers, description: "Classical feed post" },
        { id: "ig-portrait", label: "IG Portrait", ratio: "4:5", resolution: "1080 x 1350", icon: Layers, description: "Maximize screen real estate" },
        { id: "ig-reel", label: "IG Reel", ratio: "9:16", resolution: "1080 x 1920", icon: Smartphone, description: "For Reels and Stories" },
    ],
    tiktok: [
        { id: "tt-video", label: "TikTok Video", ratio: "9:16", resolution: "1080 x 1920", icon: Music2, description: "Standard full screen video" },
    ]
};

export default function FormatPresets() {
    const [selectedPlatform, setSelectedPlatform] = useState("instagram");
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

    return (
        <Card className="h-full border-gray-200 dark:border-gray-800">
            <CardHeader>
                <CardTitle className="text-lg">Format Presets</CardTitle>
                <CardDescription>Optimal dimensions for every platform</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="instagram" className="flex items-center gap-2">
                            <Instagram className="h-4 w-4 text-pink-500" />
                            <span className="hidden sm:inline">Instagram</span>
                        </TabsTrigger>
                        <TabsTrigger value="facebook" className="flex items-center gap-2">
                            <Facebook className="h-4 w-4 text-blue-600" />
                            <span className="hidden sm:inline">Facebook</span>
                        </TabsTrigger>
                        <TabsTrigger value="tiktok" className="flex items-center gap-2">
                            <Music2 className="h-4 w-4 text-black dark:text-white" />
                            <span className="hidden sm:inline">TikTok</span>
                        </TabsTrigger>
                    </TabsList>

                    {Object.entries(PRESETS).map(([platform, presets]) => (
                        <TabsContent key={platform} value={platform} className="space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                                {presets.map((preset) => (
                                    <div
                                        key={preset.id}
                                        onClick={() => setSelectedPreset(preset.id)}
                                        className={`
                                            relative flex items-center gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all
                                            ${selectedPreset === preset.id
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                : 'border-transparent bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'}
                                        `}
                                    >
                                        <div className={`
                                            w-12 h-12 flex items-center justify-center rounded-md 
                                            ${selectedPreset === preset.id ? 'bg-indigo-200 dark:bg-indigo-800' : 'bg-gray-200 dark:bg-gray-700'}
                                        `}>
                                            <preset.icon className={`h-6 w-6 ${selectedPreset === preset.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-500'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-sm text-foreground">{preset.label}</h4>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground font-mono">
                                                    {preset.resolution}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{preset.description}</p>
                                        </div>
                                        {selectedPreset === preset.id && (
                                            <div className="absolute top-2 right-2 text-indigo-500">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>

                {selectedPreset && (
                    <div className="mt-6 pt-4 border-t border-border">
                        <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 mb-3 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Smartphone className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-sm font-semibold mb-1">Click to Upload</h3>
                            <p className="text-xs text-muted-foreground">or drag and drop to auto-crop</p>
                            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-semibold">
                                {PRESETS[selectedPlatform].find(p => p.id === selectedPreset)?.label} ({PRESETS[selectedPlatform].find(p => p.id === selectedPreset)?.ratio})
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
