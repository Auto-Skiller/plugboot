"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/core/ui/button";
import {
    Trash2,
    Calendar,
    Download,
    Copy,
    X,
    CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BatchActionsProps {
    selectedCount: number;
    onClearSelection: () => void;
    onBulkDelete?: () => void;
    onBulkSchedule?: () => void;
    onBulkExport?: () => void;
    onBulkDuplicate?: () => void;
}

/**
 * BatchActions - Floating action bar for bulk operations on selected items
 */
export function BatchActions({
    selectedCount,
    onClearSelection,
    onBulkDelete,
    onBulkSchedule,
    onBulkExport,
    onBulkDuplicate,
}: BatchActionsProps) {
    if (selectedCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
            >
                <div className="flex items-center gap-2 px-4 py-3 bg-background border rounded-xl shadow-2xl">
                    {/* Selection count */}
                    <div className="flex items-center gap-2 pr-3 border-r">
                        <CheckSquare className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                            {selectedCount} selected
                        </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBulkSchedule}
                            className="gap-1.5"
                            aria-label={`Schedule ${selectedCount} items`}
                        >
                            <Calendar className="h-4 w-4" />
                            <span className="hidden sm:inline">Schedule</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBulkDuplicate}
                            className="gap-1.5"
                            aria-label={`Duplicate ${selectedCount} items`}
                        >
                            <Copy className="h-4 w-4" />
                            <span className="hidden sm:inline">Duplicate</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBulkExport}
                            className="gap-1.5"
                            aria-label={`Export ${selectedCount} items`}
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Export</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBulkDelete}
                            className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            aria-label={`Delete ${selectedCount} items`}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Delete</span>
                        </Button>
                    </div>

                    {/* Clear selection */}
                    <div className="pl-2 border-l">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClearSelection}
                            className="h-8 w-8"
                            aria-label="Clear selection"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
