"use client";

import * as React from "react";
import { Input } from "@/components/core/ui/input";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineEditProps {
    value: string | number;
    onSave: (newValue: string) => void;
    className?: string;
    type?: "text" | "number";
}

export function InlineEdit({ value, onSave, className, type = "text" }: InlineEditProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [currentValue, setCurrentValue] = React.useState(value.toString());
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setCurrentValue(value.toString());
    }, [value]);

    React.useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (currentValue !== value.toString()) {
            onSave(currentValue);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setCurrentValue(value.toString());
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            handleCancel();
        }
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200">
                <Input
                    ref={inputRef}
                    type={type}
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    className={cn("h-7 px-2 py-1 text-sm min-w-[80px]", className)}
                />
            </div>
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={cn(
                "cursor-pointer hover:bg-muted/50 px-2 py-1 rounded border border-transparent hover:border-border transition-colors truncate",
                className
            )}
            title="Click to edit"
        >
            {value}
        </div>
    );
}
