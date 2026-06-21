"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/core/ui/dialog";
import { ScrollArea } from "@/components/core/ui/scroll-area";
import { Separator } from "@/components/core/ui/separator";

interface SplitViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    leftTitle?: string;
    rightTitle?: string;
    leftContent: React.ReactNode;
    rightContent: React.ReactNode;
}

export function SplitViewModal({
    open,
    onOpenChange,
    title,
    leftTitle,
    rightTitle,
    leftContent,
    rightContent
}: SplitViewModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="full" className="p-0 gap-0 overflow-hidden">
                <div className="flex flex-col h-full bg-muted/10">
                    <div className="p-4 border-b bg-background">
                        <DialogHeader>
                            <DialogTitle>{title}</DialogTitle>
                        </DialogHeader>
                    </div>

                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x overflow-hidden">
                        {/* Left Panel */}
                        <div className="flex flex-col min-h-0">
                            {leftTitle && (
                                <div className="p-3 border-b bg-muted/30 text-sm font-semibold text-center text-muted-foreground">
                                    {leftTitle}
                                </div>
                            )}
                            <ScrollArea className="flex-1 p-6">
                                {leftContent}
                            </ScrollArea>
                        </div>

                        {/* Right Panel */}
                        <div className="flex flex-col min-h-0 bg-background/50">
                            {rightTitle && (
                                <div className="p-3 border-b bg-muted/30 text-sm font-semibold text-center text-muted-foreground">
                                    {rightTitle}
                                </div>
                            )}
                            <ScrollArea className="flex-1 p-6">
                                {rightContent}
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
