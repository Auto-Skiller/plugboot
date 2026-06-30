"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    ArrowRight,
    Zap,
    LayoutDashboard,
    ShoppingBag,
    Megaphone,
    Users,
    CreditCard,
    PlusCircle,
    FileText,
    Settings
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/core/ui/dialog";
import { Input } from "@/components/core/ui/input";
import { ScrollArea } from "@/components/core/ui/scroll-area";
import { Badge } from "@/components/core/ui/badge";
import { cn } from "@/lib/utils";
import { HUB_CATEGORIES } from "@/config/hub-config";

interface CommandHubModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CommandHubModal({
    open,
    onOpenChange
}: CommandHubModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    // Reset search when opening
    useEffect(() => {
        if (open) setSearchQuery("");
    }, [open]);

    // Flatten pages for searching
    const allPages = HUB_CATEGORIES.flatMap(cat =>
        cat.pages.map(page => ({
            ...page,
            category: cat.title,
            categoryId: cat.id,
            icon: cat.icon
        }))
    );

    const filteredPages = allPages.filter(page =>
        page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const quickActions = [
        { name: "New Campaign", icon: Megaphone, href: "/ads?action=new", color: "text-pink-500", bg: "bg-pink-500/10" },
        { name: "Add Product", icon: ShoppingBag, href: "/ecommerce/products/new", color: "text-green-500", bg: "bg-green-500/10" },
        { name: "Create Post", icon: FileText, href: "/creatives?action=new", color: "text-purple-500", bg: "bg-purple-500/10" },
        { name: "Team Invite", icon: Users, href: "/admin/team?action=invite", color: "text-blue-500", bg: "bg-blue-500/10" },
    ].filter(action => action.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleSelect = (href: string) => {
        router.push(href);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl overflow-hidden translate-y-[-10%]">
                <div className="flex items-center px-4 py-3 border-b border-border/40">
                    <Search className="w-5 h-5 text-muted-foreground mr-3" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type a command or search..."
                        className="flex-1 border-none bg-transparent focus-visible:ring-0 px-0 text-lg h-9 placeholder:text-muted-foreground/50"
                        autoFocus
                    />
                    <div className="hidden md:flex items-center gap-1">
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">ESC</span>
                        </kbd>
                    </div>
                </div>

                <ScrollArea className="h-[50vh] max-h-[500px]">
                    <div className="p-2 space-y-4">

                        {/* Quick Actions - Only show if no specifics searched OR if they match */}
                        {quickActions.length > 0 && (
                            <div className="px-2 pt-2">
                                <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">Quick Actions</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {quickActions.map((action, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelect(action.href)}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                                        >
                                            <div className={cn("w-8 h-8 rounded-md flex items-center justify-center transition-colors", action.bg, action.color)}>
                                                <action.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium group-hover:text-primary transition-colors">{action.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Navigation Results */}
                        <div className="px-2">
                            <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">Navigation</h3>
                            {filteredPages.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredPages.map((page, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelect(page.href)}
                                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                    <page.icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                                        {page.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                                        <span className="text-primary/70">{page.category}</span>
                                                        {page.description && <span className="mx-1">·</span>}
                                                        {page.description}
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/50 -translate-x-1 group-hover:translate-x-0 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No results found for "{searchQuery}"
                                </div>
                            )}
                        </div>

                    </div>
                </ScrollArea>

                <div className="p-2 border-t bg-muted/20 text-[10px] text-muted-foreground flex justify-between px-4">
                    <div className="flex gap-3">
                        <span><strong>↑↓</strong> to navigate</span>
                        <span><strong>↵</strong> to select</span>
                    </div>
                    <div>
                        Global Command Center
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
