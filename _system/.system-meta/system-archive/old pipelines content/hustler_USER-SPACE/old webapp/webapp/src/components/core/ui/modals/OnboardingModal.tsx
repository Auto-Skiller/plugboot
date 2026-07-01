"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { X, Rocket, PartyPopper, CheckCircle2, Circle, ArrowRight } from "lucide-react";

export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    href: string;
    completed: boolean;
}

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    progress: number;
    steps: OnboardingStep[];
    completedCount: number;
    totalCount: number;
    isComplete: boolean;
    onStepComplete: (stepId: string) => void;
}

export function OnboardingModal({
    isOpen,
    onClose,
    progress,
    steps,
    completedCount,
    totalCount,
    isComplete,
    onStepComplete
}: OnboardingModalProps) {
    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[80]"
                onClick={onClose}
            />
            <div className="fixed right-4 top-20 w-[400px] z-[90] animate-in slide-in-from-right-10 fade-in-0">
                <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Rocket className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Getting Started</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-muted rounded"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-4 py-3 border-b border-border">
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

                    {/* Steps List */}
                    <div className="max-h-[60vh] overflow-y-auto p-2">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={cn(
                                    "flex items-start gap-3 px-3 py-3 rounded-lg transition-colors",
                                    step.completed ? "opacity-60" : "hover:bg-muted"
                                )}
                            >
                                <button
                                    onClick={() => !step.completed && onStepComplete(step.id)}
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
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-sm font-medium",
                                        step.completed && "line-through"
                                    )}>
                                        {step.title}
                                    </p>
                                    {step.description && !step.completed && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                                {!step.completed && step.href && (
                                    <Link
                                        href={step.href}
                                        className="shrink-0 text-primary hover:underline text-sm flex items-center gap-1"
                                        onClick={onClose}
                                    >
                                        Start
                                        <ArrowRight className="h-3 w-3" />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    {isComplete && (
                        <div className="px-4 py-3 border-t bg-green-50 dark:bg-green-950/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <PartyPopper className="h-5 w-5" />
                                    <span className="text-sm font-medium">All done! Great job!</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
