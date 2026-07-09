"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/core/ui/select";
import { Sparkles, Copy, Lightbulb } from "lucide-react";

const MOCK_HOOKS = [
    "Stop scrolling if you want to fix [PROBLEM] in seconds! 🛑",
    "I tried every [PRODUCT TYPE] so you don't have to... here is the winner 🏆",
    "3 secrets about [TOPIC] that nobody tells you 🤫",
    "POV: You finally found the perfect [PRODUCT] for [AUDIENCE] ✨",
    "Warning: This [PRODUCT] might actually change your life ⚠️",
    // New Trending / Localized Styles
    "If you live in Algeria and struggle with [PROBLEM], watch this 🇩🇿",
    "Don't buy a [PRODUCT TYPE] until you see this video! ❌",
    "The exact reason why your [TOPIC] isn't working... 💡",
    "Did you know you can get [PRODUCT] delivered to 58 wilayas? 🚚"
];

export default function HookGenerator() {
    const [product, setProduct] = useState("");
    const [audience, setAudience] = useState("");
    const [platform, setPlatform] = useState("TikTok");
    const [hooks, setHooks] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleGenerate = () => {
        if (!product) return;
        setLoading(true);
        setTimeout(() => {
            const topic = product || "Product";
            const generated = MOCK_HOOKS.map(h =>
                h.replace("[PROBLEM]", "bad lighting")
                    .replace("[PRODUCT TYPE]", "lamp")
                    .replace("[TOPIC]", topic)
                    .replace("[PRODUCT]", topic)
                    .replace("[AUDIENCE]", "creators")
            );
            setHooks(generated);
            setLoading(false);
        }, 1000);
    };

    return (
        <Card className="h-full border-blue-100 dark:border-blue-900 shadow-sm">
            <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Hook Generator</CardTitle>
                        <CardDescription>Viral openers for your videos</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-semibold">Product / Topic</label>
                    <Input
                        placeholder="e.g. Ring Light"
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold">Target Audience</label>
                    <Input
                        placeholder="e.g. Students in Algiers"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold">Platform</label>
                    <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Platform" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TikTok">TikTok</SelectItem>
                            <SelectItem value="Instagram">Instagram Reels</SelectItem>
                            <SelectItem value="Facebook">Facebook Video</SelectItem>
                            <SelectItem value="YouTube">YouTube Shorts</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold">Style</label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Style" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="funny">Funny / Humorous</SelectItem>
                            <SelectItem value="shocking">Shocking / Controversial</SelectItem>
                            <SelectItem value="question">Question Hook</SelectItem>
                            <SelectItem value="educational">Educational</SelectItem>
                            <SelectItem value="storytime">Storytime</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleGenerate}
                    disabled={loading || !product}
                >
                    {loading ? <span className="animate-pulse">Generating...</span> : "Generate Hooks"}
                </Button>

                {hooks.length > 0 && (
                    <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {hooks.map((hook, i) => (
                            <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm flex gap-3 group hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                <span className="text-blue-500 font-bold">{i + 1}.</span>
                                <p className="flex-1">{hook}</p>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
