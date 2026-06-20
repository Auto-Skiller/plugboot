"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";

export type OrderStatus = "all" | "pending" | "confirmed" | "cancelled" | "callback" | "shipped" | "delivered" | "returned";

interface StatusConfig {
    id: OrderStatus;
    label: string;
    labelFr: string;
    color: string;
    bgColor: string;
}

const STATUS_CONFIG: StatusConfig[] = [
    { id: "all", label: "All", labelFr: "Tous", color: "text-foreground", bgColor: "bg-muted" },
    { id: "pending", label: "Pending", labelFr: "En attente", color: "text-yellow-700", bgColor: "bg-yellow-50" },
    { id: "confirmed", label: "Confirmed", labelFr: "Confirmé", color: "text-green-700", bgColor: "bg-green-50" },
    { id: "cancelled", label: "Cancelled", labelFr: "Annulé", color: "text-red-700", bgColor: "bg-red-50" },
    { id: "callback", label: "Callback", labelFr: "Rappel", color: "text-blue-700", bgColor: "bg-blue-50" },
    { id: "shipped", label: "Shipped", labelFr: "Expédié", color: "text-indigo-700", bgColor: "bg-indigo-50" },
    { id: "delivered", label: "Delivered", labelFr: "Livré", color: "text-purple-700", bgColor: "bg-purple-50" },
    { id: "returned", label: "Returned", labelFr: "Retourné", color: "text-orange-700", bgColor: "bg-orange-50" },
];

interface OrderStatusFilterProps {
    value: OrderStatus;
    onChange: (status: OrderStatus) => void;
    counts?: Partial<Record<OrderStatus, number>>;
    showCounts?: boolean;
    useFrench?: boolean;
    className?: string;
    visibleStatuses?: OrderStatus[];
}

export function OrderStatusFilter({
    value,
    onChange,
    counts = {},
    showCounts = true,
    useFrench = true,
    className,
    visibleStatuses = ["all", "pending", "confirmed", "cancelled", "callback"],
}: OrderStatusFilterProps) {
    const filteredStatuses = STATUS_CONFIG.filter(s => visibleStatuses.includes(s.id));

    return (
        <div className={cn("flex items-center gap-1 bg-muted/50 rounded-lg p-1 border", className)}>
            {filteredStatuses.map((status) => {
                const isActive = value === status.id;
                const count = counts[status.id];

                return (
                    <Button
                        key={status.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => onChange(status.id)}
                        className={cn(
                            "text-sm font-medium rounded-md shadow-none border-none h-9 px-3 transition-all",
                            isActive
                                ? "bg-background text-foreground shadow-sm hover:bg-background"
                                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                        )}
                    >
                        <span className={cn(
                            "transition-colors",
                            isActive && status.id !== "all" && status.color
                        )}>
                            {useFrench ? status.labelFr : status.label}
                        </span>
                        {showCounts && count !== undefined && count > 0 && (
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "ml-1.5 text-xs h-5 min-w-5 justify-center",
                                    isActive && status.id !== "all" && status.bgColor,
                                    isActive && status.id !== "all" && status.color
                                )}
                            >
                                {count}
                            </Badge>
                        )}
                    </Button>
                );
            })}
        </div>
    );
}

// ============================================================================
// ORDER STATUS BADGE (Enhanced version with Ayor colors)
// ============================================================================

interface OrderStatusBadgeProps {
    status: Exclude<OrderStatus, "all">;
    size?: "sm" | "md" | "lg";
    showDot?: boolean;
    className?: string;
}

const STATUS_BADGE_STYLES: Record<Exclude<OrderStatus, "all">, { bg: string; text: string; dot: string; label: string }> = {
    pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-800 dark:text-yellow-400",
        dot: "bg-yellow-500",
        label: "En attente"
    },
    confirmed: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-400",
        dot: "bg-green-500",
        label: "Confirmé"
    },
    cancelled: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-400",
        dot: "bg-red-500",
        label: "Annulé"
    },
    callback: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-400",
        dot: "bg-blue-500",
        label: "Rappel"
    },
    shipped: {
        bg: "bg-indigo-100 dark:bg-indigo-900/30",
        text: "text-indigo-800 dark:text-indigo-400",
        dot: "bg-indigo-500",
        label: "Expédié"
    },
    delivered: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-800 dark:text-purple-400",
        dot: "bg-purple-500",
        label: "Livré"
    },
    returned: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-800 dark:text-orange-400",
        dot: "bg-orange-500",
        label: "Retourné"
    },
};

export function OrderStatusBadge({
    status,
    size = "md",
    showDot = true,
    className
}: OrderStatusBadgeProps) {
    const style = STATUS_BADGE_STYLES[status];

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 font-medium rounded-full",
                size === "sm" && "px-2 py-0.5 text-xs",
                size === "md" && "px-2.5 py-1 text-xs",
                size === "lg" && "px-3 py-1.5 text-sm",
                style.bg,
                style.text,
                className
            )}
        >
            {showDot && (
                <span
                    className={cn(
                        "rounded-full",
                        size === "sm" && "h-1.5 w-1.5",
                        size === "md" && "h-2 w-2",
                        size === "lg" && "h-2.5 w-2.5",
                        style.dot
                    )}
                />
            )}
            {style.label}
        </span>
    );
}

export { STATUS_CONFIG, STATUS_BADGE_STYLES };
