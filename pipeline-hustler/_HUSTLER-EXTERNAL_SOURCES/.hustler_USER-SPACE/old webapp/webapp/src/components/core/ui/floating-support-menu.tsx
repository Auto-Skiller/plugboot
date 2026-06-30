"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { HelpAssistantWidget } from "@/app/help/_components/HelpAssistantWidget";

interface FloatingSupportMenuProps {
    className?: string;
    whatsappNumber?: string;
    messengerUsername?: string;
    telegramUsername?: string;
}

export function FloatingSupportMenu({
    className,
    whatsappNumber,
    messengerUsername,
    telegramUsername,
}: FloatingSupportMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isMinimized, setIsMinimized] = React.useState(false);

    const handleOpen = () => {
        setIsOpen(true);
        setIsMinimized(false);
    };

    const handleMinimize = () => {
        setIsMinimized(true);
        // We keep isOpen = true so we know it's "active" but hidden
        // Or we can set isOpen = false if we want a full close.
        // User asked for minimize. Let's verify behavior:
        // Closed -> Icon only.
        // Open -> Window visible.
        // Minimized -> Window hidden, Icon visible (same as closed visually, but conceptually 'minimized').
        // Let's treat Minimized as just closing the window but maybe keeping state if needed later.
        // For now, minimizing just hides the window, effectively closing it from UI perspective.
        setIsOpen(false);
    };

    return (
        <>
            {/* The Chat Window Widget */}
            <HelpAssistantWidget
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onMinimize={handleMinimize}
                whatsappNumber={whatsappNumber}
                messengerUsername={messengerUsername}
                telegramUsername={telegramUsername}
            />

            {/* Floating Action Button */}
            <div className={cn("fixed bottom-6 left-3 z-[90] flex flex-col items-start gap-3", className)}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex items-center justify-center w-14 h-14 rounded-full shadow-lg relative group",
                        "transition-all duration-300 hover:scale-110 hover:shadow-xl",
                        "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    )}
                    aria-label="Toggle help assistant"
                >
                    {/* Glow effect */}
                    <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse group-hover:bg-white/30" />

                    {isOpen ? (
                        <X className="h-6 w-6 relative z-10" />
                    ) : (
                        <div className="relative z-10">
                            <Sparkles className="h-6 w-6 absolute -top-1 -right-1 opacity-100 scale-75" />
                            <MessageCircle className="h-6 w-6" />
                        </div>
                    )}
                </button>
            </div>
        </>
    );
}
