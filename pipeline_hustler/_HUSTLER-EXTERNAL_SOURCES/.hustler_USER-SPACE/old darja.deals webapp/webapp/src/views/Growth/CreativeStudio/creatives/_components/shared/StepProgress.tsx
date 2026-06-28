"use client";

import { cn } from "@/lib/utils";
import { Check, LucideIcon } from "lucide-react";

interface Step {
    id: string;
    title: string;
    icon?: LucideIcon;
}

interface StepProgressProps {
    steps: Step[];
    currentStep: number;
    className?: string;
}

/**
 * StepProgress - Visual progress indicator for multi-step flows
 */
export function StepProgress({ steps, currentStep, className }: StepProgressProps) {
    return (
        <div className={cn("flex items-center", className)} role="navigation" aria-label="Progress">
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const Icon = step.icon;

                return (
                    <div key={step.id} className="flex items-center">
                        {/* Step Circle */}
                        <div
                            className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                                isCompleted && "bg-primary border-primary text-primary-foreground",
                                isCurrent && "border-primary bg-primary/10 text-primary",
                                !isCompleted && !isCurrent && "border-muted bg-muted/30 text-muted-foreground"
                            )}
                            aria-current={isCurrent ? "step" : undefined}
                        >
                            {isCompleted ? (
                                <Check className="h-4 w-4" aria-hidden="true" />
                            ) : Icon ? (
                                <Icon className="h-4 w-4" aria-hidden="true" />
                            ) : (
                                <span className="text-xs font-medium">{index + 1}</span>
                            )}
                        </div>

                        {/* Step Label (hidden on mobile) */}
                        <span
                            className={cn(
                                "ml-2 text-sm font-medium hidden md:inline",
                                isCurrent && "text-primary",
                                isCompleted && "text-foreground",
                                !isCompleted && !isCurrent && "text-muted-foreground"
                            )}
                        >
                            {step.title}
                        </span>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    "w-8 md:w-12 h-0.5 mx-2",
                                    isCompleted ? "bg-primary" : "bg-muted"
                                )}
                                aria-hidden="true"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
