"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion, Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// ============================================================================
// REDUCED MOTION HOOK
// ============================================================================

export function useAnimationConfig() {
    const shouldReduceMotion = useReducedMotion();

    return {
        shouldAnimate: !shouldReduceMotion,
        duration: shouldReduceMotion ? 0 : undefined,
        transition: shouldReduceMotion ? { duration: 0 } : undefined,
    };
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

export const fadeVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export const slideUpVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};

export const slideRightVariants: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
};

export const scaleVariants: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
};

export const springTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
};

export const smoothTransition = {
    duration: 0.3,
    ease: "easeOut" as const,
};

// ============================================================================
// PAGE TRANSITION WRAPPER
// ============================================================================

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
    variant?: "fade" | "slide" | "slideUp" | "scale" | "none";
}

const pageVariants = {
    fade: fadeVariants,
    slide: slideRightVariants,
    slideUp: slideUpVariants,
    scale: scaleVariants,
    none: { initial: {}, animate: {}, exit: {} },
};

export function PageTransition({
    children,
    className,
    variant = "fade",
}: PageTransitionProps) {
    const pathname = usePathname();
    const { shouldAnimate } = useAnimationConfig();
    const selectedVariant = pageVariants[variant];

    if (!shouldAnimate) {
        return <div className={className}>{children}</div>;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                variants={selectedVariant}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={smoothTransition}
                className={className}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

// ============================================================================
// STAGGERED LIST ANIMATION
// ============================================================================

interface StaggeredListProps {
    children: React.ReactNode[];
    className?: string;
    staggerDelay?: number;
    direction?: "up" | "down" | "left" | "right";
}

export function StaggeredList({
    children,
    className,
    staggerDelay = 0.05,
    direction = "up",
}: StaggeredListProps) {
    const { shouldAnimate } = useAnimationConfig();

    const offsets = {
        up: { y: 15 },
        down: { y: -15 },
        left: { x: 15 },
        right: { x: -15 },
    };

    if (!shouldAnimate) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div className={className}>
            {React.Children.map(children, (child, index) => (
                <motion.div
                    initial={{ opacity: 0, ...offsets[direction] }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{
                        delay: index * staggerDelay,
                        ...smoothTransition,
                    }}
                >
                    {child}
                </motion.div>
            ))}
        </div>
    );
}

// ============================================================================
// FADE IN VIEW (animate when scrolled into view)
// ============================================================================

interface FadeInViewProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    once?: boolean;
}

const directionOffset = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
    none: {},
};

export function FadeInView({
    children,
    className,
    delay = 0,
    direction = "up",
    once = true,
}: FadeInViewProps) {
    const { shouldAnimate } = useAnimationConfig();
    const offset = directionOffset[direction];

    if (!shouldAnimate) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, ...offset }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once, margin: "-50px" }}
            transition={{ delay, ...smoothTransition }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ============================================================================
// ANIMATED COUNTER
// ============================================================================

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
    formatter?: (value: number) => string;
}

export function AnimatedCounter({
    value,
    duration = 1,
    className,
    prefix = "",
    suffix = "",
    formatter = (v) => v.toLocaleString(),
}: AnimatedCounterProps) {
    const { shouldAnimate } = useAnimationConfig();
    const [displayValue, setDisplayValue] = React.useState(shouldAnimate ? 0 : value);

    React.useEffect(() => {
        if (!shouldAnimate) {
            setDisplayValue(value);
            return;
        }

        const startTime = Date.now();
        const startValue = displayValue;
        const diff = value - startValue;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startValue + diff * eased;

            setDisplayValue(Math.round(current));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration, shouldAnimate]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <span className={className}>
            {prefix}
            {formatter(displayValue)}
            {suffix}
        </span>
    );
}

// ============================================================================
// HOVER SCALE
// ============================================================================

interface HoverScaleProps {
    children: React.ReactNode;
    className?: string;
    scale?: number;
    disabled?: boolean;
}

export function HoverScale({
    children,
    className,
    scale = 1.02,
    disabled = false,
}: HoverScaleProps) {
    const { shouldAnimate } = useAnimationConfig();

    if (!shouldAnimate || disabled) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            whileHover={{ scale }}
            whileTap={{ scale: 0.98 }}
            transition={springTransition}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ============================================================================
// CARD REVEAL (for dashboard cards)
// ============================================================================

interface CardRevealProps {
    children: React.ReactNode;
    index?: number;
    className?: string;
}

export function CardReveal({ children, index = 0, className }: CardRevealProps) {
    const { shouldAnimate } = useAnimationConfig();

    if (!shouldAnimate) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                delay: index * 0.08,
                ...smoothTransition,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ============================================================================
// SCROLL PROGRESS BAR
// ============================================================================

interface ScrollProgressProps {
    className?: string;
    color?: string;
}

export function ScrollProgress({ className, color = "hsl(var(--primary))" }: ScrollProgressProps) {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
        const updateProgress = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.scrollY;
            setProgress(scrollHeight > 0 ? scrolled / scrollHeight : 0);
        };

        window.addEventListener("scroll", updateProgress, { passive: true });
        return () => window.removeEventListener("scroll", updateProgress);
    }, []);

    return (
        <motion.div
            className={cn("fixed top-0 left-0 right-0 h-1 z-50 origin-left", className)}
            style={{ backgroundColor: color, scaleX: progress }}
        />
    );
}

// ============================================================================
// PULSE ANIMATION
// ============================================================================

interface PulseProps {
    children: React.ReactNode;
    className?: string;
    duration?: number;
}

export function Pulse({ children, className, duration = 2 }: PulseProps) {
    const { shouldAnimate } = useAnimationConfig();

    if (!shouldAnimate) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ============================================================================
// SHIMMER EFFECT
// ============================================================================

interface ShimmerProps {
    className?: string;
    duration?: number;
}

export function Shimmer({ className, duration = 1.5 }: ShimmerProps) {
    const { shouldAnimate } = useAnimationConfig();

    return (
        <div className={cn("relative overflow-hidden bg-muted rounded", className)}>
            {shouldAnimate && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                        repeat: Infinity,
                        duration,
                        ease: "linear",
                    }}
                />
            )}
        </div>
    );
}

// ============================================================================
// BLUR IN
// ============================================================================

interface BlurInProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export function BlurIn({ children, className, delay = 0 }: BlurInProps) {
    const { shouldAnimate } = useAnimationConfig();

    if (!shouldAnimate) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ delay, duration: 0.5 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ============================================================================
// CONFETTI (success celebration)
// ============================================================================

interface ConfettiProps {
    isActive: boolean;
    duration?: number;
}

export function Confetti({ isActive, duration = 3000 }: ConfettiProps) {
    const { shouldAnimate } = useAnimationConfig();
    const [particles, setParticles] = React.useState<Array<{ id: number; x: number; color: string }>>([]);

    React.useEffect(() => {
        if (!isActive || !shouldAnimate) return;

        const colors = ["#3b82f6", "#22c55e", "#a855f7", "#f97316", "#ec4899", "#eab308"];
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            color: colors[Math.floor(Math.random() * colors.length)],
        }));
        setParticles(newParticles);

        const timer = setTimeout(() => setParticles([]), duration);
        return () => clearTimeout(timer);
    }, [isActive, duration, shouldAnimate]);

    if (!particles.length) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute w-3 h-3 rounded-sm"
                    style={{ left: `${particle.x}%`, backgroundColor: particle.color }}
                    initial={{ y: -20, rotate: 0, opacity: 1 }}
                    animate={{
                        y: window.innerHeight + 20,
                        rotate: Math.random() * 720 - 360,
                        opacity: 0,
                    }}
                    transition={{
                        duration: 2 + Math.random(),
                        ease: "easeOut",
                    }}
                />
            ))}
        </div>
    );
}
