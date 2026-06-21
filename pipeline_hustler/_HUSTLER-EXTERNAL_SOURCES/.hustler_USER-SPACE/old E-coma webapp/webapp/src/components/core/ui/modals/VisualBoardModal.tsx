"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreHorizontal, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/core/ui/dialog";
import { ScrollArea } from "@/components/core/ui/scroll-area";
import { Button } from "@/components/core/ui/button";
import { cn } from "@/lib/utils";

export interface BoardItem {
    id: string;
    title: string;
    subtitle?: string;
    status?: "default" | "warning" | "success" | "destructive";
    tags?: string[];
}

export interface BoardColumn {
    id: string;
    title: string;
    color?: string; // Hex or Tailwind class
    items: BoardItem[];
}

interface VisualBoardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    columns: BoardColumn[];
    onItemClick?: (item: BoardItem, columnId: string) => void;
    onAddClick?: (columnId: string) => void;
}

export function VisualBoardModal({
    open,
    onOpenChange,
    title,
    description,
    columns,
    onItemClick,
    onAddClick
}: VisualBoardModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="full" className="p-0 gap-0 overflow-hidden bg-muted/40 backdrop-blur-xl">
                <div className="flex flex-col h-full max-h-[100vh]">
                    <div className="p-6 border-b bg-background/80 backdrop-blur-md z-10 sticky top-0">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
                            {description && <DialogDescription className="text-base">{description}</DialogDescription>}
                        </DialogHeader>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        <div className="flex gap-6 h-full min-w-max pb-6">
                            {columns.map((col, idx) => (
                                <motion.div
                                    key={col.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="w-80 flex-shrink-0 flex flex-col gap-4"
                                >
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-3 h-3 rounded-full", col.color || "bg-primary")} />
                                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{col.title}</h3>
                                            <span className="bg-muted px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground">{col.items.length}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {col.items.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                layoutId={`card-${item.id}`}
                                                onClick={() => onItemClick?.(item, col.id)}
                                                className="group p-4 bg-card hover:bg-accent/50 rounded-xl border shadow-sm transition-all cursor-pointer hover:shadow-md active:scale-95 space-y-3"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className="font-medium text-sm leading-tight line-clamp-2">
                                                        {item.title}
                                                    </span>
                                                </div>
                                                {item.subtitle && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {item.subtitle}
                                                    </p>
                                                )}
                                                {item.tags && item.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {item.tags.map(tag => (
                                                            <span key={tag} className="px-2 py-0.5 rounded-md bg-secondary/30 text-[10px] font-medium text-secondary-foreground">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                        {onAddClick && (
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start text-muted-foreground hover:text-foreground h-10 border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5"
                                                onClick={() => onAddClick(col.id)}
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Task
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
