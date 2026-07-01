"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle2, Circle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/core/ui/dialog";
import { ScrollArea } from "@/components/core/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface PipelineStage {
    id: string;
    title: string;
    status: "completed" | "current" | "pending" | "failed";
    meta?: string;
    items?: React.ReactNode[];
}

interface PipelineModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    stages: PipelineStage[];
}

export function PipelineModal({
    open,
    onOpenChange,
    title,
    description,
    stages
}: PipelineModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="xl" className="bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>

                <div className="mt-6 relative">
                    {/* Connecting Line - Background */}
                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-muted -z-10" />

                    <ScrollArea className="w-full pb-4">
                        <div className="flex justify-between items-start min-w-max gap-8 px-2">
                            {stages.map((stage, idx) => (
                                <div key={stage.id} className="flex flex-col items-center gap-4 w-48 pt-2 relative">
                                    {/* Status Icon */}
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-4 border-background transition-colors bg-card z-10",
                                        stage.status === "completed" ? "text-green-500 bg-green-50 border-green-100" :
                                            stage.status === "current" ? "text-primary bg-primary/10 border-primary/20 ring-2 ring-primary ring-offset-2" :
                                                stage.status === "failed" ? "text-red-500 bg-red-50 border-red-100" :
                                                    "text-muted-foreground bg-muted border-muted"
                                    )}>
                                        {stage.status === "completed" && <CheckCircle2 className="w-5 h-5" />}
                                        {stage.status === "current" && <Clock className="w-5 h-5 animate-pulse" />}
                                        {stage.status === "pending" && <Circle className="w-5 h-5" />}
                                    </div>

                                    {/* Content */}
                                    <div className="text-center space-y-2 w-full">
                                        <div>
                                            <h4 className={cn("font-semibold text-sm",
                                                stage.status === "current" ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {stage.title}
                                            </h4>
                                            {stage.meta && <p className="text-xs text-muted-foreground">{stage.meta}</p>}
                                        </div>

                                        {/* Stage Items/Cards */}
                                        {stage.items && (
                                            <div className="flex flex-col gap-2 mt-4">
                                                {stage.items.map((item, i) => (
                                                    <div key={i} className="bg-card border rounded-lg p-3 text-left text-sm shadow-sm hover:shadow-md transition-shadow">
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Arrow connecting to next */}
                                    {idx < stages.length - 1 && (
                                        <div className="absolute top-6 -right-[calc(2rem-2px)] text-muted-foreground/30">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
