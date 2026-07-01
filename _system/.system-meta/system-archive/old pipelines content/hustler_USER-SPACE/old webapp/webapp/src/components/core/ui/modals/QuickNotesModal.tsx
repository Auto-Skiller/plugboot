"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Copy, Eraser, Minimize2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/core/ui/dialog";
import { Button } from "@/components/core/ui/button";
import { Textarea } from "@/components/core/ui/textarea";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface QuickNotesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function QuickNotesModal({ open, onOpenChange }: QuickNotesModalProps) {
    const [note, setNote] = useState("");
    const [isMinimized, setIsMinimized] = useState(false);

    // Load from local storage
    useEffect(() => {
        const savedNote = localStorage.getItem("ecosystem-quick-note");
        if (savedNote) setNote(savedNote);
    }, []);

    // Save on change
    useEffect(() => {
        localStorage.setItem("ecosystem-quick-note", note);
    }, [note]);

    const handleCopy = () => {
        navigator.clipboard.writeText(note);
        // Could add toast here
    };

    const handleClear = () => {
        if (confirm("Clear all notes?")) {
            setNote("");
        }
    };

    if (!open) return null;

    // Use Portal to escape conventional modal stacking if needed, but Dialog handles it well.
    // For "Minimized" state, we might want a custom floating UI, but for now we'll stick to a standard dialog
    // adjusted to look like a floating notepad.

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "p-0 gap-0 bg-yellow-50 dark:bg-zinc-900 border-yellow-200 dark:border-zinc-800 shadow-xl overflow-hidden transition-all duration-300",
                    isMinimized ? "w-64 h-12 bottom-20 right-4 absolute translate-x-0 translate-y-0" : "max-w-md w-full h-[500px]"
                )}
                hideCloseButton // Custom header
            >
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 bg-yellow-100/50 dark:bg-zinc-800/50 border-b border-yellow-200/50 dark:border-zinc-800 cursor-move handle">
                    <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-500 flex items-center gap-2">
                        Drafts & Ideas
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-yellow-800/50 dark:text-zinc-400 hover:text-yellow-900 dark:hover:text-zinc-100"
                            onClick={handleCopy}
                            title="Copy to clipboard"
                        >
                            <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-yellow-800/50 dark:text-zinc-400 hover:text-yellow-900 dark:hover:text-zinc-100"
                            onClick={handleClear}
                            title="Clear"
                        >
                            <Eraser className="w-3 h-3" />
                        </Button>
                        {/* 
                         <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-yellow-800/50 hover:text-yellow-900"
                            onClick={() => setIsMinimized(!isMinimized)}
                        >
                            <Minimize2 className="w-3 h-3" />
                        </Button>
                        */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-yellow-800/50 dark:text-zinc-400 hover:text-yellow-900 dark:hover:text-zinc-100"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 h-full bg-yellow-50/50 dark:bg-zinc-900 p-0 relative">
                    <Textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Type quickly..."
                        className="w-full h-full resize-none border-none focus-visible:ring-0 bg-transparent p-4 text-sm leading-relaxed text-zinc-800 dark:text-zinc-300 font-mono placeholder:text-zinc-400/50"
                    />
                    <div className="absolute bottom-2 right-3 text-[10px] text-zinc-400">
                        {note.length} chars
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
