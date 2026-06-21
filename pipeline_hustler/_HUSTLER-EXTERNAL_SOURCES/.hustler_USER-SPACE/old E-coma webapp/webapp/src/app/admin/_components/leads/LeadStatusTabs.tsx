"use client";

import { Button } from "@/components/core/ui/button";
import { cn } from "@/lib/utils";

export function LeadStatusTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const tabs = [
        { id: 'all', label: 'Tous' },
        { id: 'client', label: 'Client' },
        { id: 'loyal', label: 'Fidèle' },
    ];

    return (
        <div className="inline-flex bg-muted rounded-lg p-1">
            {tabs.map(tab => (
                <Button
                    key={tab.id}
                    variant="ghost"
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        "w-full h-[36px] gap-2",
                        "inline-flex items-center justify-center whitespace-nowrap rounded-md",
                        "px-3 py-[6px] ring-offset-background transition-all",
                        "text-sm font-semibold font-satoshi capitalize",
                        value === tab.id
                            ? "bg-background text-primary shadow"
                            : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    {tab.label}
                </Button>
            ))}
        </div>
    );
}
