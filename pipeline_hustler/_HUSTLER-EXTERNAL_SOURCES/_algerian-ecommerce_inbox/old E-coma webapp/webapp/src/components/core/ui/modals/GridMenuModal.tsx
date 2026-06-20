"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/core/ui/dialog";
import { Input } from "@/components/core/ui/input";
import { ScrollArea } from "@/components/core/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface GridItem {
    id: string;
    name: string;
    description?: string;
    icon: React.ReactNode;
    href: string;
    category?: string;
    color?: string; // e.g. "bg-blue-500"
}

interface GridMenuModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    items: GridItem[];
}

export function GridMenuModal({
    open,
    onOpenChange,
    title = "All Apps",
    items
}: GridMenuModalProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group by category
    const groupedItems = filteredItems.reduce((acc, item) => {
        const cat = item.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, GridItem[]>);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-xl">
                <div className="p-6 border-b flex items-center justify-between gap-4 bg-background/50">
                    <DialogTitle className="text-xl font-bold hidden md:block">{title}</DialogTitle>
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tools..."
                            className="pl-9 bg-background/50 border-transparent focus:border-input transition-all"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-8">
                        {Object.entries(groupedItems).map(([category, categoryItems]) => (
                            <div key={category} className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                                    {category}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {categoryItems.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            onClick={() => onOpenChange(false)}
                                            className="group relative flex flex-col p-4 rounded-xl border bg-card/50 hover:bg-card transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-colors",
                                                "bg-muted group-hover:bg-primary/10 group-hover:text-primary",
                                                item.color && `bg-opacity-10 text-opacity-100 ${item.color.replace('bg-', 'text-')}`
                                            )}>
                                                {item.icon}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                        {item.name}
                                                    </span>
                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                                </div>
                                                {item.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {filteredItems.length === 0 && (
                            <div className="text-center py-20 text-muted-foreground">
                                <p>No tools found matching "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
