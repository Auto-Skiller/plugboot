"use client";

import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ContentCard, ContentItem } from "./ContentCard";
import { Button } from "@/components/core/ui/button";
import { Checkbox } from "@/components/core/ui/checkbox";
import { Plus, LucideIcon } from "lucide-react";

interface KanbanColumnProps {
    id: string;
    title: string;
    icon: LucideIcon;
    iconColor: string;
    items: ContentItem[];
    onAddItem?: () => void;
    showAddButton?: boolean;
    selectedIds?: Set<string>;
    onToggleSelection?: (id: string) => void;
}

/**
 * KanbanColumn - Droppable column for content items with selection support
 */
export function KanbanColumn({
    id,
    title,
    icon: Icon,
    iconColor,
    items,
    onAddItem,
    showAddButton = false,
    selectedIds = new Set(),
    onToggleSelection,
}: KanbanColumnProps) {
    const { isOver, setNodeRef } = useDroppable({ id });

    // Select all items in this column
    const allSelected = items.length > 0 && items.every(item => selectedIds.has(item.id));
    const someSelected = items.some(item => selectedIds.has(item.id));

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col min-h-[200px] bg-muted/30 rounded-xl p-3 transition-colors",
                isOver && "bg-primary/10 ring-2 ring-primary/30"
            )}
            role="group"
            aria-label={`${title} column with ${items.length} items`}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-md bg-background", iconColor.replace("text-", "bg-").replace("500", "100"))}>
                        <Icon className={cn("h-4 w-4", iconColor)} aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-sm">{title}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                        {items.length}
                    </span>
                </div>
            </div>

            {/* Items */}
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 space-y-2">
                    {items.map((item) => (
                        <ContentCard
                            key={item.id}
                            item={item}
                            isSelected={selectedIds.has(item.id)}
                            onToggleSelection={onToggleSelection}
                        />
                    ))}
                </div>
            </SortableContext>

            {/* Add Button */}
            {showAddButton && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-muted-foreground hover:text-foreground border-dashed border"
                    onClick={onAddItem}
                    aria-label={`Add new ${title.slice(0, -1).toLowerCase()}`}
                >
                    <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                    Add {title.slice(0, -1)}
                </Button>
            )}
        </div>
    );
}
