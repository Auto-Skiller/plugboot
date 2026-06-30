"use client";

import { useState, useEffect, RefObject } from "react";
import { cn } from "@/lib/utils";
import { MessageCircle, X, Minimize2, Maximize2, Sparkles, ExternalLink } from "lucide-react";
import { HelpCenterContent } from "./HelpCenterContent";
import { motion, AnimatePresence } from "framer-motion";

interface HelpAssistantWidgetProps {
    isOpen: boolean;
    onClose: () => void;
    onMinimize: () => void;
    isMinimized?: boolean;
    whatsappNumber?: string;
    messengerUsername?: string;
    telegramUsername?: string;
    popupDirection?: {
        vertical: 'top' | 'bottom';
        horizontal: 'left' | 'right';
    };
    anchorRef?: RefObject<HTMLDivElement>;
    iconPosition?: { x: number; y: number } | null;
}

export function HelpAssistantWidget({
    isOpen,
    onClose,
    onMinimize,
    isMinimized = false,
    whatsappNumber,
    messengerUsername,
    telegramUsername,
    popupDirection = { vertical: 'top', horizontal: 'left' },
    anchorRef,
    iconPosition
}: HelpAssistantWidgetProps) {
    const [isMaximized, setIsMaximized] = useState(false);

    // Calculate position based on anchor
    const [stylePosition, setStylePosition] = useState<{ top?: number; left?: number; right?: number; bottom?: number }>({});

    useEffect(() => {
        if (isMaximized || !isOpen || !anchorRef?.current) return;

        const rect = anchorRef.current.getBoundingClientRect();

        // Mobile-responsive dimensions
        const isMobile = window.innerWidth < 640;
        const PANEL_WIDTH = isMobile ? window.innerWidth - 32 : 380;
        const PANEL_HEIGHT = isMobile ? window.innerHeight - 100 : Math.min(600, window.innerHeight - 100);
        const GAP = 16;

        let top, left;

        // Horizontal positioning
        if (popupDirection.horizontal === 'left') {
            // Try to place to the left
            left = rect.left - PANEL_WIDTH - GAP;
            if (left < GAP) left = GAP; // Boundary check
        } else {
            // Place to the right
            left = rect.right + GAP;
            if (left + PANEL_WIDTH > window.innerWidth) left = window.innerWidth - PANEL_WIDTH - GAP;
        }

        // Vertical positioning
        if (popupDirection.vertical === 'top') {
            // Place upwards (bottom aligned with anchor bottom)
            top = rect.bottom - PANEL_HEIGHT;
            if (top < GAP) top = GAP; // Top boundary
        } else {
            // Place downwards (top aligned with anchor top)
            top = rect.top;
            if (top + PANEL_HEIGHT > window.innerHeight) top = window.innerHeight - PANEL_HEIGHT - GAP;
        }

        setStylePosition({ top, left });
    }, [isOpen, isMaximized, popupDirection, anchorRef, iconPosition]);

    if (!isOpen) return null;

    if (isMinimized) {
        return null; // Handled by the floating button state in parent
    }

    // Mobile-responsive width calculation
    const panelWidth = typeof window !== 'undefined' && window.innerWidth < 640
        ? `calc(100vw - 32px)`
        : '380px';
    const panelHeight = typeof window !== 'undefined' && window.innerWidth < 640
        ? `calc(100vh - 100px)`
        : '600px';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    drag
                    dragMomentum={false}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={cn(
                        "fixed z-[9999] bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden rounded-2xl",
                        isMaximized && "inset-4"
                    )}
                    style={isMaximized ? undefined : {
                        top: stylePosition.top,
                        left: stylePosition.left,
                        width: panelWidth,
                        height: panelHeight,
                        maxHeight: '80vh'
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm text-white leading-none">Help & Co-pilot</h3>
                                <p className="text-[10px] text-zinc-400 mt-1">AI Assistant & Support</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={onMinimize}
                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                title="Minimize"
                            >
                                <Minimize2 className="h-4 w-4" />
                            </button>
                            <a
                                href="/help"
                                target="_blank"
                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                title="Open in Full Page"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                            <button
                                onClick={() => setIsMaximized(!isMaximized)}
                                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                title={isMaximized ? "Restore" : "Maximize"}
                            >
                                <Maximize2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto bg-transparent scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        <HelpCenterContent
                            embedded={true}
                            whatsappNumber={whatsappNumber}
                            messengerUsername={messengerUsername}
                            telegramUsername={telegramUsername}
                        />
                    </div>

                    {/* Footer / Input Placeholder */}
                    <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ask AI Co-pilot something... (Coming Soon)"
                                disabled
                                className="w-full h-11 pl-4 pr-10 rounded-xl border border-white/10 bg-white/5 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all cursor-not-allowed"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-blue-500/20 rounded text-blue-400 opacity-50">
                                <Sparkles className="h-3.5 w-3.5" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
