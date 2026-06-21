"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/core/ui/badge";

interface ToolGridSectionProps {
    title: string;
    icon: LucideIcon;
    iconColor?: string;
    badge?: string;
    defaultOpen?: boolean;
    children: ReactNode;
}

/**
 * ToolGridSection - A section within the horizontal tool grid
 */
export function ToolGridSection({
    title,
    icon: Icon,
    iconColor = "text-primary",
    badge,
    children,
}: ToolGridSectionProps) {
    return (
        <div className="flex-1 min-w-0">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b">
                <div className={cn("p-1.5 rounded-md bg-muted/50")}>
                    <Icon className={cn("h-4 w-4", iconColor)} />
                </div>
                <span className="font-semibold text-sm whitespace-nowrap">{title}</span>
                {badge && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                        {badge}
                    </Badge>
                )}
            </div>
            {/* Section Tools */}
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}

interface ToolGridProps {
    children: ReactNode;
    className?: string;
}

/**
 * ToolGrid - Horizontal container displaying all tool sections in one row
 * 
 * Shows: Creation Tools | Algeria-Specific | Brand & Safety
 */
export function ToolGrid({ children, className }: ToolGridProps) {
    return (
        <div className={cn(
            "grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-xl bg-card",
            className
        )}>
            {children}
        </div>
    );
}
