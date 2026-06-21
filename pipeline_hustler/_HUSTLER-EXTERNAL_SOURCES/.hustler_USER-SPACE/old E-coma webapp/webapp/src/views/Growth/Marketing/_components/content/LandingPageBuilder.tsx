"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Layout, Plus, Eye, Save, Monitor, Smartphone, Trash2, GripVertical, Image as ImageIcon, Type, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const BUILDER_COMPONENTS = [
    { id: "hero", label: "Hero Section", icon: Layout },
    { id: "features", label: "Features Grid", icon: GripVertical },
    { id: "product", label: "Product Showcase", icon: ShoppingCart },
    { id: "testimonials", label: "Testimonials", icon: Type },
    { id: "gallery", label: "Image Gallery", icon: ImageIcon },
];

export default function LandingPageBuilder() {
    const [sections, setSections] = useState<string[]>(["hero"]);
    const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
    const [isPublishing, setIsPublishing] = useState(false);

    const addSection = (id: string) => {
        setSections(prev => [...prev, id]);
        toast.success("Section added to page");
    };

    const removeSection = (index: number) => {
        setSections(prev => prev.filter((_, i) => i !== index));
    };

    const handlePublish = () => {
        setIsPublishing(true);
        setTimeout(() => {
            setIsPublishing(false);
            toast.success("Landing page published successfully!");
        }, 1500);
    };

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Layout className="h-5 w-5 text-purple-500" />
                            Landing Page Builder
                        </CardTitle>
                        <CardDescription>Drag and drop sections to build high-converting pages</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex bg-muted rounded-md p-1 mr-4">
                            <Button
                                variant={viewMode === "desktop" ? "secondary" : "ghost"}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode("desktop")}
                            >
                                <Monitor className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === "mobile" ? "secondary" : "ghost"}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setViewMode("mobile")}
                            >
                                <Smartphone className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" /> Preview
                        </Button>
                        <Button size="sm" className="gap-2" onClick={handlePublish} disabled={isPublishing}>
                            <Save className="h-4 w-4" />
                            {isPublishing ? "Publishing..." : "Publish"}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r bg-muted/10 p-4 space-y-4 overflow-y-auto">
                    <h3 className="text-sm font-semibold mb-2">Components</h3>
                    <div className="grid gap-2">
                        {BUILDER_COMPONENTS.map(comp => (
                            <Button
                                key={comp.id}
                                variant="outline"
                                className="justify-start gap-2 h-auto py-3 bg-background hover:bg-muted"
                                onClick={() => addSection(comp.id)}
                            >
                                <comp.icon className="h-4 w-4 text-muted-foreground" />
                                <div className="text-left">
                                    <div className="text-sm font-medium">{comp.label}</div>
                                </div>
                                <Plus className="h-3 w-3 ml-auto opacity-50" />
                            </Button>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-800 dark:text-blue-200">
                        <p className="font-semibold mb-1">Pro Tip</p>
                        High-converting pages usually start with a strong Hero section followed by social proof.
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-8 overflow-y-auto flex justify-center">
                    <div className={`bg-background shadow-lg transition-all duration-300 flex flex-col ${viewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-4xl'}`}>
                        {sections.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 border-2 border-dashed m-4 rounded-lg">
                                <Layout className="h-10 w-10 mb-2 opacity-20" />
                                <p>Start adding sections from the sidebar</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {sections.map((sectionId, index) => {
                                    const comp = BUILDER_COMPONENTS.find(c => c.id === sectionId);
                                    const Icon = comp?.icon || Layout;
                                    return (
                                        <div key={index} className="p-8 group relative hover:bg-muted/30 transition-colors min-h-[150px] flex items-center justify-center border-b last:border-0 border-dashed border-transparent hover:border-border">
                                            <div className="text-center">
                                                <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                                                <h4 className="font-medium text-muted-foreground">{comp?.label} Component</h4>
                                                <p className="text-xs text-muted-foreground mt-1">Click to edit content</p>
                                            </div>

                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                                onClick={() => removeSection(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
