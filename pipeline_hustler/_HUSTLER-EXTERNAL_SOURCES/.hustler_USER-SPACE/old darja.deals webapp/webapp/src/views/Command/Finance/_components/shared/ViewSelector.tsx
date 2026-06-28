"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import { cn } from "@/lib/utils";

export function ViewSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger
                className={cn(
                    "whitespace-nowrap py-2 shadow-sm",
                    "px-3 w-40 h-9 bg-white dark:bg-slate-950 rounded-md border border-slate-200 dark:border-slate-800",
                    "justify-between items-center inline-flex",
                    "text-slate-500 dark:text-slate-400 text-sm font-normal capitalize"
                )}
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="overview">Vue D&apos;ensemble</SelectItem>
                <SelectItem value="by-product">Par Produit</SelectItem>
                <SelectItem value="by-channel">Par Canal</SelectItem>
                <SelectItem value="by-region">Par Région</SelectItem>
            </SelectContent>
        </Select>
    );
}
