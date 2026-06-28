"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Upload, Zap, BarChart, Eye, PlayCircle, Check, AlertTriangle } from "lucide-react";

export default function HookAnalyzer() {
    const [analyzing, setAnalyzing] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const handleAnalyze = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            setScore(85);
        }, 2500);
    };

    return (
        <Card className="h-full border-yellow-100 dark:border-yellow-900 shadow-sm">
            <CardHeader className="bg-yellow-50/50 dark:bg-yellow-950/20 pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Hook Analyzer</CardTitle>
                        <CardDescription>Audit the first 3 seconds</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {!score ? (
                    <div
                        onClick={handleAnalyze}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors"
                    >
                        {analyzing ? (
                            <div className="flex flex-col items-center gap-3">
                                <Eye className="h-8 w-8 text-yellow-500 animate-pulse" />
                                <p className="text-sm font-medium text-muted-foreground">Watching first 3s...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm font-medium">Upload Video</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-center p-6 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-full w-32 h-32 mx-auto relative">
                            <div className="text-center">
                                <span className="block text-4xl font-bold text-yellow-700 dark:text-yellow-400">{score}</span>
                                <span className="text-xs font-medium text-yellow-800 dark:text-yellow-300">SCORE</span>
                            </div>
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-yellow-200 dark:text-yellow-900/30" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-yellow-500" strokeDasharray={`${score! * 2.8} 283`} />
                            </svg>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">AI Feedback:</h4>
                            <ul className="text-xs space-y-1 text-muted-foreground">
                                <li className="flex gap-2">
                                    <CheckIcon /> Visual movement detected immediately.
                                </li>
                                <li className="flex gap-2">
                                    <CheckIcon /> Clear text overlay in first 1s.
                                </li>
                                <li className="flex gap-2 text-blue-600">
                                    <BarChart className="h-3 w-3 mt-0.5" /> Better than 85% of viral hooks in your niche.
                                </li>
                                <li className="flex gap-2 text-orange-500">
                                    <AlertTriangle className="h-3 w-3" /> Audio hook could be louder.
                                </li>
                            </ul>
                        </div>

                        <Button variant="outline" className="w-full text-xs" onClick={() => setScore(null)}>
                            Analyze Another
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function CheckIcon() {
    return <div className="mt-0.5"><div className="h-3 w-3 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center"><CheckIconSvg /></div></div>
}

function CheckIconSvg() {
    return <svg className="w-2 h-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
}
