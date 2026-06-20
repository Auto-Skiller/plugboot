"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    actions?: ReactNode;
    className?: string;
}

/**
 * PageHeader - Displays page title, description, icon, and actions
 * Note: Toggle button moved to TopNavigation (single location)
 * Note: Notification/Fullscreen moved to TopNavigation (always visible)
 */
export function PageHeader({ title, description, icon, actions, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6", className)}>
            <div className="flex items-center gap-4 overflow-hidden">
                <div className="flex flex-col justify-center min-w-0">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        {icon && <span className="text-muted-foreground">{icon}</span>}
                        {title}
                    </h1>
                    {description && (
                        <p className="text-muted-foreground text-sm truncate max-w-[600px]">{description}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 flex-1 justify-end min-w-0 md:self-center">
                {actions}
            </div>
        </div>
    );
}
