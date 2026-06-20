import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { ImagePlus, Play, Download, Settings, Trash2 } from "lucide-react";

interface Slide {
    id: number;
    url: string; // In real app, this would be a file URL or blob
    text: string;
}

const SlideshowGenerator = () => {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [duration, setDuration] = useState(3);
    const [isGenerating, setIsGenerating] = useState(false);

    // Mock function to simulate image upload
    const handleAddImage = () => {
        const newSlide = {
            id: Date.now(),
            url: "https://placehold.co/400x400/png", // Placeholder
            text: ""
        };
        setSlides([...slides, newSlide]);
    };

    const removeSlide = (id: number) => {
        setSlides(slides.filter(s => s.id !== id));
    };

    const updateSlideText = (id: number, text: string) => {
        setSlides(slides.map(s => s.id === id ? { ...s, text } : s));
    };

    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate processing time
        setTimeout(() => {
            setIsGenerating(false);
            // In real app, this would trigger download
        }, 2000);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ImagePlus className="h-5 w-5 text-pink-500" />
                    Slideshow Generator
                </CardTitle>
                <CardDescription>Create lightweight video ads for low-bandwidth users (3G)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Controls */}
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="space-y-1.5 w-32">
                        <Label>Seconds/Slide</Label>
                        <Input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            min={1}
                            max={10}
                        />
                    </div>
                    <Button onClick={handleAddImage} variant="outline" className="gap-2">
                        <PlusIcon className="h-4 w-4" /> Add Image
                    </Button>
                    <div className="flex-1" />
                    <Button onClick={handleGenerate} disabled={slides.length === 0 || isGenerating} className="gap-2">
                        {isGenerating ? <span className="animate-spin">⏳</span> : <Download className="h-4 w-4" />}
                        {isGenerating ? "Rendering..." : "Export Video"}
                    </Button>
                </div>

                {/* Slides Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 min-h-[200px] border-2 border-dashed rounded-lg p-4 bg-muted/20">
                    {slides.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground h-40">
                            <p>No slides yet.</p>
                            <p className="text-sm">Add images to start building your ad.</p>
                        </div>
                    ) : (
                        slides.map((slide, index) => (
                            <div key={slide.id} className="relative group border rounded-lg overflow-hidden bg-background">
                                <div className="aspect-square bg-muted flex items-center justify-center">
                                    <span className="text-xs text-muted-foreground">Image Preview</span>
                                </div>
                                <div className="p-2 space-y-2">
                                    <Label className="text-xs">Overlay Text</Label>
                                    <Input
                                        value={slide.text}
                                        onChange={(e) => updateSlideText(slide.id, e.target.value)}
                                        className="h-7 text-xs"
                                        placeholder="e.g. 50% OFF"
                                    />
                                </div>
                                <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 rounded">
                                    #{index + 1}
                                </div>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeSlide(slide.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>

            </CardContent>
        </Card>
    );
};

const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
)

export default SlideshowGenerator;
