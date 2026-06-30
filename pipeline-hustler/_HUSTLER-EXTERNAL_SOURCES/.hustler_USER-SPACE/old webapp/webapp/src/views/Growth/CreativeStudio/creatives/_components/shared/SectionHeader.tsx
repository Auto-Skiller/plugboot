"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/core/ui/badge";

interface SectionHeaderProps {
    title: string;
    icon?: LucideIcon;
    iconColor?: string;
    badge?: string;
    badgeVariant?: "default" | "secondary" | "destructive" | "outline";
    actions?: ReactNode;
    className?: string;
}

/**
 * SectionHeader - Consistent section header with icon, title, optional badge and actions
 */
export function SectionHeader({
    title,
    icon: Icon,
    iconColor = "text-primary",
    badge,
    badgeVariant = "secondary",
    actions,
    className,
}: SectionHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between border-b pb-2", className)}>
            <div className="flex items-center gap-2">
                {Icon && <Icon className={cn("h-5 w-5", iconColor)} />}
                <h2 className="text-xl font-bold">{title}</h2>
                {badge && (
                    <Badge variant={badgeVariant} className="text-[10px] h-5">
                        {badge}
                    </Badge>
                )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}
