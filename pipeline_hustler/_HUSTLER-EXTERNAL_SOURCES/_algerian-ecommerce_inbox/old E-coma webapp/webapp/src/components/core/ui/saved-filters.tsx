"use client";

import * as React from "react";
import { Button } from "@/components/core/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from "@/components/core/ui/dropdown-menu";
import { Input } from "@/components/core/ui/input";
import { Bookmark, Plus, Trash2, Save } from "lucide-react";
import { FilterState } from "@/components/core/ui/advanced-filters";

interface SavedFiltersProps {
    currentFilters: FilterState;
    onLoadFilter: (filters: FilterState) => void;
}

interface SavedPreset {
    id: string;
    name: string;
    filters: FilterState;
}

export function SavedFilters({ currentFilters, onLoadFilter }: SavedFiltersProps) {
    const [presets, setPresets] = React.useState<SavedPreset[]>([]);
    const [newPresetName, setNewPresetName] = React.useState("");
    const [isSaving, setIsSaving] = React.useState(false);

    // Load presets from localStorage on mount
    React.useEffect(() => {
        const saved = localStorage.getItem("riglify_order_filters");
        if (saved) {
            try {
                setPresets(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved filters", e);
            }
        }
    }, []);

    // Save presets to localStorage whenever they change
    React.useEffect(() => {
        localStorage.setItem("riglify_order_filters", JSON.stringify(presets));
    }, [presets]);

    const handleSave = () => {
        if (!newPresetName.trim()) return;

        const newPreset: SavedPreset = {
            id: crypto.randomUUID(),
            name: newPresetName,
            filters: currentFilters,
        };

        setPresets([...presets, newPreset]);
        setNewPresetName("");
        setIsSaving(false);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setPresets(presets.filter(p => p.id !== id));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9">
                    <Bookmark className="h-4 w-4" />
                    <span className="hidden sm:inline">Saved Filters</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel>Saved Presets</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {presets.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                        No saved filters yet.
                    </div>
                ) : (
                    <DropdownMenuGroup className="max-h-[200px] overflow-y-auto">
                        {presets.map((preset) => (
                            <DropdownMenuItem
                                key={preset.id}
                                onClick={() => onLoadFilter(preset.filters)}
                                className="flex items-center justify-between group"
                            >
                                <span>{preset.name}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 opacity-0 group-hover:opacity-100 hover:text-red-600"
                                    onClick={(e) => handleDelete(preset.id, e)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                )}

                <DropdownMenuSeparator />

                <div className="p-2">
                    {isSaving ? (
                        <div className="flex items-center gap-2">
                            <Input
                                value={newPresetName}
                                onChange={(e) => setNewPresetName(e.target.value)}
                                placeholder="Preset name..."
                                className="h-8 text-xs"
                                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                                autoFocus
                            />
                            <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleSave}>
                                <Save className="h-3 w-3" />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 text-xs h-8"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsSaving(true);
                            }}
                        >
                            <Plus className="h-3 w-3" />
                            Save Current Filters
                        </Button>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
