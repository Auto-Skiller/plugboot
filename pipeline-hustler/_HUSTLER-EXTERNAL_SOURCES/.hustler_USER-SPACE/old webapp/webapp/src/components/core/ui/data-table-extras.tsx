"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/ui/button";
import {
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    Settings2,
    Download,
    Filter,
    X,
    Check,
    Eye,
    EyeOff,
    GripVertical,
} from "lucide-react";

import { OrderStatusBadge as NewOrderStatusBadge, STATUS_BADGE_STYLES, type OrderStatus } from "@/components/core/ui/order-status-filter";

// Re-exporting for backward compatibility, but mapping to new system
export function StatusBadge({ status, label, size = "md", className }: { status: string, label: string, size?: "sm" | "md", className?: string }) {
    // Map old status types to new ones if possible, or fallback
    let mappedStatus: any = "pending";

    if (status === "success" || status === "confirmed") mappedStatus = "confirmed";
    else if (status === "error" || status === "cancelled") mappedStatus = "cancelled";
    else if (status === "warning" || status === "pending") mappedStatus = "pending";
    else if (status === "info" || status === "shipped") mappedStatus = "shipped";
    else if (status === "delivered") mappedStatus = "delivered";
    else if (status === "returned") mappedStatus = "returned";

    return (
        <NewOrderStatusBadge
            status={mappedStatus}
            size={size}
            className={className}
            showDot={true}
        />
    );
}

// ============================================================================
// COLUMN VISIBILITY TOGGLE
// ============================================================================

interface Column {
    id: string;
    label: string;
    visible: boolean;
}

interface ColumnVisibilityProps {
    columns: Column[];
    onChange: (columns: Column[]) => void;
    className?: string;
}

export function ColumnVisibility({ columns, onChange, className }: ColumnVisibilityProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    const toggleColumn = (id: string) => {
        onChange(
            columns.map((col) =>
                col.id === id ? { ...col, visible: !col.visible } : col
            )
        );
    };

    const visibleCount = columns.filter((c) => c.visible).length;

    return (
        <div className={cn("relative", className)}>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="gap-2"
            >
                <Settings2 className="h-4 w-4" />
                Columns
                <span className="text-xs text-muted-foreground">
                    ({visibleCount}/{columns.length})
                </span>
            </Button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-card border rounded-lg shadow-lg z-50 py-2">
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase border-b mb-1">
                            Toggle Columns
                        </div>
                        {columns.map((column) => (
                            <button
                                key={column.id}
                                onClick={() => toggleColumn(column.id)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors"
                            >
                                {column.visible ? (
                                    <Eye className="h-4 w-4 text-primary" />
                                ) : (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className={cn(!column.visible && "text-muted-foreground")}>
                                    {column.label}
                                </span>
                                {column.visible && (
                                    <Check className="h-4 w-4 ml-auto text-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// ============================================================================
// DATA TABLE TOOLBAR
// ============================================================================

interface DataTableToolbarProps {
    children?: React.ReactNode;
    className?: string;
    selectedCount?: number;
    onClearSelection?: () => void;
    onExport?: () => void;
    onFilter?: () => void;
    showExport?: boolean;
    showFilter?: boolean;
    searchComponent?: React.ReactNode;
}

export function DataTableToolbar({
    children,
    className,
    selectedCount = 0,
    onClearSelection,
    onExport,
    onFilter,
    showExport = true,
    showFilter = true,
    searchComponent,
}: DataTableToolbarProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-between gap-4 py-4",
                className
            )}
        >
            <div className="flex items-center gap-2 flex-1">
                {selectedCount > 0 ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                        <span className="text-sm font-medium text-primary">
                            {selectedCount} selected
                        </span>
                        <button
                            onClick={onClearSelection}
                            className="p-0.5 hover:bg-primary/20 rounded"
                        >
                            <X className="h-4 w-4 text-primary" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 w-full">
                        {searchComponent}
                        {children}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {showFilter && (
                    <Button variant="outline" size="sm" onClick={onFilter} className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                )}
                {showExport && (
                    <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// SORTABLE TABLE HEADER
// ============================================================================

type SortDirection = "asc" | "desc" | null;

interface SortableHeaderProps {
    children: React.ReactNode;
    sorted?: SortDirection;
    onSort?: () => void;
    className?: string;
}

export function SortableHeader({
    children,
    sorted,
    onSort,
    className,
}: SortableHeaderProps) {
    return (
        <button
            onClick={onSort}
            className={cn(
                "flex items-center gap-1 font-medium text-left",
                "hover:text-foreground transition-colors",
                sorted ? "text-foreground" : "text-muted-foreground",
                className
            )}
        >
            {children}
            {sorted === "asc" && <ChevronUp className="h-4 w-4" />}
            {sorted === "desc" && <ChevronDown className="h-4 w-4" />}
            {!sorted && <ChevronsUpDown className="h-4 w-4 opacity-50" />}
        </button>
    );
}

// ============================================================================
// PAGINATION
// ============================================================================

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100],
    className,
}: PaginationProps) {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    return (
        <div
            className={cn(
                "flex items-center justify-between gap-4 py-4 text-sm",
                className
            )}
        >
            <div className="flex items-center gap-2 text-muted-foreground">
                {onPageSizeChange && (
                    <>
                        <span>Rows per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="h-8 w-16 rounded-md border bg-background px-2 text-sm"
                        >
                            {pageSizeOptions.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </>
                )}
                <span>
                    {start}-{end} of {totalItems}
                </span>
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                >
                    <span className="sr-only">First page</span>
                    <span>«</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                >
                    <span className="sr-only">Previous</span>
                    <span>‹</span>
                </Button>

                <span className="px-2 text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                >
                    <span className="sr-only">Next</span>
                    <span>›</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                >
                    <span className="sr-only">Last page</span>
                    <span>»</span>
                </Button>
            </div>
        </div>
    );
}
