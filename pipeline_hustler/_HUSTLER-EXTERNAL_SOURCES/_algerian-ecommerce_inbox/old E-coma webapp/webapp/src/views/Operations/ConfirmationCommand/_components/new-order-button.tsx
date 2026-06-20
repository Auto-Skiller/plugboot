"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/ui/button";
import { Plus, RefreshCw, Download, Trash2, Settings2, Columns } from "lucide-react";

// ============================================================================
// NEW ORDER BUTTON (Ayor Style)
// ============================================================================

interface NewOrderButtonProps {
    href?: string;
    onClick?: () => void;
    className?: string;
}

export function NewOrderButton({
    href = "/ecommerce/orders/new",
    onClick,
    className
}: NewOrderButtonProps) {
    const buttonContent = (
        <Button
            onClick={onClick}
            className={cn(
                "whitespace-nowrap text-sm font-medium transition-colors",
                "shadow py-2 h-[42px] px-4",
                "text-white bg-indigo-500 hover:bg-indigo-600",
                "rounded-lg border-2 border-indigo-600",
                "justify-center items-center gap-2.5 inline-flex",
                className
            )}
        >
            <Plus className="h-4 w-4" />
            Nouvelle commande
        </Button>
    );

    if (onClick) {
        return buttonContent;
    }

    return (
        <Link href={href}>
            {buttonContent}
        </Link>
    );
}

// ============================================================================
// SYNC STATUS BUTTON
// ============================================================================

interface SyncStatusButtonProps {
    onClick?: () => void;
    isLoading?: boolean;
    className?: string;
}

export function SyncStatusButton({
    onClick,
    isLoading = false,
    className
}: SyncStatusButtonProps) {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            disabled={isLoading}
            className={cn(
                "gap-2 text-muted-foreground hover:text-primary transition-colors",
                className
            )}
        >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            <span className="hidden sm:inline">Synchroniser tous les statuts</span>
            <span className="sm:hidden">Sync</span>
        </Button>
    );
}

// ============================================================================
// EXPORT BUTTON (Enhanced)
// ============================================================================

interface ExportButtonProps {
    onClick?: () => void;
    isLoading?: boolean;
    formats?: ("csv" | "excel" | "pdf")[];
    className?: string;
}

export function ExportButton({
    onClick,
    isLoading = false,
    className
}: ExportButtonProps) {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            disabled={isLoading}
            className={cn("gap-2", className)}
        >
            <Download className={cn("h-4 w-4", isLoading && "animate-pulse")} />
            Exporter
        </Button>
    );
}

// ============================================================================
// DELETED ORDERS BUTTON
// ============================================================================

interface DeletedOrdersButtonProps {
    onClick?: () => void;
    count?: number;
    className?: string;
}

export function DeletedOrdersButton({
    onClick,
    count = 0,
    className
}: DeletedOrdersButtonProps) {
    return (
        <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            className={cn("h-8 w-8 p-0 relative", className)}
            title="Commandes supprimées"
        >
            <Trash2 className="h-4 w-4" />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                </span>
            )}
            <span className="sr-only">Commandes supprimées</span>
        </Button>
    );
}

// ============================================================================
// COLUMN CUSTOMIZER BUTTON
// ============================================================================

interface ColumnCustomizerButtonProps {
    onClick?: () => void;
    className?: string;
}

export function ColumnCustomizerButton({
    onClick,
    className
}: ColumnCustomizerButtonProps) {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className={cn("gap-2 h-9", className)}
        >
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Personnaliser les colonnes</span>
        </Button>
    );
}

// ============================================================================
// COLUMNS TOGGLE BUTTON
// ============================================================================

interface ColumnsToggleButtonProps {
    onClick?: () => void;
    visibleCount?: number;
    totalCount?: number;
    className?: string;
}

export function ColumnsToggleButton({
    onClick,
    visibleCount,
    totalCount,
    className
}: ColumnsToggleButtonProps) {
    return (
        <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            className={cn("h-10 w-10", className)}
            title="Afficher les colonnes"
        >
            <Columns className="h-4 w-4" />
            {visibleCount !== undefined && totalCount !== undefined && (
                <span className="sr-only">
                    {visibleCount}/{totalCount} colonnes visibles
                </span>
            )}
        </Button>
    );
}
