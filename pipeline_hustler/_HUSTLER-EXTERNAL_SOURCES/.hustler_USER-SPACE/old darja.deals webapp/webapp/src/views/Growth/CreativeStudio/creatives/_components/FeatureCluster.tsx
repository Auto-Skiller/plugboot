"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { ChevronDown, ChevronUp, Pin } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureClusterProps {
    id: string;
    title: string;
    icon: React.ReactNode;
    headerGradient: string;
    backgroundImage?: string; // Optional background image URL for collapsed state
    defaultExpanded?: boolean;
    children: React.ReactNode;
}

const PINNED_STORAGE_KEY = "creatives-pinned-clusters";

// Get pinned state for a cluster
function getPinnedState(id: string): boolean {
    try {
        const stored = localStorage.getItem(PINNED_STORAGE_KEY);
        if (stored) {
            const states = JSON.parse(stored);
            return states[id] === true;
        }
    } catch (e) {
        // Ignore storage errors
    }
    return false;
}

// Save pinned state for a cluster
function savePinnedState(id: string, pinned: boolean): void {
    try {
        const stored = localStorage.getItem(PINNED_STORAGE_KEY);
        const states = stored ? JSON.parse(stored) : {};
        states[id] = pinned;
        localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(states));
    } catch (e) {
        // Ignore storage errors
    }
}

export default function FeatureCluster({
    id,
    title,
    icon,
    headerGradient,
    backgroundImage,
    defaultExpanded = false,
    children,
}: FeatureClusterProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load state from localStorage on mount
    useEffect(() => {
        const pinned = getPinnedState(id);
        setIsPinned(pinned);
        // Only expand if pinned, otherwise stay collapsed
        setIsExpanded(pinned);
        setIsLoaded(true);
    }, [id]);

    const toggleExpand = () => setIsExpanded((prev) => !prev);

    const togglePin = (e: React.MouseEvent) => {
        e.stopPropagation(); // Don't trigger expand/collapse
        const newPinned = !isPinned;
        setIsPinned(newPinned);
        savePinnedState(id, newPinned);
        // If pinning, also expand it
        if (newPinned) {
            setIsExpanded(true);
        }
    };

    // Prevent flash of wrong state
    if (!isLoaded) {
        return null;
    }

    return (
        <Card className="shadow-lg border-2 overflow-hidden transition-all duration-300 hover:shadow-xl">
            {/* Clickable Header with Gradient and Optional Background */}
            <CardHeader
                onClick={toggleExpand}
                className={`cursor-pointer select-none py-6 px-6 min-h-[80px] ${headerGradient} transition-all duration-200 relative overflow-hidden`}
            >
                {/* Optional Background Image Layer */}
                {backgroundImage && (
                    <div
                        className="absolute inset-0 opacity-20 bg-cover bg-center"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                )}
                <div className="flex items-center justify-between relative z-10">
                    <CardTitle className="text-lg font-semibold flex items-center gap-3 text-white">
                        <span className="p-2 bg-white/20 rounded-lg">
                            {icon}
                        </span>
                        {title}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                        {/* Pin Button */}
                        <div
                            onClick={togglePin}
                            className={cn(
                                "p-2 rounded-full transition-all duration-200",
                                isPinned
                                    ? "bg-white/30 text-white"
                                    : "bg-white/10 text-white/50 hover:text-white hover:bg-white/20"
                            )}
                            title={isPinned ? "Unpin (will collapse on refresh)" : "Pin (stay expanded on refresh)"}
                        >
                            <Pin
                                className={cn(
                                    "h-4 w-4 transition-transform duration-200",
                                    isPinned ? "rotate-0" : "-rotate-45"
                                )}
                            />
                        </div>
                        {/* Expand/Collapse Icon */}
                        <div
                            className="p-2 bg-white/20 rounded-full transition-transform duration-300"
                            style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-180deg)' }}
                        >
                            <ChevronUp className="h-5 w-5 text-white" />
                        </div>
                    </div>
                </div>
            </CardHeader>

            {/* Collapsible Content */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <CardContent className="p-4 bg-background">
                    {children}
                </CardContent>
            </div>
        </Card>
    );
}
