"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/ui/button";
import { Calendar, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/core/ui/dropdown-menu";

export type DatePreset = "today" | "yesterday" | "last7" | "last14" | "last30" | "custom";

interface DatePresetConfig {
    id: DatePreset;
    label: string;
    labelFr: string;
    getRange: () => { from: Date; to: Date };
}

const DATE_PRESETS: DatePresetConfig[] = [
    {
        id: "today",
        label: "Today",
        labelFr: "Aujourd'hui",
        getRange: () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            return { from: today, to: end };
        },
    },
    {
        id: "yesterday",
        label: "Yesterday",
        labelFr: "Hier",
        getRange: () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setDate(end.getDate() - 1);
            end.setHours(23, 59, 59, 999);
            return { from: yesterday, to: end };
        },
    },
    {
        id: "last7",
        label: "Last 7 Days",
        labelFr: "7 derniers jours",
        getRange: () => {
            const from = new Date();
            from.setDate(from.getDate() - 7);
            from.setHours(0, 0, 0, 0);
            const to = new Date();
            to.setHours(23, 59, 59, 999);
            return { from, to };
        },
    },
    {
        id: "last14",
        label: "Last 14 Days",
        labelFr: "14 derniers jours",
        getRange: () => {
            const from = new Date();
            from.setDate(from.getDate() - 14);
            from.setHours(0, 0, 0, 0);
            const to = new Date();
            to.setHours(23, 59, 59, 999);
            return { from, to };
        },
    },
    {
        id: "last30",
        label: "Last 30 Days",
        labelFr: "30 derniers jours",
        getRange: () => {
            const from = new Date();
            from.setDate(from.getDate() - 30);
            from.setHours(0, 0, 0, 0);
            const to = new Date();
            to.setHours(23, 59, 59, 999);
            return { from, to };
        },
    },
];

interface DatePresetsToolbarProps {
    value: DatePreset;
    dateRange: { from: Date; to: Date };
    onChange: (preset: DatePreset, range: { from: Date; to: Date }) => void;
    onCustomRangeClick?: () => void;
    useFrench?: boolean;
    showQuickButtons?: boolean;
    className?: string;
}

export function DatePresetsToolbar({
    value,
    dateRange,
    onChange,
    onCustomRangeClick,
    useFrench = true,
    showQuickButtons = true,
    className,
}: DatePresetsToolbarProps) {
    const formatDate = (date: Date) => {
        return date.toLocaleDateString(useFrench ? "fr-FR" : "en-US", {
            month: "short",
            day: "numeric",
        });
    };

    const handlePresetClick = (preset: DatePresetConfig) => {
        onChange(preset.id, preset.getRange());
    };

    const currentPreset = DATE_PRESETS.find(p => p.id === value);
    const displayLabel = value === "custom"
        ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
        : currentPreset
            ? (useFrench ? currentPreset.labelFr : currentPreset.label)
            : "";

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* Quick Preset Buttons */}
            {showQuickButtons && (
                <div className="hidden md:flex items-center gap-1">
                    {DATE_PRESETS.slice(0, 3).map((preset) => (
                        <Button
                            key={preset.id}
                            variant={value === preset.id ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => handlePresetClick(preset)}
                            className="text-xs h-8 px-2"
                        >
                            {useFrench ? preset.labelFr : preset.label}
                        </Button>
                    ))}
                </div>
            )}

            {/* Presets Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 h-8 text-xs w-full sm:w-auto min-w-[140px] justify-between"
                    >
                        <span>{useFrench ? "Préréglages" : "Presets"}</span>
                        <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                    {DATE_PRESETS.map((preset) => (
                        <DropdownMenuItem
                            key={preset.id}
                            onClick={() => handlePresetClick(preset)}
                            className={cn(
                                "cursor-pointer",
                                value === preset.id && "bg-primary/10 text-primary"
                            )}
                        >
                            {useFrench ? preset.labelFr : preset.label}
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={onCustomRangeClick}
                        className="cursor-pointer"
                    >
                        {useFrench ? "Période personnalisée..." : "Custom range..."}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Date Range Display */}
            <Button
                variant="outline"
                size="sm"
                className={cn(
                    "gap-2 h-8 text-xs",
                    value !== "custom" && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                    "w-full sm:w-[180px]"
                )}
                onClick={onCustomRangeClick}
            >
                <Calendar className="h-3 w-3" />
                {displayLabel}
            </Button>
        </div>
    );
}

// ============================================================================
// ORDERS SEARCH INPUT (Enhanced with Confirmatic placeholder)
// ============================================================================

import { Search, X } from "lucide-react";
import { Input } from "@/components/core/ui/input";

interface OrdersSearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    useFrench?: boolean;
    className?: string;
}

export function OrdersSearchInput({
    value,
    onChange,
    placeholder,
    useFrench = true,
    className,
}: OrdersSearchInputProps) {
    const defaultPlaceholder = useFrench
        ? "Rechercher par nom, téléphone ou wilaya"
        : "Search by name, phone or wilaya";

    return (
        <div className={cn("relative flex-1 max-w-md", className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || defaultPlaceholder}
                className="pl-9 pr-9 h-9"
            />
            {value && (
                <button
                    onClick={() => onChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded"
                >
                    <X className="h-3 w-3 text-muted-foreground" />
                </button>
            )}
        </div>
    );
}

export { DATE_PRESETS };
