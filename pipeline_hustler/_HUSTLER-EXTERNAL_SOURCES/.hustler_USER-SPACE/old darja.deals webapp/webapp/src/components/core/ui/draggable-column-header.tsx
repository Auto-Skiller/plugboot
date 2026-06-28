"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableHead } from "@/components/core/ui/table";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface DraggableColumnHeaderProps extends React.HTMLAttributes<HTMLTableCellElement> {
    id: string;
    title: string;
    className?: string;
}

export function DraggableColumnHeader({ id, title, className, children, ...props }: DraggableColumnHeaderProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1 : 0,
        position: isDragging ? "relative" : undefined,
    } as React.CSSProperties;

    return (
        <TableHead
            ref={setNodeRef}
            style={style}
            className={cn("group select-none", className)}
            {...props}
        >
            <div className="flex items-center gap-1">
                <button
                    {...attributes}
                    {...listeners}
                    className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded transition-opacity"
                >
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                </button>
                {children || title}
            </div>
        </TableHead>
    );
}
