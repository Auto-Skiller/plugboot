"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { Card, CardContent } from "@/components/core/ui/card";
import { ChevronDown, Pin } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureClusterProps {
    title: string;
    icon: ReactNode;
    children: ReactNode;
    defaultExpanded?: boolean;
    storageKey: string;
    headerClassName?: string;
    backgroundImage?: string; // Optional background image URL for collapsed state
    collapsedHeight?: 'small' | 'medium' | 'large'; // small = 50px, medium = 150px, large = 300px
    onExpandChange?: (expanded: boolean) => void; // Callback when expand state changes
    className?: string; // Additional class for wrapper (e.g., col-span-2)
    actions?: ReactNode; // Optional actions to render in the header
}

/**
 * FeatureCluster - A "Super Card" collapsible container for feature grouping
 * 
 * Features:
 * - Collapsed by default on page refresh (configurable)
 * - Pin system: pinned clusters stay expanded on refresh
 * - Custom header styling support
 */
export function FeatureCluster({
    title,
    icon,
    children,
    defaultExpanded = false,
    storageKey,
    headerClassName,
    backgroundImage,
    collapsedHeight = 'medium',
    onExpandChange,
    className,
    actions
}: FeatureClusterProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [isPinned, setIsPinned] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load initial state from localStorage
    useEffect(() => {
        // Namespace the key to avoid collisions
        const key = `pinned-cluster-${storageKey}`;
        const pinned = localStorage.getItem(key) === 'true';
        setIsPinned(pinned);

        // KEY BEHAVIOR: Only pinned clusters expand on refresh
        // Unpinned clusters ALWAYS collapse on refresh
        setIsExpanded(pinned);
        setIsLoaded(true);
    }, [storageKey]);

    // Toggle expand/collapse
    const toggleExpanded = () => {
        const newExpanded = !isExpanded;
        setIsExpanded(newExpanded);
        onExpandChange?.(newExpanded);
    };

    // Toggle pin state
    const togglePin = (e: React.MouseEvent) => {
        e.stopPropagation(); // Don't trigger expand/collapse
        const newPinned = !isPinned;
        setIsPinned(newPinned);

        const key = `pinned-cluster-${storageKey}`;
        if (newPinned) {
            localStorage.setItem(key, 'true');
            setIsExpanded(true); // Pinning auto-expands
            onExpandChange?.(true);
        } else {
            localStorage.removeItem(key);
        }
    };

    // Height based on prop: small = 50px, medium = 150px, large = 300px
    const heightClass = collapsedHeight === 'large'
        ? 'h-[300px]'
        : collapsedHeight === 'small'
            ? 'h-[50px]'
            : 'h-[150px]';

    // Prevent flash of wrong state or hydration mismatch
    if (!isLoaded) {
        return (
            <div className={cn("transition-all duration-300", className)}>
                <Card className="overflow-hidden shadow-lg border-2">
                    <div className={cn(
                        "w-full flex items-center justify-between py-10 px-8 border-b",
                        heightClass,
                        headerClassName || "bg-gradient-to-r from-muted/50 to-muted/30"
                    )}>
                        <div className="flex items-center gap-6">
                            <div className={cn(
                                "p-5 rounded-2xl shadow-lg opacity-50",
                                headerClassName ? "bg-white/20" : "bg-background/80"
                            )}>
                                {icon}
                            </div>
                            <span className={cn(
                                "font-bold text-3xl",
                                headerClassName ? "text-white" : "text-foreground"
                            )}>{title}</span>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className={cn("transition-all duration-300", className)}>
            <Card className="overflow-hidden shadow-lg border-2 transition-all duration-300 hover:shadow-xl">
                {/* Header with gradient/custom color - Dynamic height based on collapsedHeight prop */}
                <button
                    onClick={toggleExpanded}
                    className={cn(
                        "w-full flex items-center justify-between py-10 px-8 transition-all duration-200 cursor-pointer select-none relative overflow-hidden",
                        heightClass,
                        "border-b",
                        !headerClassName && "bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50",
                        headerClassName
                    )}
                >
                    {/* Optional Background Image Layer */}
                    {backgroundImage && (
                        <div
                            className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none"
                            style={{ backgroundImage: `url(${backgroundImage})` }}
                        />
                    )}

                    <div className="flex items-center gap-6 relative z-10">
                        <div className={cn(
                            "p-5 rounded-2xl shadow-lg transition-colors",
                            headerClassName ? "bg-white/20 text-white" : "bg-background/80 text-foreground"
                        )}>
                            {icon}
                        </div>
                        <span className={cn(
                            "font-bold text-3xl",
                            headerClassName ? "text-white" : "text-foreground"
                        )}>{title}</span>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        {/* Custom Actions */}
                        {actions && (
                            <div className="flex items-center gap-2 mr-2" onClick={(e) => e.stopPropagation()}>
                                {actions}
                            </div>
                        )}

                        {/* Pin Button */}
                        <div
                            onClick={togglePin}
                            className={cn(
                                "p-3 rounded-full transition-all duration-200",
                                isPinned
                                    ? (headerClassName ? "bg-white/30 text-white" : "bg-amber-500/20 text-amber-500")
                                    : (headerClassName ? "text-white/50 hover:text-white hover:bg-white/20" : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/50")
                            )}
                            title={isPinned ? "Unpin (will collapse on refresh)" : "Pin (stay expanded on refresh)"}
                        >
                            <Pin
                                className={cn(
                                    "h-6 w-6 transition-transform duration-200",
                                    isPinned ? "rotate-0" : "-rotate-45"
                                )}
                            />
                        </div>

                        {/* Expand/Collapse Chevron */}
                        <div className={cn(
                            "p-3 rounded-full transition-all duration-200",
                            headerClassName ? "bg-white/20" : "bg-muted/30"
                        )}>
                            <ChevronDown
                                className={cn(
                                    "h-6 w-6 transition-transform duration-300",
                                    isExpanded ? "rotate-180" : "rotate-0",
                                    headerClassName ? "text-white" : "text-muted-foreground"
                                )}
                            />
                        </div>
                    </div>
                </button>

                {/* Collapsible Content */}
                <div
                    className={cn(
                        "transition-all duration-300 ease-in-out overflow-hidden",
                        isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                    )}
                >
                    <CardContent className="p-4 pt-4 bg-card">
                        {children}
                    </CardContent>
                </div>
            </Card>
        </div>
    );
}

export default FeatureCluster;
