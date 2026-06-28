import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/core/ui/dialog";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Checkbox } from "@/components/core/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import { Calendar } from "@/components/core/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/core/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, FileSpreadsheet, FileText, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExportBuilderModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    columns?: { id: string; label: string }[];
    onExport?: (config: any) => Promise<void>;
}

export function ExportBuilderModal({
    open,
    onOpenChange,
    title = "Export Data",
    description = "Configure your export settings based on the selected report type.",
    columns = [
        { id: "id", label: "ID" },
        { id: "date", label: "Date" },
        { id: "status", label: "Status" },
        { id: "amount", label: "Amount" },
        { id: "customer", label: "Customer Details" },
        { id: "items", label: "Order Items" },
    ],
    onExport
}: ExportBuilderModalProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [formatType, setFormatType] = useState("csv");
    const [selectedColumns, setSelectedColumns] = useState<string[]>(columns.map(c => c.id));
    const [isExporting, setIsExporting] = useState(false);

    const handleColumnToggle = (id: string) => {
        setSelectedColumns(prev =>
            prev.includes(id)
                ? prev.filter(c => c !== id)
                : [...prev, id]
        );
    };

    const handleExport = async () => {
        setIsExporting(true);
        // Simulate API delay or call actual handler
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (onExport) {
            await onExport({ date, format: formatType, columns: selectedColumns });
        }
        setIsExporting(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] gap-0 p-0 overflow-hidden">
                <div className="p-6 pb-4 border-b">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    {/* Date Selection */}
                    <div className="space-y-3">
                        <Label>Date Range</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Format Selection */}
                    <div className="space-y-3">
                        <Label>Export Format</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50",
                                    formatType === "csv" ? "border-primary bg-primary/5" : "border-muted"
                                )}
                                onClick={() => setFormatType("csv")}
                            >
                                <FileSpreadsheet className={cn("w-6 h-6 mb-2", formatType === "csv" ? "text-primary" : "text-muted-foreground")} />
                                <span className="text-sm font-medium">CSV / Excel</span>
                            </div>
                            <div
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50",
                                    formatType === "pdf" ? "border-primary bg-primary/5" : "border-muted"
                                )}
                                onClick={() => setFormatType("pdf")}
                            >
                                <FileText className={cn("w-6 h-6 mb-2", formatType === "pdf" ? "text-primary" : "text-muted-foreground")} />
                                <span className="text-sm font-medium">PDF Report</span>
                            </div>
                        </div>
                    </div>

                    {/* Columns Selection */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Included Columns</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-muted-foreground"
                                onClick={() => setSelectedColumns(selectedColumns.length === columns.length ? [] : columns.map(c => c.id))}
                            >
                                {selectedColumns.length === columns.length ? "Deselect All" : "Select All"}
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-muted/20 max-h-[150px] overflow-y-auto">
                            {columns.map(col => (
                                <div key={col.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={col.id}
                                        checked={selectedColumns.includes(col.id)}
                                        onCheckedChange={() => handleColumnToggle(col.id)}
                                    />
                                    <label
                                        htmlFor={col.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {col.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-2 border-t bg-muted/10">
                    <Button className="w-full" onClick={handleExport} disabled={isExporting}>
                        {isExporting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating Export...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Download Export
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
