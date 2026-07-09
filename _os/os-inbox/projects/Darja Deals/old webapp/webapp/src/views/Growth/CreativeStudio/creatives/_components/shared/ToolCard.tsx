"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { LucideIcon } from "lucide-react";

/**
 * Semantic color categories for tools
 */
export const TOOL_COLORS = {
    creation: "border-l-blue-500",      // Hook Generator, Content Generator, Media Editor
    analysis: "border-l-yellow-500",    // Hook Analyzer, Quality Optimizer
    algeria: "border-l-green-500",      // Darja, TikTok Monetization
    brand: "border-l-purple-500",       // Brand Voice
    safety: "border-l-red-500",         // Content Safety Checker
};

export type ToolColorCategory = keyof typeof TOOL_COLORS;

interface ToolCardProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    colorCategory?: ToolColorCategory;
    children?: ReactNode;
    className?: string;
    isActive?: boolean;
    onClick?: () => void;
}

/**
 * ToolCard - A wrapper component for tool cards with elevation and color-coding
 * 
 * Features:
 * - Semantic border-left color based on tool category
 * - Hover elevation animation
 * - Active state ring indicator
 */
export function ToolCard({
    title,
    description,
    icon: Icon,
    colorCategory = "creation",
    children,
    className,
    isActive = false,
    onClick,
}: ToolCardProps) {
    return (
        <Card
            className={cn(
                // Base styles
                "border-l-4 transition-all duration-300 cursor-pointer",
                // Color category
                TOOL_COLORS[colorCategory],
                // Hover effects
                "hover:-translate-y-1 hover:shadow-lg",
                // Active state
                isActive && "ring-2 ring-primary shadow-xl",
                className
            )}
            onClick={onClick}
        >
            {(title || Icon) && (
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        {Icon && (
                            <div className={cn(
                                "p-2 rounded-lg",
                                colorCategory === "creation" && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                                colorCategory === "analysis" && "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
                                colorCategory === "algeria" && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                                colorCategory === "brand" && "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
                                colorCategory === "safety" && "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                            )}>
                                <Icon className="h-4 w-4" />
                            </div>
                        )}
                        <CardTitle className="text-base">{title}</CardTitle>
                    </div>
                    {description && (
                        <CardDescription className="text-xs mt-1">{description}</CardDescription>
                    )}
                </CardHeader>
            )}
            {children && (
                <CardContent className={!title && !Icon ? "pt-4" : ""}>
                    {children}
                </CardContent>
            )}
        </Card>
    );
}
