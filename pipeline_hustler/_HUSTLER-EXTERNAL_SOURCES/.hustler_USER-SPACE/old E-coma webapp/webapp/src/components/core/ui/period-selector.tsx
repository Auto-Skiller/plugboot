"use client";

import { useState } from "react";
import { ChevronDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type Period = "today" | "yesterday" | "7d" | "14d" | "30d" | "all" | "custom";

interface PeriodSelectorProps {
    value?: Period;
    onChange?: (period: Period) => void;
    className?: string;
}

const PERIODS: { value: Period; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "7d", label: "7 Days" },
    { value: "14d", label: "14 Days" },
    { value: "30d", label: "30 Days" },
    { value: "all", label: "All Time" },
];

export function PeriodSelector({ value = "today", onChange, className }: PeriodSelectorProps) {
    return (
        <div className={cn("flex items-center gap-1", className)}>
            {/* Standard buttons */}
            {PERIODS.map((period) => (
                <button
                    key={period.value}
                    onClick={() => onChange?.(period.value)}
                    className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                        value === period.value
                            ? "bg-secondary text-secondary-foreground" // Active: Dark pill
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50" // Inactive: Ghost
                    )}
                >
                    {period.label}
                </button>
            ))}

            {/* Custom Button */}
            <button
                onClick={() => onChange?.("custom")}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    value === "custom"
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
            >
                <Calendar className="h-4 w-4" />
                Custom
            </button>
        </div>
    );
}
