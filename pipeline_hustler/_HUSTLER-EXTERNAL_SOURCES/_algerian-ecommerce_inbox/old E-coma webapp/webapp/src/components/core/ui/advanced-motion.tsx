"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, RotateCcw } from "lucide-react";

// ============================================================================
// ADVANCED MOTION HOOK
// ============================================================================

export function useAdvancedMotion() {
    const prefersReducedMotion = useReducedMotion();

    return {
        shouldAnimate: !prefersReducedMotion,
        getTransition: (duration: number = 0.3) =>
            prefersReducedMotion ? { duration: 0 } : { duration, ease: "easeOut" as const },
    };
}

// ============================================================================
// SCROLL-TRIGGERED ANIMATIONS
// ============================================================================

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "scale";
    threshold?: number;
    once?: boolean;
}

export function ScrollReveal({
    children,
    className,
    delay = 0,
    direction = "up",
    threshold = 0.1,
    once = true,
}: ScrollRevealProps) {
    const { shouldAnimate, getTransition } = useAdvancedMotion();

    const directionVariants = {
        up: { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } },
        down: { initial: { opacity: 0, y: -40 }, animate: { opacity: 1, y: 0 } },
        left: { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 } },
        right: { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 } },
        scale: { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } },
    };

    if (!shouldAnimate) return <div className={className}>{children}</div>;

    return (
        <motion.div
            initial={directionVariants[direction].initial}
            whileInView={directionVariants[direction].animate}
            viewport={{ once, amount: threshold }}
            transition={{ delay, ...getTransition(0.5) }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ============================================================================
// STAGGERED BAR REVEAL (for charts)
// ============================================================================

interface StaggeredBarsProps {
    children: React.ReactNode[];
    className?: string;
    staggerDelay?: number;
}

export function StaggeredBars({
    children,
    className,
    staggerDelay = 0.08,
}: StaggeredBarsProps) {
    const { shouldAnimate, getTransition } = useAdvancedMotion();

    if (!shouldAnimate) return <div className={className}>{children}</div>;

    return (
        <div className={className}>
            {React.Children.map(children, (child, index) => (
                <motion.div
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ delay: index * staggerDelay, ...getTransition(0.4) }}
                    style={{ originY: 1 }}
                >
                    {child}
                </motion.div>
            ))}
        </div>
    );
}

// ============================================================================
// ANIMATED NUMBER TICKER
// ============================================================================

interface NumberTickerProps {
    value: number;
    duration?: number;
    className?: string;
    formatOptions?: Intl.NumberFormatOptions;
    prefix?: string;
    suffix?: string;
}

export function NumberTicker({
    value,
    duration = 1.5,
    className,
    formatOptions,
    prefix = "",
    suffix = "",
}: NumberTickerProps) {
    const { shouldAnimate } = useAdvancedMotion();
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => {
        const formatted = new Intl.NumberFormat("fr-DZ", formatOptions).format(Math.round(latest));
        return `${prefix}${formatted}${suffix}`;
    });
    const [displayValue, setDisplayValue] = React.useState(`${prefix}0${suffix}`);

    React.useEffect(() => {
        if (!shouldAnimate) {
            setDisplayValue(`${prefix}${new Intl.NumberFormat("fr-DZ", formatOptions).format(value)}${suffix}`);
            return;
        }

        const unsubscribe = rounded.on("change", setDisplayValue);
        const controls = animate(count, value, { duration, ease: "easeOut" });

        return () => {
            unsubscribe();
            controls.stop();
        };
    }, [value, duration, shouldAnimate, count, rounded, formatOptions, prefix, suffix]); // eslint-disable-line react-hooks/exhaustive-deps

    return <span className={className}>{displayValue}</span>;
}

// ============================================================================
// SKELETON TO CONTENT TRANSITION
// ============================================================================

interface SkeletonToContentProps {
    isLoading: boolean;
    skeleton: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export function SkeletonToContent({
    isLoading,
    skeleton,
    children,
    className,
}: SkeletonToContentProps) {
    const { shouldAnimate, getTransition } = useAdvancedMotion();

    if (!shouldAnimate) return <div className={className}>{isLoading ? skeleton : children}</div>;

    return (
        <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div
                    key="skeleton"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={getTransition(0.2)}
                    className={className}
                >
                    {skeleton}
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={getTransition(0.3)}
                    className={className}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ============================================================================
// SWIPE GESTURE HANDLER
// ============================================================================

interface SwipeableProps {
    children: React.ReactNode;
    className?: string;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    threshold?: number;
}

export function Swipeable({
    children,
    className,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
}: SwipeableProps) {
    const { shouldAnimate } = useAdvancedMotion();

    if (!shouldAnimate) return <div className={className}>{children}</div>;

    return (
        <motion.div
            className={cn("touch-pan-y", className)}
            drag
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
                const { offset, velocity } = info;

                if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 500) {
                    if (offset.x > 0) onSwipeRight?.();
                    else onSwipeLeft?.();
                }

                if (Math.abs(offset.y) > threshold || Math.abs(velocity.y) > 500) {
                    if (offset.y > 0) onSwipeDown?.();
                    else onSwipeUp?.();
                }
            }}
        >
            {children}
        </motion.div>
    );
}

// ============================================================================
// PULL TO REFRESH
// ============================================================================

interface PullToRefreshProps {
    children: React.ReactNode;
    onRefresh: () => Promise<void>;
    className?: string;
    threshold?: number;
}

export function PullToRefresh({
    children,
    onRefresh,
    className,
    threshold = 80,
}: PullToRefreshProps) {
    const { shouldAnimate } = useAdvancedMotion();
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [pullDistance, setPullDistance] = React.useState(0);

    const handleDragEnd = async () => {
        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }
        setPullDistance(0);
    };

    if (!shouldAnimate) return <div className={className}>{children}</div>;

    return (
        <motion.div
            className={cn("relative", className)}
            drag="y"
            dragConstraints={{ top: 0, bottom: threshold * 1.2 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDrag={(_, info) => setPullDistance(Math.max(0, info.offset.y))}
            onDragEnd={handleDragEnd}
        >
            {/* Pull indicator */}
            <div
                className="absolute top-0 left-0 right-0 flex justify-center items-center overflow-hidden transition-all"
                style={{ height: pullDistance, marginTop: -pullDistance }}
            >
                <motion.div
                    animate={{ rotate: isRefreshing ? 360 : pullDistance * 3 }}
                    transition={{ duration: isRefreshing ? 1 : 0, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                >
                    <RotateCcw className={cn("h-6 w-6 text-primary", isRefreshing && "animate-spin")} />
                </motion.div>
            </div>
            {children}
        </motion.div>
    );
}

// ============================================================================
// ANIMATED KPI CARD
// ============================================================================

interface AnimatedKPIProps {
    title: string;
    value: number;
    previousValue?: number;
    prefix?: string;
    suffix?: string;
    icon?: React.ReactNode;
    trend?: "up" | "down" | "neutral";
    formatOptions?: Intl.NumberFormatOptions;
    className?: string;
    index?: number;
}

export function AnimatedKPI({
    title,
    value,
    previousValue,
    prefix = "",
    suffix = "",
    icon,
    trend,
    formatOptions,
    className,
    index = 0,
}: AnimatedKPIProps) {
    const { shouldAnimate, getTransition } = useAdvancedMotion();

    const change = previousValue ? ((value - previousValue) / previousValue) * 100 : null;
    const actualTrend = trend || (change ? (change > 0 ? "up" : change < 0 ? "down" : "neutral") : "neutral");

    const content = (
        <div className={cn("p-4 rounded-xl border bg-card hover:shadow-lg transition-shadow", className)}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{title}</span>
                {icon && <span className="text-muted-foreground">{icon}</span>}
            </div>
            <div className="flex items-end gap-2">
                <NumberTicker
                    value={value}
                    prefix={prefix}
                    suffix={suffix}
                    formatOptions={formatOptions}
                    className="text-2xl font-bold"
                />
                {change !== null && (
                    <span className={cn(
                        "flex items-center text-xs font-medium pb-1",
                        actualTrend === "up" ? "text-green-500" : actualTrend === "down" ? "text-red-500" : "text-muted-foreground"
                    )}>
                        {actualTrend === "up" ? <TrendingUp className="h-3 w-3 mr-0.5" /> :
                            actualTrend === "down" ? <TrendingDown className="h-3 w-3 mr-0.5" /> : null}
                        {Math.abs(change).toFixed(1)}%
                    </span>
                )}
            </div>
        </div>
    );

    if (!shouldAnimate) return content;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, ...getTransition(0.4) }}
        >
            {content}
        </motion.div>
    );
}

// ============================================================================
// CHART MORPH ANIMATION (for data changes)
// ============================================================================

interface MorphingNumberProps {
    value: number;
    className?: string;
}

export function MorphingNumber({ value, className }: MorphingNumberProps) {
    const { shouldAnimate } = useAdvancedMotion();
    const [displayValue, setDisplayValue] = React.useState(value);
    const [isAnimating, setIsAnimating] = React.useState(false);

    React.useEffect(() => {
        if (!shouldAnimate || value === displayValue) {
            setDisplayValue(value);
            return;
        }

        setIsAnimating(true);
        const timer = setTimeout(() => {
            setDisplayValue(value);
            setIsAnimating(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [value, shouldAnimate]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <motion.span
            className={cn("inline-block", className)}
            animate={{
                scale: isAnimating ? [1, 1.2, 1] : 1,
                color: isAnimating ? ["inherit", "hsl(var(--primary))", "inherit"] : "inherit",
            }}
            transition={{ duration: 0.3 }}
        >
            {displayValue.toLocaleString()}
        </motion.span>
    );
}

// ============================================================================
// EXIT ANIMATION WRAPPER
// ============================================================================

interface ExitAnimatedProps {
    children: React.ReactNode;
    isVisible: boolean;
    className?: string;
    direction?: "fade" | "slide" | "scale";
}

export function ExitAnimated({
    children,
    isVisible,
    className,
    direction = "fade",
}: ExitAnimatedProps) {
    const { shouldAnimate, getTransition } = useAdvancedMotion();

    const variants = {
        fade: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
        },
        slide: {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 20 },
        },
        scale: {
            initial: { opacity: 0, scale: 0.8 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.8 },
        },
    };

    if (!shouldAnimate) return isVisible ? <div className={className}>{children}</div> : null;

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    className={className}
                    variants={variants[direction]}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={getTransition(0.2)}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ============================================================================
// TOAST WITH EXIT ANIMATION
// ============================================================================

interface AnimatedToastProps {
    children: React.ReactNode;
    isVisible: boolean;
    position?: "top" | "bottom";
    className?: string;
}

export function AnimatedToast({
    children,
    isVisible,
    position = "bottom",
    className,
}: AnimatedToastProps) {
    const { shouldAnimate, getTransition } = useAdvancedMotion();

    const y = position === "top" ? -100 : 100;

    if (!shouldAnimate) return isVisible ? <div className={className}>{children}</div> : null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={className}
                    initial={{ opacity: 0, y, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y, scale: 0.9 }}
                    transition={getTransition(0.3)}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
