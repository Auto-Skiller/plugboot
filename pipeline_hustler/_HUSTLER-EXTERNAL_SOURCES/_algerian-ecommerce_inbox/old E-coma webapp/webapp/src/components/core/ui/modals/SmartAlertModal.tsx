import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/core/ui/dialog";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { AlertTriangle, Trash2, CheckCircle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SmartAlertModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    variant?: "default" | "destructive" | "success" | "warning";
    confirmText?: string;
    cancelText?: string;
    requireConfirmationString?: string; // e.g., "DELETE"
    onConfirm?: () => Promise<void>;
}

export function SmartAlertModal({
    open,
    onOpenChange,
    title,
    description,
    variant = "default",
    confirmText = "Confirm",
    cancelText = "Cancel",
    requireConfirmationString,
    onConfirm
}: SmartAlertModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [confirmInput, setConfirmInput] = useState("");

    const isConfirmDisabled = requireConfirmationString
        ? confirmInput !== requireConfirmationString
        : false;

    const handleConfirm = async () => {
        setIsLoading(true);
        if (onConfirm) await onConfirm();
        setIsLoading(false);
        onOpenChange(false);
        setConfirmInput("");
    };

    const icons = {
        default: <Info className="w-12 h-12 text-blue-500 mb-4" />,
        destructive: <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4"><Trash2 className="w-6 h-6 text-red-600" /></div>,
        success: <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4"><CheckCircle className="w-6 h-6 text-green-600" /></div>,
        warning: <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4"><AlertTriangle className="w-6 h-6 text-yellow-600" /></div>,
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] text-center p-8">
                <div className="flex flex-col items-center">
                    {icons[variant]}
                    <DialogTitle className="text-xl font-bold mb-2">{title}</DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground mb-6">
                        {description}
                    </DialogDescription>

                    {requireConfirmationString && (
                        <div className="w-full text-left space-y-2 mb-6 bg-muted/30 p-4 rounded-lg border">
                            <label className="text-xs font-medium text-muted-foreground uppercase">
                                Type <span className="font-bold text-foreground select-all">"{requireConfirmationString}"</span> to confirm
                            </label>
                            <Input
                                value={confirmInput}
                                onChange={(e) => setConfirmInput(e.target.value)}
                                placeholder={requireConfirmationString}
                                className={cn(
                                    "text-center font-mono placeholder:font-sans transition-all",
                                    confirmInput === requireConfirmationString ? "border-green-500 ring-2 ring-green-500/20" : ""
                                )}
                            />
                        </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={variant === "destructive" ? "destructive" : "default"}
                            className="flex-1"
                            onClick={handleConfirm}
                            disabled={isConfirmDisabled || isLoading}
                        >
                            {isLoading ? "Processing..." : confirmText}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
