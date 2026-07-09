"use client";

import { useState } from "react";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Plus, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ActiveFilter {
    id: string;
    label: string;
    value: string;
}

interface FilterBarProps {
    onAddFilter?: () => void;
    filters?: ActiveFilter[];
    onRemoveFilter?: (id: string) => void;
    onClearAll?: () => void;
}

const DEFAULT_FILTERS: ActiveFilter[] = [];

export function FilterBar({
    onAddFilter,
    filters = DEFAULT_FILTERS,
    onRemoveFilter,
    onClearAll,
}: FilterBarProps) {
    const [localFilters, setLocalFilters] = useState<ActiveFilter[]>(filters);

    const handleRemove = (id: string) => {
        if (onRemoveFilter) {
            onRemoveFilter(id);
        } else {
            setLocalFilters(localFilters.filter((f) => f.id !== id));
        }
    };

    const handleClearAll = () => {
        if (onClearAll) {
            onClearAll();
        } else {
            setLocalFilters([]);
        }
    };

    const activeFilters = filters.length > 0 ? filters : localFilters;

    return (
        <div className="flex items-center gap-3 flex-wrap">
            <Button
                variant="outline"
                size="sm"
                className="gap-2 border-dashed border-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                onClick={onAddFilter}
            >
                <Plus className="h-4 w-4" />
                Ajouter un filtre
            </Button>

            <AnimatePresence>
                {activeFilters.map((filter) => (
                    <motion.div
                        key={filter.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <Badge
                            variant="secondary"
                            className="gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                        >
                            <Filter className="h-3 w-3" />
                            <span className="font-medium">{filter.label}:</span>
                            <span>{filter.value}</span>
                            <button
                                onClick={() => handleRemove(filter.id)}
                                className="ml-1 hover:bg-indigo-200 dark:hover:bg-indigo-700 rounded-full p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    </motion.div>
                ))}
            </AnimatePresence>

            {activeFilters.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                        onClick={handleClearAll}
                    >
                        Effacer tout
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
