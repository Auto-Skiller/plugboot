"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Upload, Activity, Check, AlertTriangle, FileVideo, Wifi } from "lucide-react";

export default function QualityOptimizer() {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<null | "optimized">(null);

    const handleUpload = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            setResult("optimized");
        }, 2000);
    };

    return (
        <Card className="h-full border-pink-100 dark:border-pink-900 shadow-sm">
            <CardHeader className="bg-pink-50/50 dark:bg-pink-950/20 pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                        <Wifi className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Quality Optimizer</CardTitle>
                        <CardDescription>Optimize for Algerian 4G/ADSL</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {!result ? (
                    <div
                        onClick={handleUpload}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors"
                    >
                        {analyzing ? (
                            <div className="flex flex-col items-center gap-3">
                                <Activity className="h-8 w-8 text-pink-500 animate-pulse" />
                                <p className="text-sm font-medium text-muted-foreground">Analyzing Bitrate & Codec...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm font-medium">Click to Upload Video</p>
                                <p className="text-xs text-muted-foreground">Max 500MB</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex gap-3">
                            <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                            <div>
                                <p className="font-semibold text-sm text-green-800 dark:text-green-200">Optimization Complete</p>
                                <p className="text-xs text-green-700 dark:text-green-300">Video transcoded to H.264 High Profile. Size reduced by 45%.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="block text-xs text-muted-foreground">Original Bitrate</span>
                                <span className="font-mono font-medium text-red-500">25 Mbps</span>
                            </div>
                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <span className="block text-xs text-muted-foreground">Optimized Bitrate</span>
                                <span className="font-mono font-medium text-green-500">15 Mbps</span>
                            </div>
                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded col-span-2">
                                <span className="block text-xs text-muted-foreground">Target Network</span>
                                <span className="font-medium flex items-center gap-1">
                                    <Wifi className="h-3 w-3" /> 4G / ADSL (Algeria)
                                </span>
                            </div>
                        </div>

                        <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                            Download Optimized File
                        </Button>
                        <Button variant="ghost" className="w-full text-xs" onClick={() => setResult(null)}>
                            Optimize Another
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
