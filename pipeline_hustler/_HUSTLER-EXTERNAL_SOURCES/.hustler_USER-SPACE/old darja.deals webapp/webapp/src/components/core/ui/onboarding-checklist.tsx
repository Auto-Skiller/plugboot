"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/ui/button";
import {
    CheckCircle2,
    Circle,
    ChevronDown,
    ChevronUp,
    X,
    Rocket,
    ArrowRight,
    PartyPopper,
} from "lucide-react";

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

interface OnboardingChecklistProps {
    steps?: OnboardingStep[];
    title?: string;
    onComplete?: () => void;
    onDismiss?: () => void;
    className?: string;
    storageKey?: string;
    align?: "start" | "end";
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
// ONBOARDING CHECKLIST
// ============================================================================

export function OnboardingChecklist({
    steps = defaultSteps,
    title = "Getting Started",
    onComplete,
    onDismiss,
    className,
    storageKey = "riglify-onboarding",
    align = "start",
}: OnboardingChecklistProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [localSteps, setLocalSteps] = React.useState<OnboardingStep[]>(steps);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    // Load state from localStorage
    React.useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.completedIds) {
                    setLocalSteps((prev) =>
                        prev.map((step) => ({
                            ...step,
                            completed: parsed.completedIds.includes(step.id),
                        }))
                    );
                }
            } catch (e) {
                console.error("Error loading onboarding state:", e);
            }
        }
    }, [storageKey]);

    // Save state to localStorage
    const saveState = React.useCallback(
        (completedIds: string[]) => {
            localStorage.setItem(storageKey, JSON.stringify({ completedIds }));
        },
        [storageKey]
    );

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

    const handleComplete = () => {
        onComplete?.();
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 300);
    };

    return (
        <div
            className={cn("relative", className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Trigger Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "gap-2 h-9",
                    !isAllComplete && "border-primary/50 bg-primary/5"
                )}
            >
                {isAllComplete ? (
                    <PartyPopper className="h-4 w-4 text-green-500" />
                ) : (
                    <Rocket className="h-4 w-4 text-primary" />
                )}
                <span className="hidden sm:inline">
                    {isAllComplete ? "Setup Complete!" : title}
                </span>
                <span className="text-xs text-muted-foreground">
                    {completedCount}/{totalCount}
                </span>
                {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                ) : (
                    <ChevronDown className="h-4 w-4" />
                )}
            </Button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className={cn(
                        "absolute top-full mt-2 w-80 sm:w-96 bg-card border rounded-xl shadow-xl z-50 overflow-hidden",
                        align === "start" ? "left-0" : "right-0"
                    )}>
                        {/* Header */}
                        <div className="px-4 py-3 border-b bg-muted/30">
                            <h3 className="font-semibold">{title}</h3>
                            {/* Progress Bar */}
                            <div className="mt-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                    <span>{completedCount} of {totalCount} completed</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>


                        {/* Steps List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {localSteps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className={cn(
                                        "flex items-start gap-3 px-4 py-3 border-b last:border-0",
                                        step.completed && "opacity-60"
                                    )}
                                >
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => !step.completed && handleStepComplete(step.id)}
                                        className={cn(
                                            "shrink-0 mt-0.5 transition-colors",
                                            step.completed
                                                ? "text-green-500"
                                                : "text-muted-foreground hover:text-primary"
                                        )}
                                        disabled={step.completed}
                                    >
                                        {step.completed ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : (
                                            <Circle className="h-5 w-5" />
                                        )}
                                    </button>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={cn(
                                                "text-sm font-medium",
                                                step.completed && "line-through"
                                            )}
                                        >
                                            {step.title}
                                        </p>
                                        {step.description && !step.completed && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {step.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action */}
                                    {!step.completed && step.href && (
                                        <Link
                                            href={step.href}
                                            className="shrink-0 text-primary hover:underline text-sm flex items-center gap-1"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Start
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        {isAllComplete && (
                            <div className="px-4 py-3 border-t bg-green-50 dark:bg-green-950/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                        <PartyPopper className="h-5 w-5" />
                                        <span className="text-sm font-medium">All done! Great job!</span>
                                    </div>
                                    <Button size="sm" onClick={handleComplete}>
                                        Dismiss
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )
            }
        </div >
    );
}

// ============================================================================
// ONBOARDING BANNER (alternative compact version)
// ============================================================================

interface OnboardingBannerProps {
    steps?: OnboardingStep[];
    onDismiss?: () => void;
    className?: string;
}

export function OnboardingBanner({
    steps = defaultSteps,
    onDismiss,
    className,
}: OnboardingBannerProps) {
    const completedCount = steps.filter((s) => s.completed).length;
    const totalCount = steps.length;
    const progress = (completedCount / totalCount) * 100;
    const nextStep = steps.find((s) => !s.completed);

    if (completedCount === totalCount) return null;

    return (
        <div
            className={cn(
                "flex items-center gap-4 p-4 rounded-lg border bg-primary/5 border-primary/20",
                className
            )}
        >
            <Rocket className="h-8 w-8 text-primary shrink-0" />

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                    Complete your setup ({completedCount}/{totalCount})
                </p>
                {nextStep && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Next: {nextStep.title}
                    </p>
                )}
                {/* Progress bar */}
                <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {nextStep?.href && (
                <Button size="sm" asChild>
                    <Link href={nextStep.href}>Continue</Link>
                </Button>
            )}

            <button onClick={onDismiss} className="p-1 hover:bg-muted rounded shrink-0">
                <X className="h-4 w-4 text-muted-foreground" />
            </button>
        </div>
    );
}

// ============================================================================
// ONBOARDING CHECKLIST INLINE (for use in BottomPanel)
// ============================================================================

interface OnboardingChecklistInlineProps {
    steps?: OnboardingStep[];
    title?: string;
    onComplete?: () => void;
    className?: string;
    storageKey?: string;
}

export function OnboardingChecklistInline({
    steps = defaultSteps,
    title = "Getting Started",
    onComplete,
    className,
    storageKey = "riglify-onboarding",
}: OnboardingChecklistInlineProps) {
    const [localSteps, setLocalSteps] = React.useState<OnboardingStep[]>(steps);

    // Load state from localStorage
    React.useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.completedIds) {
                    setLocalSteps((prev) =>
                        prev.map((step) => ({
                            ...step,
                            completed: parsed.completedIds.includes(step.id),
                        }))
                    );
                }
            } catch (e) {
                console.error("Error loading onboarding state:", e);
            }
        }
    }, [storageKey]);

    // Save state to localStorage
    const saveState = React.useCallback(
        (completedIds: string[]) => {
            localStorage.setItem(storageKey, JSON.stringify({ completedIds }));
        },
        [storageKey]
    );

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

    const handleComplete = () => {
        onComplete?.();
    };

    return (
        <div className={cn("w-full", className)}>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Rocket className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-semibold">{title}</h2>
                </div>
                {/* Progress Bar */}
                <div className="mt-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span>{completedCount} of {totalCount} completed</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localSteps.map((step) => (
                    <div
                        key={step.id}
                        className={cn(
                            "p-4 rounded-xl border transition-all",
                            step.completed
                                ? "bg-green-500/10 border-green-500/30"
                                : "bg-muted/30 border-border hover:border-primary/50"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <button
                                onClick={() => !step.completed && handleStepComplete(step.id)}
                                className={cn(
                                    "shrink-0 mt-0.5 transition-colors",
                                    step.completed
                                        ? "text-green-500"
                                        : "text-muted-foreground hover:text-primary"
                                )}
                                disabled={step.completed}
                            >
                                {step.completed ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                    <Circle className="h-5 w-5" />
                                )}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p
                                    className={cn(
                                        "text-sm font-medium",
                                        step.completed && "line-through text-muted-foreground"
                                    )}
                                >
                                    {step.title}
                                </p>
                                {step.description && !step.completed && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {step.description}
                                    </p>
                                )}
                                {/* Action */}
                                {!step.completed && step.href && (
                                    <Link
                                        href={step.href}
                                        className="inline-flex items-center gap-1 mt-2 text-primary hover:underline text-sm"
                                    >
                                        Start
                                        <ArrowRight className="h-3 w-3" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            {isAllComplete && (
                <div className="mt-6 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-500/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <PartyPopper className="h-5 w-5" />
                            <span className="font-medium">All done! Great job!</span>
                        </div>
                        <Button size="sm" onClick={handleComplete}>
                            Dismiss
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
