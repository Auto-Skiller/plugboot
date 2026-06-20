"use client";

import { useState, ReactNode, useRef, useLayoutEffect } from "react";
import { Button } from "@/components/core/ui/button";
import {
    MoreHorizontal,
    ChevronRight,
    LucideIcon
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/core/ui/dropdown-menu";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Types
// Types
export interface ActionItem {
    id: string;
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
    hoverColor?: string;
    hidden?: boolean;
    iconColor?: string;
    separator?: boolean;
    origin?: 'main' | 'more';
}

export type QuickAction = ActionItem;
export type MoreAction = ActionItem;



export interface QuickActionsBarProps {
    primaryAction?: {
        label: string;
        icon: LucideIcon;
        onClick: () => void;
    };
    actions?: QuickAction[];
    moreActions?: MoreAction[];
    className?: string;
    children?: ReactNode;
    variant?: "default" | "inline";
}

/**
 * QuickActionsBar - Reusable horizontal bar with configurable quick-access buttons
 * Each page can configure its own primary action, quick actions, and AI tips
 */
export function QuickActionsBar({
    primaryAction,
    actions = [],
    moreActions = [],
    className,
    children,
    variant = "default",
}: QuickActionsBarProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const ghostRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState<number>(actions.length);
    const [isMeasuring, setIsMeasuring] = useState(true);

    // Combine all passed actions into one pool for logic, preserving order
    // We treat 'actions' as high priority, 'moreActions' as low priority
    const allPool = [
        ...actions.map(a => ({ ...a, origin: 'main' })),
        ...moreActions.map(a => ({ ...a, origin: 'more', variant: 'ghost' as const }))
    ];

    useLayoutEffect(() => {
        const calculateVisible = () => {
            if (!containerRef.current || !ghostRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;
            const primaryWidth = primaryAction ? (ghostRef.current.querySelector('[data-id="primary"]')?.getBoundingClientRect().width || 0) + 12 : 0; // +12 for divider gap
            const moreBtnWidth = 84; // Approx width of "More" button + gap
            const childrenWidth = children ? (ghostRef.current.querySelector('[data-id="children"]')?.getBoundingClientRect().width || 0) : 0;

            // Available space for dynamic actions
            // Deduct primary action, children, and some padding
            const availableSpace = containerWidth - primaryWidth - childrenWidth - 16;

            let currentWidth = 0;
            let count = 0;
            const actionElements = Array.from(ghostRef.current.querySelectorAll('[data-action-index]'));

            for (let i = 0; i < actionElements.length; i++) {
                const el = actionElements[i];
                const width = el.getBoundingClientRect().width + 8; // +8 for gap

                // Check if adding this item + "More" button would exceed space
                // (Unless it's the very last item, then we don't need "More" button space)
                const isLast = i === actionElements.length - 1;
                const overhead = isLast ? 0 : moreBtnWidth;

                if (currentWidth + width + overhead <= availableSpace) {
                    currentWidth += width;
                    count++;
                } else {
                    break;
                }
            }

            setVisibleCount(count);
            setIsMeasuring(false);
        };

        const debouncedCalc = () => requestAnimationFrame(calculateVisible);

        calculateVisible(); // Initial calc

        const observer = new ResizeObserver(debouncedCalc);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [allPool.length, primaryAction, children]);


    // Partition based on calculated count
    const visibleActions = allPool.slice(0, visibleCount);
    const overflowActions = allPool.slice(visibleCount);

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "flex items-center gap-2 w-full overflow-hidden",
                variant === "default" && "p-3 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl border border-primary/20 shadow-sm",
                className
            )}
        >
            {/* Primary CTA - Always Visible if present */}
            {primaryAction && (
                <div className="shrink-0 flex items-center">
                    <Button
                        onClick={primaryAction.onClick}
                        className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md whitespace-nowrap"
                    >
                        <primaryAction.icon className="h-4 w-4" />
                        {primaryAction.label}
                    </Button>
                    <div className="h-6 w-px bg-border mx-2" />
                </div>
            )}

            {/* Visible Actions */}
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                {visibleActions.map((action) => (
                    <Button
                        key={action.id}
                        // @ts-ignore - Variant types matching
                        variant={action.variant || "outline"}
                        size="sm"
                        className={cn("gap-2 whitespace-nowrap shrink-0", action.hoverColor)}
                        onClick={action.onClick}
                    >
                        <action.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{action.label}</span>
                    </Button>
                ))}

                {/* Overflow 'More' Menu */}
                {overflowActions.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1 shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="hidden sm:inline">More</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {overflowActions.map((action, idx) => (
                                <div key={action.id}>
                                    {/* Restore separators if originally from more actions or arbitrarily between groups */}
                                    {(action.separator || (idx === 0 && action.origin === 'more')) && <DropdownMenuSeparator />}
                                    <DropdownMenuItem onClick={action.onClick} className="gap-2">
                                        <action.icon className={cn("h-4 w-4", action.iconColor)} />
                                        {action.label}
                                    </DropdownMenuItem>
                                </div>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Additional children (e.g. specialized controls) */}
            {children && <div className="shrink-0">{children}</div>}

            {/* =========================================================
                GHOST LAYER
                Render everything invisible to measure widths
               ========================================================= */}
            <div
                ref={ghostRef}
                className="absolute top-0 left-0 invisible pointer-events-none flex items-center gap-2 opacity-0 -z-50"
                aria-hidden="true"
            >
                {primaryAction && (
                    <div data-id="primary" className="flex items-center">
                        <Button className="gap-2">
                            <primaryAction.icon className="h-4 w-4" />
                            {primaryAction.label}
                        </Button>
                        <div className="w-px mx-2" />
                    </div>
                )}
                {allPool.map((action, i) => (
                    <Button
                        key={action.id}
                        data-action-index={i}
                        size="sm"
                        className="gap-2"
                    >
                        <action.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{action.label}</span>
                    </Button>
                ))}
                {children && <div data-id="children">{children}</div>}
            </div>
        </motion.div>
    );
}
