"use client";

import { Button } from "@/components/core/ui/button";
import { cn } from "@/lib/utils";

export interface DatePresetsProps {
    value: string;
    onChange: (v: string) => void;
}

export function DatePresetsFR({ value, onChange }: DatePresetsProps) {
    const presets = [
        { id: 'today', label: "Aujourd'hui" },
        { id: 'yesterday', label: 'Hier' },
        { id: 'last7', label: '7 Derniers Jours' },
        { id: 'last30', label: '30 Derniers Jours' },
        { id: 'alltime', label: 'Tout Le Temps' },
    ];

    return (
        <div className="inline-flex bg-muted rounded-lg p-1 overflow-x-auto max-w-full">
            {presets.map(preset => (
                <Button
                    key={preset.id}
                    variant="ghost"
                    onClick={() => onChange(preset.id)}
                    className={cn(
                        "h-[36px] gap-2",
                        "inline-flex items-center justify-center whitespace-nowrap rounded-md",
                        "px-3 py-[6px] ring-offset-background transition-all",
                        "text-sm font-semibold font-satoshi capitalize",
                        value === preset.id
                            ? "bg-background text-primary shadow"
                            : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    {preset.label}
                </Button>
            ))}
        </div>
    );
}
