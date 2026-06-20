"use client";

import { Button } from "@/components/core/ui/button";
import { Download } from "lucide-react";

export function ExportCSVButton({ onClick }: { onClick: () => void }) {
    return (
        <Button
            variant="outline"
            onClick={onClick}
            className="bg-transparent px-4 py-2 h-11 text-slate-700 dark:text-slate-200 text-sm font-bold font-satoshi border-slate-200 dark:border-slate-700"
        >
            <Download className="mr-2 h-4 w-4" />
            Exporter CSV
        </Button>
    );
}
