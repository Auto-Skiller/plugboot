"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/core/ui/card";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import { Checkbox } from "@/components/core/ui/checkbox";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Clock,
    CheckCircle,
    FileText,
    Send,
    GripVertical,
    MoreHorizontal,
    Lightbulb
} from "lucide-react";

export interface ContentItem {
    id: string;
    title: string;
    platform: string;
    status: "idea" | "draft" | "scheduled" | "published";
    date: string;
}

interface ContentCardProps {
    item: ContentItem;
    isDragging?: boolean;
    isSelected?: boolean;
    onToggleSelection?: (id: string) => void;
}

/**
 * ContentCard - Draggable card for Kanban board with selection support
 */
export function ContentCard({
    item,
    isDragging,
    isSelected = false,
    onToggleSelection
}: ContentCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const statusConfig = {
        idea: {
            icon: Lightbulb,
            color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
            border: "border-l-yellow-400",
        },
        draft: {
            icon: FileText,
            color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
            border: "border-l-orange-400",
        },
        scheduled: {
            icon: Clock,
            color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
            border: "border-l-blue-400",
        },
        published: {
            icon: CheckCircle,
            color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
            border: "border-l-green-400",
        },
    };

    const config = statusConfig[item.status];
    const StatusIcon = config.icon;

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleSelection?.(item.id);
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={cn(
                "cursor-grab active:cursor-grabbing transition-all group border-l-4",
                config.border,
                isDragging && "opacity-50 shadow-2xl scale-105 rotate-2",
                isSelected && "ring-2 ring-primary bg-primary/5",
                "hover:shadow-md focus-within:ring-2 focus-within:ring-primary"
            )}
            role="listitem"
            aria-selected={isSelected}
        >
            <CardContent className="p-3">
                <div className="flex items-start gap-2">
                    {/* Selection Checkbox */}
                    <div
                        className={cn(
                            "transition-opacity",
                            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}
                        onClick={handleCheckboxClick}
                    >
                        <Checkbox
                            checked={isSelected}
                            aria-label={`Select ${item.title}`}
                            className="mt-0.5"
                        />
                    </div>

                    {/* Drag Handle */}
                    <button
                        {...attributes}
                        {...listeners}
                        className="p-1 -ml-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                        aria-label={`Drag ${item.title}`}
                    >
                        <GripVertical className="h-4 w-4" aria-hidden="true" />
                    </button>

                    <div className="flex-1 min-w-0">
                        {/* Title */}
                        <p className="font-medium text-sm leading-tight truncate">
                            {item.title}
                        </p>

                        {/* Meta row */}
                        <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {item.platform}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                                {item.date}
                            </span>
                        </div>
                    </div>

                    {/* Status Icon */}
                    <div className={cn("p-1.5 rounded-md flex-shrink-0", config.color)}>
                        <StatusIcon className="h-3 w-3" aria-hidden="true" />
                    </div>
                </div>

                {/* Action buttons (only for scheduled items) */}
                {item.status === "scheduled" && (
                    <div className="flex gap-1 mt-2 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="h-6 text-xs flex-1">
                            <MoreHorizontal className="h-3 w-3 mr-1" aria-hidden="true" />
                            Edit
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 text-xs text-green-600 hover:text-green-700">
                            <Send className="h-3 w-3 mr-1" aria-hidden="true" />
                            Post Now
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
