"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/ui/button";
import { LucideIcon, FileText, Plus } from "lucide-react";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    illustration?: ReactNode;
    primaryAction?: {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

/**
 * EmptyState - Display when a section has no content
 */
export function EmptyState({
    icon: Icon = FileText,
    title,
    description,
    illustration,
    primaryAction,
    secondaryAction,
    className,
}: EmptyStateProps) {
    const PrimaryIcon = primaryAction?.icon || Plus;

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-12 px-6 text-center",
                className
            )}
            role="status"
            aria-label={title}
        >
            {illustration ? (
                illustration
            ) : (
                <div className="p-4 bg-muted rounded-full mb-4">
                    <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                </div>
            )}

            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>

            <div className="flex flex-col sm:flex-row gap-2">
                {primaryAction && (
                    <Button onClick={primaryAction.onClick} className="gap-2">
                        <PrimaryIcon className="h-4 w-4" aria-hidden="true" />
                        {primaryAction.label}
                    </Button>
                )}
                {secondaryAction && (
                    <Button variant="outline" onClick={secondaryAction.onClick}>
                        {secondaryAction.label}
                    </Button>
                )}
            </div>
        </div>
    );
}
