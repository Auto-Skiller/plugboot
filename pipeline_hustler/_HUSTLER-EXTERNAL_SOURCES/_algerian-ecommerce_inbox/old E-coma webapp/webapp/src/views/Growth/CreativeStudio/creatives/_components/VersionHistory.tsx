"use client";

import { useState } from "react";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/core/ui/sheet";
import {
    History,
    Undo2,
    Redo2,
    RotateCcw,
    Eye,
    Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Version {
    id: string;
    timestamp: Date;
    description: string;
    author: string;
    type: "create" | "edit" | "restore" | "auto-save";
}

// Mock version history data
const MOCK_VERSIONS: Version[] = [
    { id: "v6", timestamp: new Date(Date.now() - 5 * 60000), description: "Updated hook text", author: "You", type: "edit" },
    { id: "v5", timestamp: new Date(Date.now() - 15 * 60000), description: "Auto-saved draft", author: "System", type: "auto-save" },
    { id: "v4", timestamp: new Date(Date.now() - 30 * 60000), description: "Changed platform to TikTok", author: "You", type: "edit" },
    { id: "v3", timestamp: new Date(Date.now() - 60 * 60000), description: "Restored from v1", author: "You", type: "restore" },
    { id: "v2", timestamp: new Date(Date.now() - 2 * 60 * 60000), description: "Added product details", author: "Ahmed", type: "edit" },
    { id: "v1", timestamp: new Date(Date.now() - 24 * 60 * 60000), description: "Initial draft created", author: "You", type: "create" },
];

interface VersionHistoryProps {
    contentId?: string;
    isOpen?: boolean;
    onClose?: () => void;
    onRestore?: (versionId: string) => void;
    onPreview?: (versionId: string) => void;
}

/**
 * VersionHistory - Timeline panel showing past versions with restore functionality
 * Migrated to standardized Sheet component - all functionality preserved
 */
export function VersionHistory({
    contentId,
    isOpen = false,
    onClose,
    onRestore,
    onPreview,
}: VersionHistoryProps) {
    const [versions] = useState<Version[]>(MOCK_VERSIONS);
    const [currentIndex, setCurrentIndex] = useState(0);

    const canUndo = currentIndex < versions.length - 1;
    const canRedo = currentIndex > 0;

    const handleUndo = () => {
        if (canUndo) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handleRedo = () => {
        if (canRedo) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && onClose) {
            onClose();
        }
    };

    const formatTime = (date: Date) => {
        const diff = Date.now() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getTypeColor = (type: Version["type"]) => {
        switch (type) {
            case "create": return "bg-green-100 text-green-700 dark:bg-green-900/30";
            case "edit": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30";
            case "restore": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30";
            case "auto-save": return "bg-gray-100 text-gray-700 dark:bg-gray-800/50";
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent side="right" size="sm" className="flex flex-col p-0">
                {/* Header */}
                <SheetHeader className="p-4 border-b">
                    <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-primary" />
                        <SheetTitle className="text-sm">Version History</SheetTitle>
                    </div>
                    <SheetDescription className="sr-only">
                        View and restore previous versions of your content
                    </SheetDescription>

                    {/* Undo/Redo Controls */}
                    <div className="flex items-center gap-2 mt-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUndo}
                            disabled={!canUndo}
                            className="flex-1 gap-1"
                        >
                            <Undo2 className="h-3.5 w-3.5" />
                            Undo
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRedo}
                            disabled={!canRedo}
                            className="flex-1 gap-1"
                        >
                            <Redo2 className="h-3.5 w-3.5" />
                            Redo
                        </Button>
                    </div>
                </SheetHeader>

                {/* Timeline Content */}
                <div className="flex-1 overflow-y-auto p-3">
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-muted" />

                        {versions.map((version, index) => (
                            <div
                                key={version.id}
                                className={cn(
                                    "relative pl-8 pb-4 group",
                                    index === currentIndex && "opacity-100",
                                    index !== currentIndex && "opacity-60 hover:opacity-80"
                                )}
                            >
                                {/* Timeline dot */}
                                <div
                                    className={cn(
                                        "absolute left-1.5 top-1 w-3 h-3 rounded-full border-2 border-background",
                                        index === currentIndex
                                            ? "bg-primary ring-2 ring-primary/30"
                                            : "bg-muted-foreground/50"
                                    )}
                                />

                                {/* Version card */}
                                <div className="bg-muted/50 rounded-lg p-2.5 border hover:border-primary/30 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <Badge variant="outline" className={cn("text-[10px] px-1.5", getTypeColor(version.type))}>
                                            {version.type}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-2.5 w-2.5" />
                                            {formatTime(version.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium">{version.description}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">by {version.author}</p>

                                    {/* Actions */}
                                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-[10px] flex-1"
                                            onClick={() => onPreview?.(version.id)}
                                        >
                                            <Eye className="h-3 w-3 mr-1" />
                                            Preview
                                        </Button>
                                        {index !== currentIndex && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-[10px] flex-1 text-primary"
                                                onClick={() => onRestore?.(version.id)}
                                            >
                                                <RotateCcw className="h-3 w-3 mr-1" />
                                                Restore
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

