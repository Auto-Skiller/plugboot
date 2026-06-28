"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, Command } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface ShortcutGroup {
    title: string;
    shortcuts: Shortcut[];
}

interface Shortcut {
    keys: string[];
    description: string;
}

// ============================================================================
// DEFAULT SHORTCUTS
// ============================================================================

const defaultShortcuts: ShortcutGroup[] = [
    {
        title: "General",
        shortcuts: [
            { keys: ["⌘", "K"], description: "Open command palette" },
            { keys: ["⌘", "/"], description: "Focus search" },
            { keys: ["?"], description: "Show keyboard shortcuts" },
            { keys: ["Esc"], description: "Close modal / Cancel" },
        ],
    },
    {
        title: "Navigation",
        shortcuts: [
            { keys: ["G", "H"], description: "Go to Dashboard" },
            { keys: ["G", "O"], description: "Go to Orders" },
            { keys: ["G", "P"], description: "Go to Products" },
            { keys: ["G", "A"], description: "Go to Analytics" },
            { keys: ["G", "S"], description: "Go to Settings" },
        ],
    },
    {
        title: "Actions",
        shortcuts: [
            { keys: ["⌘", "N"], description: "Create new order" },
            { keys: ["⌘", "S"], description: "Save changes" },
            { keys: ["⌘", "D"], description: "Toggle dark mode" },
            { keys: ["⌘", "B"], description: "Toggle sidebar" },
        ],
    },
    {
        title: "Table",
        shortcuts: [
            { keys: ["↑", "↓"], description: "Navigate rows" },
            { keys: ["Space"], description: "Select row" },
            { keys: ["⌘", "A"], description: "Select all" },
            { keys: ["Delete"], description: "Delete selected" },
        ],
    },
];

// ============================================================================
// KEYBOARD SHORTCUTS MODAL
// ============================================================================

interface KeyboardShortcutsProps {
    shortcuts?: ShortcutGroup[];
    className?: string;
}

export function KeyboardShortcuts({
    shortcuts = defaultShortcuts,
    className,
}: KeyboardShortcutsProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    // Listen for ? key
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if typing in an input
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            if (e.key === "?") {
                e.preventDefault();
                setIsOpen(true);
            }

            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div
                className={cn(
                    "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                    "w-full max-w-2xl max-h-[80vh] overflow-hidden",
                    "bg-card border rounded-xl shadow-2xl z-50",
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div className="flex items-center gap-2">
                        <Command className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {shortcuts.map((group) => (
                            <div key={group.title}>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    {group.title}
                                </h3>
                                <div className="space-y-2">
                                    {group.shortcuts.map((shortcut, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between py-1.5"
                                        >
                                            <span className="text-sm text-muted-foreground">
                                                {shortcut.description}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {shortcut.keys.map((key, keyIndex) => (
                                                    <React.Fragment key={keyIndex}>
                                                        <kbd className="px-2 py-1 text-xs font-medium bg-muted rounded border">
                                                            {key}
                                                        </kbd>
                                                        {keyIndex < shortcut.keys.length - 1 && (
                                                            <span className="text-muted-foreground text-xs">+</span>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t bg-muted/30 text-xs text-muted-foreground">
                    Press <kbd className="px-1.5 py-0.5 bg-muted rounded border mx-1">?</kbd> anytime to show this dialog
                </div>
            </div>
        </>
    );
}
