"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "./sheet"
import { Button } from "./button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActionSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    children: React.ReactNode
    side?: "left" | "right" | "top" | "bottom"
    size?: "sm" | "default" | "lg" | "xl"
    footer?: React.ReactNode
    className?: string
}

/**
 * ActionSheet - A standardized wrapper for tool panels and contextual sidebars.
 * 
 * Use this component for:
 * - AI tool panels (Responder, Comment Guard, etc.)
 * - Order confirmation workflows
 * - Settings panels
 * - Detail views
 * 
 * @example
 * ```tsx
 * <ActionSheet
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="AI Responder"
 *   description="Generate smart replies"
 *   size="lg"
 * >
 *   <AIResponderContent />
 * </ActionSheet>
 * ```
 */
export function ActionSheet({
    open,
    onOpenChange,
    title,
    description,
    children,
    side = "right",
    size = "default",
    footer,
    className,
}: ActionSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={side}
                size={size}
                className={cn("flex flex-col p-0", className)}
            >
                {/* Header */}
                <SheetHeader className="p-6 pb-4 border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <SheetTitle>{title}</SheetTitle>
                            {description && (
                                <SheetDescription className="mt-1">
                                    {description}
                                </SheetDescription>
                            )}
                        </div>
                    </div>
                </SheetHeader>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>

                {/* Footer (optional) */}
                {footer && (
                    <SheetFooter className="p-6 pt-4 border-t">
                        {footer}
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    )
}

/**
 * ActionSheetTrigger - Helper for common trigger patterns
 */
export function ActionSheetFooterButtons({
    onCancel,
    onSave,
    cancelLabel = "Cancel",
    saveLabel = "Save",
    isLoading = false,
}: {
    onCancel: () => void
    onSave: () => void
    cancelLabel?: string
    saveLabel?: string
    isLoading?: boolean
}) {
    return (
        <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                {cancelLabel}
            </Button>
            <Button onClick={onSave} disabled={isLoading}>
                {isLoading ? "Saving..." : saveLabel}
            </Button>
        </div>
    )
}
