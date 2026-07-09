"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/core/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/core/ui/dialog";
import {
    Sparkles,
    ChevronRight,
    Copy,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTENT_TEMPLATES, TEMPLATE_CATEGORIES, ContentTemplate } from "./template-data";

interface TemplateLibraryProps {
    onSelectTemplate?: (template: ContentTemplate) => void;
    isOpen?: boolean;
    onClose?: () => void;
}

/**
 * TemplateLibrary - Browse and select pre-built content templates
 * Migrated to standardized Dialog component - all functionality preserved
 */
export function TemplateLibrary({
    onSelectTemplate,
    isOpen = false,
    onClose,
    variant = "dialog"
}: TemplateLibraryProps & { variant?: "dialog" | "inline" }) {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<ContentTemplate | null>(null);

    const filteredTemplates = selectedCategory === "all"
        ? CONTENT_TEMPLATES
        : CONTENT_TEMPLATES.filter(t => t.category === selectedCategory);

    const copyHook = (template: ContentTemplate) => {
        navigator.clipboard.writeText(template.hook);
        setCopiedId(template.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleUseTemplate = (template: ContentTemplate) => {
        onSelectTemplate?.(template);
        if (variant === "dialog") {
            onClose?.();
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && onClose) {
            onClose();
        }
    };

    const Content = (
        <div className={cn("flex", variant === "dialog" ? "h-[calc(80vh-80px)]" : "h-[600px] border rounded-lg bg-background")}>
            {/* Left: Template List */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {/* Category Tabs */}
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="px-4 pt-4">
                    <TabsList className="w-full justify-start overflow-x-auto">
                        {TEMPLATE_CATEGORIES.map(cat => (
                            <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                                {cat.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {/* Template Grid */}
                <div className="p-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredTemplates.map(template => (
                            <Card
                                key={template.id}
                                className={cn(
                                    "cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
                                    previewTemplate?.id === template.id && "ring-2 ring-primary"
                                )}
                                onClick={() => setPreviewTemplate(template)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <template.icon className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-sm">{template.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                {template.description}
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {template.platforms.slice(0, 3).map(p => (
                                                    <Badge key={p} variant="outline" className="text-[10px] px-1.5 py-0">
                                                        {p}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Preview Panel */}
            <div className="w-80 border-l bg-muted/30 p-4 overflow-y-auto">
                {previewTemplate ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <previewTemplate.icon className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">{previewTemplate.name}</h3>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground mb-1.5">Hook Example</p>
                            <div className="p-3 bg-background rounded-lg border text-sm relative group">
                                {previewTemplate.hook}
                                <button
                                    onClick={() => copyHook(previewTemplate)}
                                    className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Copy hook"
                                >
                                    {copiedId === previewTemplate.id ? (
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground mb-1.5">Structure</p>
                            <ol className="space-y-1">
                                {previewTemplate.structure.map((step, i) => (
                                    <li key={i} className="text-sm flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center">
                                            {i + 1}
                                        </span>
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground mb-1.5">Suggested Hashtags</p>
                            <div className="flex flex-wrap gap-1">
                                {previewTemplate.hashtags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-[10px]">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={() => handleUseTemplate(previewTemplate)}
                            className="w-full gap-2 mt-4"
                        >
                            Use This Template
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Sparkles className="h-8 w-8 text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Select a template to preview
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    if (variant === "inline") {
        return Content;
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent size="xl" className="p-0 max-h-[80vh] overflow-hidden">
                {/* Header */}
                <DialogHeader className="p-4 border-b">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <DialogTitle>Smart Templates</DialogTitle>
                        <Badge variant="secondary">{CONTENT_TEMPLATES.length} templates</Badge>
                    </div>
                    <DialogDescription className="sr-only">
                        Browse and select pre-built content templates
                    </DialogDescription>
                </DialogHeader>
                {Content}
            </DialogContent>
        </Dialog>
    );
}

