"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/core/ui/button";
import { Progress } from "@/components/core/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/core/ui/dialog";
import {
    Upload,
    FileUp,
    File,
    FileJson,
    FileSpreadsheet,
    CheckCircle,
    AlertCircle,
    X,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportedFile {
    name: string;
    size: number;
    type: string;
    status: "pending" | "uploading" | "success" | "error";
    progress: number;
    error?: string;
}

interface ImportDropzoneProps {
    isOpen: boolean;
    onClose: () => void;
    onImport?: (files: File[]) => void;
    acceptedFormats?: string[];
}

/**
 * ImportDropzone - Drag-and-drop file upload area with progress
 * Migrated to standardized Dialog component - all functionality preserved
 */
export function ImportDropzone({
    isOpen,
    onClose,
    onImport,
    acceptedFormats = [".json", ".csv"],
}: ImportDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<ImportedFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        processFiles(droppedFiles);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            processFiles(selectedFiles);
        }
    };

    const processFiles = (newFiles: File[]) => {
        const importedFiles: ImportedFile[] = newFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            status: "pending" as const,
            progress: 0,
        }));

        setFiles(prev => [...prev, ...importedFiles]);

        // Simulate upload progress
        importedFiles.forEach((file, index) => {
            simulateUpload(files.length + index);
        });
    };

    const simulateUpload = async (fileIndex: number) => {
        for (let progress = 0; progress <= 100; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setFiles(prev => prev.map((f, i) =>
                i === fileIndex
                    ? { ...f, status: progress < 100 ? "uploading" : "success", progress }
                    : f
            ));
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleImport = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsProcessing(false);
        onClose();
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && !isProcessing) {
            setFiles([]);
            onClose();
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (type: string) => {
        if (type.includes("json")) return FileJson;
        if (type.includes("csv") || type.includes("spreadsheet")) return FileSpreadsheet;
        return File;
    };

    const successCount = files.filter(f => f.status === "success").length;
    const allDone = files.length > 0 && files.every(f => f.status === "success" || f.status === "error");

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent size="default" className="sm:max-w-md">
                {/* Header */}
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        <DialogTitle>Import Content</DialogTitle>
                    </div>
                    <DialogDescription>
                        Drag and drop files or click to browse
                    </DialogDescription>
                </DialogHeader>

                {/* Content */}
                <div className="space-y-4 py-4">
                    {/* Dropzone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            "border-2 border-dashed rounded-xl p-8 text-center transition-all relative",
                            isDragging
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-muted-foreground/50"
                        )}
                    >
                        <motion.div
                            animate={{ scale: isDragging ? 1.05 : 1 }}
                            className="flex flex-col items-center gap-3"
                        >
                            <div className={cn(
                                "p-4 rounded-full",
                                isDragging ? "bg-primary/10" : "bg-muted"
                            )}>
                                <FileUp className={cn(
                                    "h-8 w-8",
                                    isDragging ? "text-primary" : "text-muted-foreground"
                                )} />
                            </div>

                            <div>
                                <p className="font-medium">
                                    {isDragging ? "Drop files here" : "Drag & drop files"}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    or click to browse
                                </p>
                            </div>

                            <input
                                type="file"
                                multiple
                                accept={acceptedFormats.join(",")}
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />

                            <p className="text-xs text-muted-foreground">
                                Supported: {acceptedFormats.join(", ")}
                            </p>
                        </motion.div>
                    </div>

                    {/* File list */}
                    {files.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {files.map((file, index) => {
                                const FileIcon = getFileIcon(file.type);
                                return (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-lg"
                                    >
                                        <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatFileSize(file.size)}
                                                </span>
                                                {file.status === "uploading" && (
                                                    <Progress value={file.progress} className="h-1 flex-1" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Status icon */}
                                        {file.status === "uploading" && (
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        )}
                                        {file.status === "success" && (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
                                        {file.status === "error" && (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                        {file.status === "pending" && (
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="p-1 hover:bg-muted rounded"
                                            >
                                                <X className="h-3.5 w-3.5 text-muted-foreground" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Summary */}
                    {allDone && successCount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-green-600 justify-center py-2"
                        >
                            <CheckCircle className="h-5 w-5" />
                            <span>{successCount} file(s) ready to import</span>
                        </motion.div>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={files.length === 0 || !allDone || isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Import {successCount > 0 ? `(${successCount})` : ""}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

