"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/core/ui/button";
import { Card, CardContent } from "@/components/core/ui/card";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
    targetId: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "center";
}

const TOUR_STEPS: TourStep[] = [
    {
        targetId: "dashboard",
        title: "Welcome to Creatives! 👋",
        content: "This is your content creation hub. Let's take a quick tour.",
        placement: "center"
    },
    {
        targetId: "kpi-section",
        title: "Track Your Content",
        content: "Monitor ideas, drafts, and published content at a glance with animated stats.",
        placement: "bottom"
    },
    {
        targetId: "quick-actions",
        title: "Quick Actions",
        content: "Jump right in with quick access to the Wizard and popular tools.",
        placement: "bottom"
    },
    {
        targetId: "content-kanban",
        title: "Content Pipeline",
        content: "Drag and drop content between columns to update status. Ideas → Drafts → Scheduled → Published.",
        placement: "bottom"
    },
    {
        targetId: "tool-grid",
        title: "All Your Tools",
        content: "Access all creation tools organized by category. Click any card to open it.",
        placement: "top"
    },
    {
        targetId: "algeria-tools",
        title: "Algeria-Specific 🇩🇿",
        content: "Convert content to Algerian Darja and optimize for local networks.",
        placement: "top"
    }
];

interface ProductTourProps {
    onClose?: () => void;
    autoStart?: boolean;
}

/**
 * ProductTour - Interactive onboarding tour for first-time users
 */
export function ProductTour({ onClose, autoStart = false }: ProductTourProps) {
    const [isOpen, setIsOpen] = useState(autoStart);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const step = TOUR_STEPS[currentStep];

    const updateTargetPosition = useCallback(() => {
        const target = document.getElementById(step.targetId);
        if (target) {
            setTargetRect(target.getBoundingClientRect());
        } else {
            setTargetRect(null);
        }
    }, [step.targetId]);

    useEffect(() => {
        if (isOpen) {
            updateTargetPosition();
            window.addEventListener("resize", updateTargetPosition);
            window.addEventListener("scroll", updateTargetPosition);
            return () => {
                window.removeEventListener("resize", updateTargetPosition);
                window.removeEventListener("scroll", updateTargetPosition);
            };
        }
    }, [isOpen, currentStep, updateTargetPosition]);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        onClose?.();
        // Save to localStorage that tour was completed
        localStorage.setItem("creatives-tour-completed", "true");
    };

    const startTour = () => {
        setCurrentStep(0);
        setIsOpen(true);
    };

    // Check if tour should auto-show
    useEffect(() => {
        const completed = localStorage.getItem("creatives-tour-completed");
        if (!completed && autoStart) {
            setIsOpen(true);
        }
    }, [autoStart]);

    const getTooltipPosition = () => {
        if (!targetRect || step.placement === "center") {
            return {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)"
            };
        }

        const margin = 16;
        switch (step.placement) {
            case "bottom":
                return {
                    top: targetRect.bottom + margin,
                    left: targetRect.left + targetRect.width / 2,
                    transform: "translateX(-50%)"
                };
            case "top":
                return {
                    top: targetRect.top - margin,
                    left: targetRect.left + targetRect.width / 2,
                    transform: "translate(-50%, -100%)"
                };
            case "left":
                return {
                    top: targetRect.top + targetRect.height / 2,
                    left: targetRect.left - margin,
                    transform: "translate(-100%, -50%)"
                };
            case "right":
                return {
                    top: targetRect.top + targetRect.height / 2,
                    left: targetRect.right + margin,
                    transform: "translateY(-50%)"
                };
            default:
                return {};
        }
    };

    return (
        <>
            {/* Start Tour Button */}
            {!isOpen && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={startTour}
                    className="gap-2"
                >
                    <Sparkles className="h-4 w-4" />
                    Take a Tour
                </Button>
            )}

            {/* Tour Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-[100]"
                            onClick={handleClose}
                        />

                        {/* Spotlight on target */}
                        {targetRect && step.placement !== "center" && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="fixed z-[101] pointer-events-none"
                                style={{
                                    top: targetRect.top - 8,
                                    left: targetRect.left - 8,
                                    width: targetRect.width + 16,
                                    height: targetRect.height + 16,
                                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                                    borderRadius: "12px",
                                }}
                            />
                        )}

                        {/* Tooltip Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed z-[102]"
                            style={getTooltipPosition()}
                        >
                            <Card className="w-80 shadow-xl">
                                <CardContent className="p-4">
                                    {/* Close button */}
                                    <button
                                        onClick={handleClose}
                                        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
                                        aria-label="Close tour"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>

                                    {/* Step content */}
                                    <h3 className="font-semibold text-lg pr-6">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-2">{step.content}</p>

                                    {/* Progress dots */}
                                    <div className="flex justify-center gap-1.5 mt-4" role="tablist" aria-label="Tour progress">
                                        {TOUR_STEPS.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentStep(index)}
                                                className={cn(
                                                    "w-2 h-2 rounded-full transition-colors",
                                                    index === currentStep
                                                        ? "bg-primary"
                                                        : "bg-muted hover:bg-muted-foreground/50"
                                                )}
                                                aria-label={`Go to step ${index + 1}`}
                                                aria-selected={index === currentStep}
                                                role="tab"
                                            />
                                        ))}
                                    </div>

                                    {/* Navigation */}
                                    <div className="flex justify-between mt-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handlePrev}
                                            disabled={currentStep === 0}
                                            aria-label="Previous step"
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Back
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleNext}
                                            aria-label={currentStep === TOUR_STEPS.length - 1 ? "Finish tour" : "Next step"}
                                        >
                                            {currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
                                            {currentStep < TOUR_STEPS.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                                        </Button>
                                    </div>

                                    {/* Skip link */}
                                    <button
                                        onClick={handleClose}
                                        className="w-full text-center text-xs text-muted-foreground mt-2 hover:underline"
                                    >
                                        Skip tour
                                    </button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
