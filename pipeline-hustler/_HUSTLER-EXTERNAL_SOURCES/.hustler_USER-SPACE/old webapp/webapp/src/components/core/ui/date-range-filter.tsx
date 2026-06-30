"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/ui/button";
import { Calendar, ChevronDown } from "lucide-react";

export type DatePreset = "today" | "yesterday" | "7days" | "14days" | "30days" | "alltime" | "custom";

interface DateRangeFilterProps {
    value?: DatePreset;
    onChange?: (preset: DatePreset) => void;
    className?: string;
    showCustom?: boolean;
}

const presets: { value: DatePreset; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "7days", label: "7 Days" },
    { value: "14days", label: "14 Days" },
    { value: "30days", label: "30 Days" },
    { value: "alltime", label: "All Time" },
];

export function DateRangeFilter({
    value = "7days",
    onChange,
    className,
    showCustom = true,
}: DateRangeFilterProps) {
    const [selected, setSelected] = React.useState<DatePreset>(value);

    const handleSelect = (preset: DatePreset) => {
        setSelected(preset);
        onChange?.(preset);
    };

    return (
        <div className={cn("flex flex-wrap items-center gap-1", className)}>
            {presets.map((preset) => (
                <Button
                    key={preset.value}
                    variant={selected === preset.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelect(preset.value)}
                    className={cn(
                        "h-8 px-3 text-xs font-medium transition-all",
                        selected === preset.value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-background hover:bg-muted"
                    )}
                >
                    {preset.label}
                </Button>
            ))}

            {showCustom && (
                <Button
                    variant={selected === "custom" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelect("custom")}
                    className={cn(
                        "h-8 px-3 text-xs font-medium gap-1.5 transition-all",
                        selected === "custom"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-background hover:bg-muted"
                    )}
                >
                    <Calendar className="h-3.5 w-3.5" />
                    Custom
                    <ChevronDown className="h-3 w-3" />
                </Button>
            )}
        </div>
    );
}
