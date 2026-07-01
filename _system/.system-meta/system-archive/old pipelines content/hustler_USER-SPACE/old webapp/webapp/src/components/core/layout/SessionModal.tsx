"use client";

import * as React from "react";
import { X, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionModuleContent } from "./SessionControlPanel";

interface SessionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SessionModal({ isOpen, onClose }: SessionModalProps) {
    const modalRef = React.useRef<HTMLDivElement>(null);

    // Close on Escape
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            // Prevent body scroll when modal is open
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                className={cn(
                    "relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200",
                    "flex flex-col max-h-[85vh]"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Session Objectives</h2>
                            <p className="text-sm text-muted-foreground">Current tasks and team status</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* We reuse the existing content component */}
                    <SessionModuleContent />
                </div>

                {/* Footer hints */}
                <div className="px-6 py-3 bg-muted/30 border-t border-border text-xs text-muted-foreground flex justify-end gap-3 shrink-0">
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">esc</kbd> to close
                    </span>
                </div>
            </div>
        </div>
    );
}
