"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Slider } from "@/components/core/ui/slider"; // Assuming existence
import {
    Wand2, Image as ImageIcon, Eraser, Type, Sun, Contrast,
    Download, Undo, Redo, Sparkles, Scissors, Gauge, Subtitles
} from "lucide-react";

export default function AIMediaEditor() {
    const [selectedTool, setSelectedTool] = useState<string>("enhance");
    const [isProcessing, setIsProcessing] = useState(false);

    const TOOLS = [
        { id: "enhance", label: "Auto Enhance", icon: Sparkles },
        { id: "bg-remove", label: "Remove BG", icon: Eraser },
        { id: "text", label: "Add Text", icon: Type },
        { id: "brightness", label: "Brightness", icon: Sun },
        { id: "contrast", label: "Contrast", icon: Contrast },
        { id: "trim", label: "Trim Video", icon: Scissors },
        { id: "speed", label: "Speed Control", icon: Gauge },
        { id: "captions", label: "Auto Captions", icon: Subtitles },
    ];

    const handleProcess = (toolId: string) => {
        setIsProcessing(true);
        // Simulate processing
        setTimeout(() => {
            setIsProcessing(false);
        }, 1200);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
            {/* Toolbar */}
            <Card className="lg:col-span-1 h-full border-r border-border rounded-r-none lg:rounded-r-lg">
                <CardHeader>
                    <CardTitle className="text-lg">Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {TOOLS.map((tool) => (
                        <Button
                            key={tool.id}
                            variant={selectedTool === tool.id ? "default" : "ghost"}
                            className={`w-full justify-start gap-3 ${selectedTool === tool.id ? 'bg-primary text-primary-foreground' : ''}`}
                            onClick={() => setSelectedTool(tool.id)}
                        >
                            <tool.icon className="h-4 w-4" />
                            {tool.label}
                        </Button>
                    ))}

                    <div className="my-4 border-t border-border" />

                    <div className="space-y-4 p-2 bg-muted/30 rounded-lg">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold">Intensity</label>
                            <div className="relative w-full h-8 flex items-center">
                                {/* Mock Slider */}
                                <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className="w-1/2 h-full bg-primary" />
                                </div>
                                <div className="absolute left-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full -ml-2 shadow-sm cursor-pointer" />
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => handleProcess(selectedTool)}
                        className="w-full mt-4"
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Apply Effect
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Canvas / Preview Area */}
            <Card className="lg:col-span-3 h-full border-l border-border rounded-l-none lg:rounded-l-lg relative overflow-hidden bg-gray-100 dark:bg-gray-900/50 flex flex-col">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <Button variant="secondary" size="sm" className="bg-white/90 backdrop-blur shadow-sm">
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="sm" className="bg-white/90 backdrop-blur shadow-sm">
                        <Redo className="h-4 w-4" />
                    </Button>
                    <Button variant="default" size="sm" className="shadow-sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    {/* Placeholder for Canvas */}
                    <div className="relative max-w-full max-h-full aspect-video bg-white dark:bg-black shadow-2xl rounded-lg flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
                        <div className="text-center text-muted-foreground">
                            <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <p className="text-sm">Drag & Drop Image or Video</p>
                            <Button variant="outline" size="sm" className="mt-4">
                                Browse Files
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-background border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                    <span>Canvas: 1920 x 1080</span>
                    <span>Zoom: 100%</span>
                </div>
            </Card>
        </div>
    );
}
