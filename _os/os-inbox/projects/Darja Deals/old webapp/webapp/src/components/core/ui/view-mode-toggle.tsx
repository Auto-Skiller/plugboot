"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ViewModeToggleProps {
    value: "count" | "rate";
    onChange: (value: "count" | "rate") => void;
    className?: string;
}

export function ViewModeToggle({ value, onChange, className }: ViewModeToggleProps) {
    return (
        <div className={cn("flex items-center bg-muted/50 p-0.5 rounded-lg", className)}>
            <button
                onClick={() => onChange("count")}
                className={cn(
                    "px-2 py-1 text-[11px] font-medium rounded-md transition-all",
                    value === "count"
                        ? "bg-white dark:bg-slate-800 shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                Nombre
            </button>
            <button
                onClick={() => onChange("rate")}
                className={cn(
                    "px-2 py-1 text-[11px] font-medium rounded-md transition-all",
                    value === "rate"
                        ? "bg-white dark:bg-slate-800 shadow-sm text-primary"
                        : "text-muted-foreground hover:text-foreground"
                )}
            >
                Taux (%)
            </button>
        </div>
    );
}
