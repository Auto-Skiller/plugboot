"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/ui/button";
import {
    CheckCircle2,
    Circle,
    X,
    Rocket,
    ChevronDown,
    ChevronUp,
    Minimize2,
    Maximize2,
} from "lucide-react";
import { motion } from "framer-motion";

// ============================================================================
// TYPES
// ============================================================================

interface OnboardingStep {
    id: string;
    title: string;
    description?: string;
    href?: string;
    action?: () => void;
    completed: boolean;
}

interface FloatingOnboardingWidgetProps {
    steps?: OnboardingStep[];
    title?: string;
    onComplete?: () => void;
    onDismiss?: () => void;
    storageKey?: string;
}

// ============================================================================
// DEFAULT STEPS
// ============================================================================

const defaultSteps: OnboardingStep[] = [
    {
        id: "profile",
        title: "Complete your profile",
        description: "Add your business information and logo",
        href: "/settings/profile",
        completed: false,
    },
    {
        id: "product",
        title: "Add your first product",
        description: "Create a product to start selling",
        href: "/ecom/inventory",
        completed: false,
    },
    {
        id: "delivery",
        title: "Set up delivery zones",
        description: "Configure shipping areas and prices",
        href: "/settings",
        completed: false,
    },
    {
        id: "payment",
        title: "Configure payment methods",
        description: "Set up COD and other payment options",
        href: "/settings",
        completed: false,
    },
    {
        id: "campaign",
        title: "Launch your first campaign",
        description: "Create a marketing campaign to get orders",
        href: "/marketing/campaigns/messaging",
        completed: false,
    },
];

// ============================================================================
// FLOATING ONBOARDING WIDGET
// ============================================================================

export function FloatingOnboardingWidget({
    steps = defaultSteps,
    title = "Getting Started",
    onComplete,
    onDismiss,
    storageKey = "riglify-onboarding-float",
}: FloatingOnboardingWidgetProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isDismissed, setIsDismissed] = React.useState(false);
    const [localSteps, setLocalSteps] = React.useState<OnboardingStep[]>(steps);

    // Position persistence
    const positionKey = `${storageKey}-position`;
    const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Calculate popup direction based on position
    const [popupDirection, setPopupDirection] = React.useState<{
        vertical: 'top' | 'bottom';
        horizontal: 'left' | 'right';
    }>({ vertical: 'top', horizontal: 'left' });

    // Visibility and hover state
    const VISIBILITY_KEY = `${storageKey}-visible`;
    const [isVisible, setIsVisible] = React.useState(true);
    const [isHovered, setIsHovered] = React.useState(false);
    const dragStartPos = React.useRef<{ x: number; y: number } | null>(null);

    // Track drag start to distinguish from click
    const handleDragStart = (_event: any, info: any) => {
        dragStartPos.current = { x: info.point.x, y: info.point.y };
    };

    // Handle click - only open if not dragged  
    const handleClick = () => {
        if (!dragStartPos.current) {
            setIsExpanded(!isExpanded);
            return;
        }

        const currentPos = containerRef.current?.getBoundingClientRect();
        if (currentPos && dragStartPos.current) {
            const distance = Math.sqrt(
                Math.pow(currentPos.x - dragStartPos.current.x, 2) +
                Math.pow(currentPos.y - dragStartPos.current.y, 2)
            );
            if (distance < 5) {
                setIsExpanded(!isExpanded);
            }
        }
        dragStartPos.current = null;
    };

    // Handle hide widget
    const handleHide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible(false);
        localStorage.setItem(VISIBILITY_KEY, JSON.stringify(false));
    };

    // Load position from localStorage
    React.useEffect(() => {
        const savedPos = localStorage.getItem(positionKey);
        if (savedPos) {
            try {
                const parsed = JSON.parse(savedPos);
                setPosition({ x: parsed.x, y: parsed.y });
            } catch (e) {
                console.error("Error loading position:", e);
            }
        }
    }, [positionKey]);

    // Calculate popup direction when position changes or on mount
    React.useEffect(() => {
        const updateDirection = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                // Determine horizontal direction
                const horizontal = rect.left > viewportWidth / 2 ? 'left' : 'right';
                // Determine vertical direction
                const vertical = rect.top > viewportHeight / 2 ? 'top' : 'bottom';

                setPopupDirection({ vertical, horizontal });
            }
        };

        updateDirection();
        window.addEventListener('resize', updateDirection);
        return () => window.removeEventListener('resize', updateDirection);
    }, [position]);

    // Save position on drag end
    const handleDragEnd = (_event: any, info: any) => {
        const newPos = { x: info.point.x, y: info.point.y };
        localStorage.setItem(positionKey, JSON.stringify(newPos));
        setPosition(newPos);
    };

    // Load state from localStorage
    React.useEffect(() => {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.completedIds) {
                    setLocalSteps((prev) =>
                        prev.map((step) => ({
                            ...step,
                            completed: parsed.completedIds.includes(step.id),
                        }))
                    );
                }
                if (parsed.dismissed) {
                    setIsDismissed(true);
                }
            } catch (e) {
                console.error("Error loading onboarding state:", e);
            }
        }
    }, [storageKey]);

    // Save state to localStorage
    const saveState = React.useCallback(
        (completedIds: string[], dismissed: boolean = false) => {
            localStorage.setItem(storageKey, JSON.stringify({ completedIds, dismissed }));
        },
        [storageKey]
    );

    // Listen for toggle events from profile menu
    React.useEffect(() => {
        const handleToggle = () => {
            const saved = localStorage.getItem(VISIBILITY_KEY);
            if (saved !== null) setIsVisible(JSON.parse(saved));
        };
        window.addEventListener('toggle-onboarding-widget', handleToggle);
        return () => window.removeEventListener('toggle-onboarding-widget', handleToggle);
    }, [VISIBILITY_KEY]);

    const completedCount = localSteps.filter((s) => s.completed).length;
    const totalCount = localSteps.length;
    const progress = (completedCount / totalCount) * 100;
    const isAllComplete = completedCount === totalCount;

    const handleStepComplete = (stepId: string) => {
        setLocalSteps((prev) => {
            const updated = prev.map((step) =>
                step.id === stepId ? { ...step, completed: true } : step
            );
            saveState(updated.filter((s) => s.completed).map((s) => s.id));
            return updated;
        });
    };

    const handleDismiss = () => {
        setIsDismissed(true);
        saveState(localSteps.filter((s) => s.completed).map((s) => s.id), true);
        onDismiss?.();
    };

    // if (isDismissed || isAllComplete) return null;

    // Don't show if hidden by user
    if (!isVisible) return null;

    // Progress ring calculation
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // Neon Glass Orb Style
    return (
        <motion.div
            ref={containerRef}
            drag
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed top-20 right-6 z-[9999] flex flex-col items-end gap-4"
            style={position ? { x: 0, y: 0 } : undefined}
            initial={position ? { x: position.x - window.innerWidth + 80, y: position.y - 100 } : false}
        >
            {/* Expanded Panel - Glass Card with Smart Positioning */}
            {isExpanded && (
                <div
                    className={cn(
                        "w-80 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in-0 duration-200",
                        popupDirection.vertical === 'top' ? "absolute bottom-full mb-4" : "absolute top-full mt-4",
                        popupDirection.horizontal === 'left' ? "right-0" : "left-0"
                    )}
                >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Rocket className="h-4 w-4 text-green-400" />
                            <h3 className="font-semibold text-sm text-white">{title}</h3>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-1 hover:bg-white/10 rounded transition-colors text-zinc-400 hover:text-white"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-5 py-4 bg-black/40 border-b border-white/5">
                        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                            <span>{completedCount} of {totalCount} completed</span>
                            <span className="text-green-400 font-medium">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Steps List */}
                    <div className="max-h-64 overflow-y-auto">
                        {localSteps.map((step) => (
                            <div
                                key={step.id}
                                className={cn(
                                    "flex items-start gap-3 px-5 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group",
                                    step.completed && "opacity-50"
                                )}
                            >
                                {/* Checkbox */}
                                <button
                                    onClick={() => !step.completed && handleStepComplete(step.id)}
                                    className={cn(
                                        "shrink-0 mt-0.5 transition-all duration-200",
                                        step.completed
                                            ? "text-green-500"
                                            : "text-zinc-500 group-hover:text-green-400"
                                    )}
                                    disabled={step.completed}
                                >
                                    {step.completed ? (
                                        <CheckCircle2 className="h-5 w-5 fill-green-500/10" />
                                    ) : (
                                        <Circle className="h-5 w-5" />
                                    )}
                                </button>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={cn(
                                            "text-sm font-medium transition-colors",
                                            step.completed ? "text-zinc-500 line-through" : "text-zinc-200 group-hover:text-white"
                                        )}
                                    >
                                        {step.title}
                                    </p>
                                    {step.description && !step.completed && (
                                        <p className="text-xs text-zinc-500 mt-0.5 group-hover:text-zinc-400">
                                            {step.description}
                                        </p>
                                    )}
                                </div>

                                {/* Action */}
                                {!step.completed && step.href && (
                                    <a
                                        href={step.href}
                                        className="shrink-0 text-green-400 hover:text-green-300 hover:underline text-xs font-medium"
                                    >
                                        Start
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-white/10 bg-white/5 flex justify-end">
                        <Button size="sm" variant="ghost" onClick={handleDismiss} className="text-zinc-400 hover:text-white hover:bg-white/5">
                            Dismiss
                        </Button>
                    </div>
                </div>
            )}

            {/* Neon Glass Orb Button */}
            <button
                onClick={handleClick}
                className="relative w-16 h-16 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:bg-black/70 hover:scale-105 transition-all duration-300 flex items-center justify-center group"
                title={`${completedCount}/${totalCount} tasks completed`}
            >
                {/* Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 p-1">
                    <circle
                        cx="50%"
                        cy="50%"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        className="text-white/5"
                    />
                    <circle
                        cx="50%"
                        cy="50%"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 - (progress / 100) * (2 * Math.PI * 28)}
                        className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] transition-all duration-500"
                        strokeLinecap="round"
                    />
                </svg>

                {/* Internal Glow Gradient */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />

                {/* Icon */}
                <Rocket className="h-7 w-7 text-green-400 relative z-10 group-hover:text-white transition-colors drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]" />

                {/* Badge */}
                {totalCount - completedCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-black shadow-lg">
                        {totalCount - completedCount}
                    </span>
                )}
            </button>

            {/* Close Button on Hover */}
            {isHovered && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={handleHide}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
                    title="Hide widget"
                >
                    <X className="h-3 w-3 text-white" />
                </motion.button>
            )}
        </motion.div>
    );
}
