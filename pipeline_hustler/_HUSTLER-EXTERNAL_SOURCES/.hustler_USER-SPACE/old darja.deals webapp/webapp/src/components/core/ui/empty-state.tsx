"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/ui/button";
import { LucideIcon, FileQuestion, FolderOpen, Inbox, Search, Plus } from "lucide-react";

interface EmptyStateAction {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
    variant?: "default" | "outline" | "secondary" | "ghost";
}

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    actions?: EmptyStateAction[];
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    actions,
    className,
    size = "md",
}: EmptyStateProps) {
    const sizeClasses = {
        sm: {
            container: "py-8 px-4",
            icon: "h-10 w-10",
            iconWrapper: "h-16 w-16",
            title: "text-base",
            description: "text-sm",
        },
        md: {
            container: "py-12 px-6",
            icon: "h-12 w-12",
            iconWrapper: "h-20 w-20",
            title: "text-lg",
            description: "text-sm",
        },
        lg: {
            container: "py-16 px-8",
            icon: "h-16 w-16",
            iconWrapper: "h-24 w-24",
            title: "text-xl",
            description: "text-base",
        },
    };

    const sizes = sizeClasses[size];

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center",
                sizes.container,
                className
            )}
        >
            {/* Icon */}
            <div
                className={cn(
                    "flex items-center justify-center rounded-full bg-muted mb-4",
                    sizes.iconWrapper
                )}
            >
                <Icon className={cn("text-muted-foreground", sizes.icon)} />
            </div>

            {/* Title */}
            <h3 className={cn("font-semibold text-foreground mb-1", sizes.title)}>
                {title}
            </h3>

            {/* Description */}
            {description && (
                <p
                    className={cn(
                        "text-muted-foreground max-w-md mb-6",
                        sizes.description
                    )}
                >
                    {description}
                </p>
            )}

            {/* Actions */}
            {actions && actions.length > 0 && (
                <div className="flex items-center gap-3 flex-wrap justify-center">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            variant={action.variant || (index === 0 ? "default" : "outline")}
                            onClick={action.onClick}
                            asChild={!!action.href}
                            className="gap-2"
                        >
                            {action.href ? (
                                <a href={action.href}>
                                    {action.icon}
                                    {action.label}
                                </a>
                            ) : (
                                <>
                                    {action.icon}
                                    {action.label}
                                </>
                            )}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Pre-configured empty states for common scenarios
export function NoResultsEmptyState({
    searchQuery,
    onClear,
}: {
    searchQuery?: string;
    onClear?: () => void;
}) {
    return (
        <EmptyState
            icon={Search}
            title="No results found"
            description={
                searchQuery
                    ? `No results found for "${searchQuery}". Try adjusting your search or filters.`
                    : "No results match your current filters."
            }
            actions={onClear ? [{ label: "Clear filters", onClick: onClear, variant: "outline" }] : undefined}
        />
    );
}

export function NoDataEmptyState({
    resourceName,
    onAdd,
    addLabel,
}: {
    resourceName: string;
    onAdd?: () => void;
    addLabel?: string;
}) {
    return (
        <EmptyState
            icon={FolderOpen}
            title={`No ${resourceName} yet`}
            description={`Get started by creating your first ${resourceName.toLowerCase()}.`}
            actions={
                onAdd
                    ? [
                        {
                            label: addLabel || `Create ${resourceName}`,
                            onClick: onAdd,
                            icon: <Plus className="h-4 w-4" />,
                        },
                    ]
                    : undefined
            }
        />
    );
}

export function ErrorEmptyState({
    message,
    onRetry,
}: {
    message?: string;
    onRetry?: () => void;
}) {
    return (
        <EmptyState
            icon={FileQuestion}
            title="Something went wrong"
            description={message || "We couldn't load this content. Please try again."}
            actions={
                onRetry ? [{ label: "Try again", onClick: onRetry, variant: "outline" }] : undefined
            }
        />
    );
}
