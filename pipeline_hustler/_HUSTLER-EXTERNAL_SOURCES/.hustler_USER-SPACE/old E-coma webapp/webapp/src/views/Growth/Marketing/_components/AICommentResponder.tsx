"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Textarea } from "@/components/core/ui/textarea";
import { Badge } from "@/components/core/ui/badge";
import { Switch } from "@/components/core/ui/switch";
import { Sparkles, Copy, RefreshCw, Edit, Check } from "lucide-react";
import { toast } from "sonner";

const MOCK_RESPONSES = [
    {
        original: "شحال الثمن؟",
        suggestions: [
            "السلام! الثمن هو 4500 دج مع التوصيل المجاني 🎁",
            "أهلا! السعر 4500 دج، والتوصيل بلاش عندنا 😊",
            "مرحبا! 4500 دج فقط + توصيل مجاني لكل ولايات الوطن ✨"
        ]
    },
    {
        original: "Est-ce que vous livrez à Oran?",
        suggestions: [
            "Oui bien sûr! On livre partout en Algérie 🚚 Livraison gratuite pour Oran!",
            "Absolument! Livraison disponible à Oran et toutes les wilayas 📦",
            "Oui! On livre à Oran en 24-48h, livraison gratuite 🎉"
        ]
    }
];

export function AICommentResponder() {
    const [inputComment, setInputComment] = useState("");
    const [responses, setResponses] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedExample, setSelectedExample] = useState<number | null>(null);
    const [isBatchMode, setIsBatchMode] = useState(false);
    const [batchResponses, setBatchResponses] = useState<{ comment: string; responses: string[] }[]>([]);

    const generateResponses = async () => {
        if (!inputComment.trim()) {
            toast.error("Please enter a comment to respond to");
            return;
        }

        setIsGenerating(true);

        // Mock AI generation with delay
        setTimeout(() => {
            if (isBatchMode) {
                // Parse multiple comments (split by new lines)
                const comments = inputComment.split('\n').filter(c => c.trim());
                const batchResults = comments.map(comment => ({
                    comment,
                    responses: [
                        "شكرا على تعليقك! 🙏 نحن سعداء بخدمتك دائما 💙",
                        "Merci beaucoup! On est là pour vous servir 🌟",
                        "أهلا وسهلا! نشكرك على الثقة ❤️"
                    ]
                }));
                setBatchResponses(batchResults);
                setResponses([]);
                toast.success(`Generated responses for ${comments.length} comments!`);
            } else {
                const mockResponses = [
                    "شكرا على تعليقك! 🙏 نحن سعداء بخدمتك دائما 💙",
                    "Merci beaucoup! On est là pour vous servir 🌟",
                    "أهلا وسهلا! نشكرك على الثقة، ونتمنى نكونو عند حسن ظنك ❤️"
                ];
                setResponses(mockResponses);
                setBatchResponses([]);
            }
            setIsGenerating(false);
        }, 1500);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Response copied to clipboard!");
    };

    const loadExample = (index: number) => {
        setSelectedExample(index);
        setInputComment(MOCK_RESPONSES[index].original);
        setResponses(MOCK_RESPONSES[index].suggestions);
        setBatchResponses([]);
        setIsBatchMode(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    AI Comment Responder
                </h2>
                <p className="text-sm text-muted-foreground">
                    Generate personalized responses to customer comments in Darja and French. Maintain engagement at scale with culturally-appropriate replies.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Customer Comment{isBatchMode ? "s" : ""}</CardTitle>
                                <CardDescription>{isBatchMode ? "Paste multiple comments (one per line)" : "Paste the comment you want to respond to"}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Batch Mode</span>
                                <Switch checked={isBatchMode} onCheckedChange={(v) => { setIsBatchMode(v); setResponses([]); setBatchResponses([]); }} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder={isBatchMode ? "شحال الثمن؟\nC'est disponible?\nكيفاش نشري؟" : "e.g., شحال الثمن؟ / C'est disponible?"}
                            rows={isBatchMode ? 6 : 4}
                            value={inputComment}
                            onChange={(e) => setInputComment(e.target.value)}
                            className="font-mono"
                        />

                        <Button
                            onClick={generateResponses}
                            className="w-full gap-2"
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</>
                            ) : (
                                <><Sparkles className="h-4 w-4" /> {isBatchMode ? "Generate All Responses" : "Generate Responses"}</>
                            )}
                        </Button>

                        {!isBatchMode && (
                            <div className="pt-4 border-t">
                                <p className="text-xs text-muted-foreground mb-2">Try an example:</p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => loadExample(0)}
                                        className="text-xs"
                                    >
                                        Darja Example
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => loadExample(1)}
                                        className="text-xs"
                                    >
                                        French Example
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Generated Responses */}
                <Card className={responses.length > 0 || batchResponses.length > 0 ? "border-purple-500/50 bg-purple-500/5" : ""}>
                    <CardHeader>
                        <CardTitle className="text-lg">AI-Generated Responses</CardTitle>
                        <CardDescription>{isBatchMode ? "Responses for each comment" : "Choose the best response or edit as needed"}</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[400px] overflow-y-auto">
                        {batchResponses.length > 0 ? (
                            <div className="space-y-4">
                                {batchResponses.map((item, idx) => (
                                    <div key={idx} className="p-3 rounded-lg border bg-background">
                                        <p className="text-xs text-muted-foreground mb-2">Comment: <strong>{item.comment}</strong></p>
                                        <div className="space-y-2">
                                            {item.responses.map((resp, rIdx) => (
                                                <div key={rIdx} className="flex items-center justify-between gap-2 p-2 rounded bg-muted/30 group">
                                                    <p className="text-sm flex-1">{resp}</p>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => copyToClipboard(resp)}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : responses.length > 0 ? (
                            <div className="space-y-3">
                                {responses.map((response, index) => (
                                    <div
                                        key={index}
                                        className="p-3 rounded-lg border bg-background hover:bg-accent/50 transition-colors group"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm flex-1">{response}</p>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => copyToClipboard(response)}
                                                    title="Copy to clipboard"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(response);
                                                        toast.success("Response copied! Edit and post.");
                                                    }}
                                                    title="Edit before posting"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-green-600 hover:text-green-700"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(response);
                                                        toast.success("Response approved! Ready to post.");
                                                    }}
                                                    title="Approve and post"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="text-[10px] mt-2">
                                            Option {index + 1}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <Sparkles className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                                <p className="text-muted-foreground">
                                    Enter {isBatchMode ? "comments" : "a comment"} and click &quot;Generate&quot; to see AI responses
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Features */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">AI Responder Features</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg bg-muted/30">
                            <p className="font-semibold mb-2 text-sm">🇩🇿 Algerian Darja</p>
                            <p className="text-xs text-muted-foreground">
                                Authentic Darja responses that resonate with local customers
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                            <p className="font-semibold mb-2 text-sm">🎯 On-Brand Tone</p>
                            <p className="text-xs text-muted-foreground">
                                Friendly, professional, and culturally appropriate
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                            <p className="font-semibold mb-2 text-sm">⚡ Instant Generation</p>
                            <p className="text-xs text-muted-foreground">
                                3 variations in seconds, ready to copy and post
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
