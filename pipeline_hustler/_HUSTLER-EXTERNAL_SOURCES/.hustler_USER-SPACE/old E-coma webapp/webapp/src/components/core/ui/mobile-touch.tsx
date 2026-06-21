"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// TOUCH-OPTIMIZED COMPONENTS FOR MOBILE
// ============================================================================

// Larger touch target wrapper
interface TouchTargetProps {
    children: React.ReactNode;
    className?: string;
    minSize?: number;
}

export function TouchTarget({ children, className, minSize = 44 }: TouchTargetProps) {
    return (
        <div
            className={cn("relative", className)}
            style={{ minWidth: minSize, minHeight: minSize }}
        >
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}

// ============================================================================
// MOBILE-OPTIMIZED BUTTONS
// ============================================================================

interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
}

export function MobileButton({
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    icon,
    className,
    disabled,
    ...props
}: MobileButtonProps) {
    const variants = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80",
        ghost: "bg-transparent hover:bg-muted active:bg-muted/80",
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
    };

    const sizes = {
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-8 text-lg",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl font-medium",
                "transition-all duration-150 ease-out",
                "active:scale-[0.97] touch-manipulation",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                variants[variant],
                sizes[size],
                fullWidth && "w-full",
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : icon}
            {children}
        </button>
    );
}

// ============================================================================
// SWIPE ACTION LIST ITEM
// ============================================================================

interface SwipeActionItemProps {
    children: React.ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    leftAction?: { label: string; color: string; icon?: React.ReactNode };
    rightAction?: { label: string; color: string; icon?: React.ReactNode };
    threshold?: number;
    className?: string;
}

export function SwipeActionItem({
    children,
    onSwipeLeft,
    onSwipeRight,
    leftAction,
    rightAction,
    threshold = 80,
    className,
}: SwipeActionItemProps) {
    const [translateX, setTranslateX] = React.useState(0);
    const [startX, setStartX] = React.useState(0);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        setStartX(e.touches[0].clientX);
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;

        // Limit max swipe distance
        const limited = Math.max(-150, Math.min(150, diff));
        setTranslateX(limited);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);

        if (translateX > threshold && onSwipeRight) {
            onSwipeRight();
        } else if (translateX < -threshold && onSwipeLeft) {
            onSwipeLeft();
        }

        setTranslateX(0);
    };

    return (
        <div className={cn("relative overflow-hidden", className)}>
            {/* Background actions */}
            <div className="absolute inset-0 flex">
                {rightAction && (
                    <div
                        className="flex items-center justify-start px-4 flex-1"
                        style={{ backgroundColor: rightAction.color }}
                    >
                        {rightAction.icon}
                        <span className="text-white font-medium ml-2">{rightAction.label}</span>
                    </div>
                )}
                {leftAction && (
                    <div
                        className="flex items-center justify-end px-4 flex-1"
                        style={{ backgroundColor: leftAction.color }}
                    >
                        <span className="text-white font-medium mr-2">{leftAction.label}</span>
                        {leftAction.icon}
                    </div>
                )}
            </div>

            {/* Swipeable content */}
            <div
                className="relative bg-card transition-transform"
                style={{
                    transform: `translateX(${translateX}px)`,
                    transitionDuration: isDragging ? "0ms" : "200ms",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    );
}

// ============================================================================
// MOBILE BOTTOM SHEET
// ============================================================================

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    snapPoints?: number[];
    className?: string;
}

export function BottomSheet({
    isOpen,
    onClose,
    children,
    title,
    snapPoints = [0.5, 0.9],
    className,
}: BottomSheetProps) {
    const [currentSnap, setCurrentSnap] = React.useState(0);
    const [startY, setStartY] = React.useState(0);
    const [translateY, setTranslateY] = React.useState(0);
    const [isDragging, setIsDragging] = React.useState(false);

    const snapHeight = snapPoints[currentSnap] * window.innerHeight;

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleDragStart = (e: React.TouchEvent) => {
        setStartY(e.touches[0].clientY);
        setIsDragging(true);
    };

    const handleDrag = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const diff = e.touches[0].clientY - startY;
        setTranslateY(Math.max(0, diff));
    };

    const handleDragEnd = () => {
        setIsDragging(false);

        if (translateY > 100) {
            if (currentSnap > 0) {
                setCurrentSnap(currentSnap - 1);
            } else {
                onClose();
            }
        } else if (translateY < -50 && currentSnap < snapPoints.length - 1) {
            setCurrentSnap(currentSnap + 1);
        }

        setTranslateY(0);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity touch-none"
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl shadow-2xl",
                    "transition-transform touch-none",
                    className
                )}
                style={{
                    height: snapHeight,
                    transform: `translateY(${translateY}px)`,
                    transitionDuration: isDragging ? "0ms" : "300ms",
                }}
            >
                {/* Drag handle */}
                <div
                    className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
                    onTouchStart={handleDragStart}
                    onTouchMove={handleDrag}
                    onTouchEnd={handleDragEnd}
                >
                    <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                </div>

                {/* Header */}
                {title && (
                    <div className="px-4 pb-2 border-b">
                        <h2 className="text-lg font-semibold">{title}</h2>
                    </div>
                )}

                {/* Content */}
                <div className="overflow-y-auto p-4" style={{ maxHeight: snapHeight - 60 }}>
                    {children}
                </div>
            </div>
        </>
    );
}

// ============================================================================
// MOBILE-OPTIMIZED TAB BAR
// ============================================================================

interface TabItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
}

interface MobileTabsProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (id: string) => void;
    variant?: "default" | "pills" | "underline";
    className?: string;
}

export function MobileTabs({
    tabs,
    activeTab,
    onChange,
    variant = "default",
    className,
}: MobileTabsProps) {
    return (
        <div
            className={cn(
                "flex overflow-x-auto scrollbar-hide gap-1 p-1",
                variant === "pills" && "bg-muted rounded-xl",
                className
            )}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        "flex-1 min-w-[80px] flex flex-col items-center gap-1 py-2 px-3 rounded-lg",
                        "transition-all duration-150 active:scale-95 touch-manipulation",
                        variant === "default" && (
                            activeTab === tab.id
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                        ),
                        variant === "pills" && (
                            activeTab === tab.id
                                ? "bg-background shadow-sm"
                                : ""
                        ),
                        variant === "underline" && (
                            activeTab === tab.id
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground"
                        )
                    )}
                >
                    <div className="relative">
                        {tab.icon}
                        {tab.badge !== undefined && tab.badge > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                                {tab.badge > 9 ? "9+" : tab.badge}
                            </span>
                        )}
                    </div>
                    <span className="text-xs font-medium truncate">{tab.label}</span>
                </button>
            ))}
        </div>
    );
}

// ============================================================================
// HAPTIC FEEDBACK (iOS Safari)
// ============================================================================

export function triggerHaptic(type: "light" | "medium" | "heavy" = "light") {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        const durations = { light: 10, medium: 20, heavy: 40 };
        navigator.vibrate(durations[type]);
    }
}

// ============================================================================
// MOBILE-OPTIMIZED INPUT
// ============================================================================

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
    ({ label, error, icon, className, ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="text-sm font-medium text-muted-foreground">{label}</label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            "w-full h-12 px-4 rounded-xl border bg-background",
                            "text-base transition-all duration-200",
                            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                            "placeholder:text-muted-foreground/60",
                            icon && "pl-10",
                            error && "border-destructive focus:ring-destructive/20",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}
            </div>
        );
    }
);
MobileInput.displayName = "MobileInput";

// ============================================================================
// SAFE AREA HELPERS
// ============================================================================

interface SafeAreaProps {
    children: React.ReactNode;
    className?: string;
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
}

export function SafeArea({
    children,
    className,
    top = true,
    bottom = true,
    left = true,
    right = true,
}: SafeAreaProps) {
    return (
        <div
            className={cn("", className)}
            style={{
                paddingTop: top ? "env(safe-area-inset-top)" : undefined,
                paddingBottom: bottom ? "env(safe-area-inset-bottom)" : undefined,
                paddingLeft: left ? "env(safe-area-inset-left)" : undefined,
                paddingRight: right ? "env(safe-area-inset-right)" : undefined,
            }}
        >
            {children}
        </div>
    );
}

// ============================================================================
// MOBILE CARD WITH PRESS STATES
// ============================================================================

interface PressableCardProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

export function PressableCard({
    children,
    onClick,
    className,
    disabled = false,
}: PressableCardProps) {
    return (
        <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            onClick={disabled ? undefined : onClick}
            onKeyDown={(e) => {
                if (!disabled && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onClick?.();
                }
            }}
            className={cn(
                "rounded-xl border bg-card p-4 transition-all duration-150",
                "active:scale-[0.98] active:bg-muted/50",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                "touch-manipulation",
                disabled && "opacity-50 cursor-not-allowed active:scale-100",
                onClick && !disabled && "cursor-pointer hover:shadow-md",
                className
            )}
        >
            {children}
        </div>
    );
}
