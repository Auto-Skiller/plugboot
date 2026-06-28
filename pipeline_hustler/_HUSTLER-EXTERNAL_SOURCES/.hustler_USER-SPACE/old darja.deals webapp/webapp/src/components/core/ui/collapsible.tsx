"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const CollapsibleContext = React.createContext<{
    open: boolean
    onOpenChange: (open: boolean) => void
    disabled?: boolean
} | undefined>(undefined)

const Collapsible = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        open?: boolean
        onOpenChange?: (open: boolean) => void
        defaultOpen?: boolean
        disabled?: boolean
    }
>(({ open: controlledOpen, onOpenChange, defaultOpen, disabled, className, ...props }, ref) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : uncontrolledOpen

    const handleOpenChange = (newOpen: boolean) => {
        if (!isControlled) {
            setUncontrolledOpen(newOpen)
        }
        onOpenChange?.(newOpen)
    }

    return (
        <CollapsibleContext.Provider value={{ open, onOpenChange: handleOpenChange, disabled }}>
            <div
                ref={ref}
                data-state={open ? "open" : "closed"}
                className={cn("w-full", className)}
                {...props}
            />
        </CollapsibleContext.Provider>
    )
})
Collapsible.displayName = "Collapsible"

const CollapsibleTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext)

    return (
        <button
            ref={ref}
            type="button"
            disabled={context?.disabled}
            onClick={(e) => {
                onClick?.(e)
                context?.onOpenChange(!context.open)
            }}
            data-state={context?.open ? "open" : "closed"}
            className={cn("group flex items-center justify-between", className)}
            {...props}
        />
    )
})
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext)

    if (!context?.open) return null

    return (
        <div
            ref={ref}
            data-state="open"
            className={cn("overflow-hidden animate-in fade-in slide-in-from-top-1", className)}
            {...props}
        >
            {children}
        </div>
    )
})
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
