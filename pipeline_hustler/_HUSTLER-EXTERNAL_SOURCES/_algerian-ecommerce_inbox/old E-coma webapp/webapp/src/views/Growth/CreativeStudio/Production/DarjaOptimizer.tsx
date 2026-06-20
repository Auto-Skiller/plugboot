"use client";

import { useState } from "react";
import { Button } from "@/components/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Textarea } from "@/components/core/ui/textarea"; // Assuming this exists, if not I'll fallback to standard textarea
import { Sparkles, Copy, Check, RefreshCw, Languages, Upload } from "lucide-react";

export default function DarjaOptimizer() {
    const [inputText, setInputText] = useState("");
    const [outputText, setOutputText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleOptimize = async () => {
        if (!inputText.trim()) return;

        setIsGenerating(true);
        // Simulator for AI call
        setTimeout(() => {
            setOutputText(`(Darja Version) \n\n${inputText}\n\n[AI would rewrite this in authentic Algerian Darja, using local expressions and humor]`);
            setIsGenerating(false);
        }, 1500);
    };

    const handleCopy = () => {
        if (!outputText) return;
        navigator.clipboard.writeText(outputText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="h-full border-indigo-100 dark:border-indigo-900 shadow-sm">
            <CardHeader className="bg-indigo-50/50 dark:bg-indigo-950/20 pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                        <Languages className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Darja Optimizer</CardTitle>
                        <CardDescription>Translate any content into authentic Algerian Darja</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-muted-foreground">Original Text (French / Arabic / English)</label>
                        <Button variant="ghost" size="sm" className="h-6 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                            <Upload className="w-3 h-3 mr-1" /> Import Transcript
                        </Button>
                    </div>
                    <textarea
                        className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background/50 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Paste your content here or import a video transcript..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                </div>

                <div className="flex justify-center">
                    <Button
                        onClick={handleOptimize}
                        disabled={!inputText || isGenerating}
                        className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md transform transition-all active:scale-95"
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Optimizing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Convert to Darja
                            </>
                        )}
                    </Button>
                </div>

                {outputText && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Optimized Result</label>
                            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 text-xs">
                                {copied ? (
                                    <>
                                        <Check className="mr-1 h-3 w-3 text-green-500" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="mr-1 h-3 w-3" />
                                        Copy Text
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="w-full min-h-[120px] p-4 rounded-md bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-sm whitespace-pre-wrap font-medium">
                            {outputText}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
