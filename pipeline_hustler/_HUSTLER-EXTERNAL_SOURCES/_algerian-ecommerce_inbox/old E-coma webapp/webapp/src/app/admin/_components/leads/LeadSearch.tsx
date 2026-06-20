"use client";

import { Input } from "@/components/core/ui/input";
import { Search } from "lucide-react";

export function LeadSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Rechercher nom, numéro ou email"
                className="pl-9 h-11 bg-white dark:bg-slate-950"
            />
        </div>
    );
}
