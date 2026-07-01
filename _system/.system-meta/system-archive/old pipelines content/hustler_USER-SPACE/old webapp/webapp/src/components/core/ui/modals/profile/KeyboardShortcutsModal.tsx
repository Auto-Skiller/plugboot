"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/core/ui/dialog";
import { Keyboard, Command, Search, User, Home, Settings } from "lucide-react";

interface KeyboardShortcutsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsModal({
    open,
    onOpenChange
}: KeyboardShortcutsModalProps) {
    const shortcuts = [
        { label: "Search / Command Palette", keys: ["⌘", "K"], icon: Search },
        { label: "Go to Home", keys: ["G", "H"], icon: Home },
        { label: "Go to Profile", keys: ["G", "P"], icon: User },
        { label: "Settings", keys: ["⌘", ","], icon: Settings },
        { label: "Toggle Dark Mode", keys: ["⌘", "D"], icon: null },
        { label: "Close Modal", keys: ["Esc"], icon: null },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="w-5 h-5" />
                        Keyboard Shortcuts
                    </DialogTitle>
                    <DialogDescription>
                        Streamline your workflow with these shortcuts.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {shortcuts.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-card/50">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                {item.icon && <item.icon className="w-4 h-4" />}
                                <span>{item.label}</span>
                            </div>
                            <div className="flex gap-1">
                                {item.keys.map((key, kIdx) => (
                                    <kbd key={kIdx} className="px-2 py-1 bg-muted border rounded text-xs font-semibold min-w-[24px] text-center shadow-sm">
                                        {key}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
