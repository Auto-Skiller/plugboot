"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { PenTool, Bold, Italic, Underline, Link, Image as ImageIcon, Sparkles, Save, RotateCcw } from "lucide-react";
import { Textarea } from "@/components/core/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/core/ui/badge";

export default function ContentEditor() {
    const [content, setContent] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
        setWordCount(content.trim().split(/\s+/).filter(w => w.length > 0).length);
    }, [content]);

    const handleAIImprove = () => {
        if (!content) {
            toast.error("Please enter some content first");
            return;
        }
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setContent(prev => prev + "\n\n✨ Enhanced by AI:\n" + prev);
            toast.success("Content improved by AI!");
        }, 1500);
    };

    const handleSave = () => {
        toast.success("Draft saved successfully");
    };

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <PenTool className="h-5 w-5 text-blue-500" />
                            Content Editor
                        </CardTitle>
                        <CardDescription>Write and optimize your marketing copy</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">
                            {wordCount} words
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => setContent("")}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="gap-2" onClick={handleSave}>
                            <Save className="h-4 w-4" /> Save
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-2 border-b bg-muted/5">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Underline className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-4 bg-border mx-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Link className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                    <div className="flex-1" />
                    <Button
                        variant="default"
                        size="sm"
                        className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                        onClick={handleAIImprove}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <Sparkles className="h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4" />
                        )}
                        AI Improve
                    </Button>
                </div>

                {/* Editor Area */}
                <Textarea
                    className="flex-1 resize-none border-0 focus-visible:ring-0 p-6 text-base leading-relaxed"
                    placeholder="Start writing your amazing content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>
        </Card>
    );
}
