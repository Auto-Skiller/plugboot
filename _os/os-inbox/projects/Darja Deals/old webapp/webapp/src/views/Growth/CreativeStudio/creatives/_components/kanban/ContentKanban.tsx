"use client";

import { useState, useCallback } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { ContentCard, ContentItem } from "./ContentCard";
import { Lightbulb, FileEdit, Clock, CheckCircle } from "lucide-react";
import { BatchActions } from "../BatchActions";

// Initial sample data (converted from QUEUE_ITEMS)
const INITIAL_ITEMS: ContentItem[] = [
    { id: "1", title: "New Product Launch", platform: "Instagram", status: "idea", date: "Just now" },
    { id: "2", title: "Summer Collection Preview", platform: "TikTok", status: "idea", date: "2h ago" },
    { id: "3", title: "Weekend Sale Promo", platform: "Facebook", status: "draft", date: "Saved 2h ago" },
    { id: "4", title: "Customer Testimonial", platform: "Instagram", status: "draft", date: "Saved yesterday" },
    { id: "5", title: "Product Announcement", platform: "Instagram", status: "scheduled", date: "Tomorrow 9:00 AM" },
    { id: "6", title: "Weekly Tips & Tricks", platform: "LinkedIn", status: "scheduled", date: "Mon 10:00 AM" },
    { id: "7", title: "Flash Sale Alert", platform: "Facebook", status: "published", date: "Today 8:00 AM" },
    { id: "8", title: "Unboxing Video", platform: "TikTok", status: "published", date: "Yesterday" },
];

const COLUMNS = [
    { id: "idea", title: "Ideas", icon: Lightbulb, iconColor: "text-yellow-500", showAddButton: true },
    { id: "draft", title: "Drafts", icon: FileEdit, iconColor: "text-orange-500", showAddButton: false },
    { id: "scheduled", title: "Scheduled", icon: Clock, iconColor: "text-blue-500", showAddButton: false },
    { id: "published", title: "Published", icon: CheckCircle, iconColor: "text-green-500", showAddButton: false },
];

interface ContentKanbanProps {
    onSelectionChange?: (selectedIds: string[]) => void;
}

/**
 * ContentKanban - Main Kanban board for content management
 * 
 * Features:
 * - 4 columns: Ideas, Drafts, Scheduled, Published
 * - Drag-and-drop between columns
 * - Multi-select with batch actions
 * - Visual feedback during drag
 */
export function ContentKanban({ onSelectionChange }: ContentKanbanProps) {
    const [items, setItems] = useState<ContentItem[]>(INITIAL_ITEMS);
    const [activeItem, setActiveItem] = useState<ContentItem | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const item = items.find((i) => i.id === active.id);
        setActiveItem(item || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveItem(null);

        if (!over) return;

        const activeItem = items.find((i) => i.id === active.id);
        if (!activeItem) return;

        // Check if dropped on a column
        const newStatus = COLUMNS.find((col) => col.id === over.id)?.id as ContentItem["status"] | undefined;

        if (newStatus && newStatus !== activeItem.status) {
            // Update item status when dropped on a different column
            setItems((prev) =>
                prev.map((item) =>
                    item.id === active.id
                        ? { ...item, status: newStatus }
                        : item
                )
            );
        } else if (active.id !== over.id) {
            // Reorder within same column
            setItems((prev) => {
                const oldIndex = prev.findIndex((i) => i.id === active.id);
                const newIndex = prev.findIndex((i) => i.id === over.id);
                return arrayMove(prev, oldIndex, newIndex);
            });
        }
    };

    const handleAddIdea = () => {
        const newItem: ContentItem = {
            id: Date.now().toString(),
            title: "New Content Idea",
            platform: "Instagram",
            status: "idea",
            date: "Just now",
        };
        setItems((prev) => [newItem, ...prev]);
    };

    // Selection handlers
    const toggleSelection = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            onSelectionChange?.(Array.from(next));
            return next;
        });
    }, [onSelectionChange]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
        onSelectionChange?.([]);
    }, [onSelectionChange]);

    // Batch action handlers
    const handleBulkDelete = useCallback(() => {
        setItems(prev => prev.filter(item => !selectedIds.has(item.id)));
        clearSelection();
    }, [selectedIds, clearSelection]);

    const handleBulkSchedule = useCallback(() => {
        setItems(prev => prev.map(item =>
            selectedIds.has(item.id) ? { ...item, status: "scheduled" as const } : item
        ));
        clearSelection();
    }, [selectedIds, clearSelection]);

    const handleBulkDuplicate = useCallback(() => {
        const duplicates = items
            .filter(item => selectedIds.has(item.id))
            .map(item => ({ ...item, id: `${item.id}-copy-${Date.now()}`, title: `${item.title} (Copy)` }));
        setItems(prev => [...duplicates, ...prev]);
        clearSelection();
    }, [items, selectedIds, clearSelection]);

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {COLUMNS.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            icon={column.icon}
                            iconColor={column.iconColor}
                            items={items.filter((item) => item.status === column.id)}
                            showAddButton={column.showAddButton}
                            onAddItem={column.id === "idea" ? handleAddIdea : undefined}
                            selectedIds={selectedIds}
                            onToggleSelection={toggleSelection}
                        />
                    ))}
                </div>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeItem ? (
                        <ContentCard item={activeItem} isDragging />
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Batch Actions Bar */}
            <BatchActions
                selectedCount={selectedIds.size}
                onClearSelection={clearSelection}
                onBulkDelete={handleBulkDelete}
                onBulkSchedule={handleBulkSchedule}
                onBulkDuplicate={handleBulkDuplicate}
                onBulkExport={() => console.log("Export", Array.from(selectedIds))}
            />
        </>
    );
}
