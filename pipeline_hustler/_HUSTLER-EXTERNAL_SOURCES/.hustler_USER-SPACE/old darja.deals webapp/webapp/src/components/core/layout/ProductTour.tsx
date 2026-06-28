"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/core/ui/button";
import { Card, CardContent } from "@/components/core/ui/card";
import { X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TourStep } from "@/config/tour-config";

export interface ProductTourProps {
    steps: TourStep[];
    onClose?: () => void;
    autoStart?: boolean;
}

export function ProductTour({ steps, onClose, autoStart = false }: ProductTourProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(autoStart);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (autoStart) {
            setIsVisible(true);
        }
    }, [autoStart]);

    const handleClose = () => {
        setIsVisible(false);
        if (onClose) onClose();
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // Calculate position based on target element
    const updatePosition = useCallback(() => {
        if (!isVisible || !steps[currentStep]) return;

        const targetId = steps[currentStep].targetId;

        // If generic center placement or target not found, center on screen
        if (targetId === "dashboard") {
            setTooltipPosition({
                top: window.innerHeight / 2 - 150, // Approximate center offset
                left: window.innerWidth / 2 - 200
            });
            return;
        }

        const element = document.getElementById(targetId);
        if (element) {
            const rect = element.getBoundingClientRect();
            const placement = steps[currentStep].placement || "bottom";

            let top = 0;
            let left = 0;
            const offset = 12;

            switch (placement) {
                case "top":
                    top = rect.top - offset - 200; // approx height
                    left = rect.left + (rect.width / 2) - 200; // center width
                    break;
                case "bottom":
                    top = rect.bottom + offset;
                    left = rect.left + (rect.width / 2) - 200;
                    break;
                case "left":
                    top = rect.top + (rect.height / 2) - 100;
                    left = rect.left - offset - 400;
                    break;
                case "right":
                    top = rect.top + (rect.height / 2) - 100;
                    left = rect.right + offset;
                    break;
                case "center":
                default:
                    top = window.innerHeight / 2 - 150;
                    left = window.innerWidth / 2 - 200;
                    break;
            }

            // Boundary checks (basic)
            if (left < 10) left = 10;
            if (left + 400 > window.innerWidth) left = window.innerWidth - 410;
            if (top < 10) top = 10;
            if (top + 200 > window.innerHeight) top = window.innerHeight - 250;

            setTooltipPosition({ top, left });
        } else {
            // Fallback to center if element not found
            setTooltipPosition({
                top: window.innerHeight / 2 - 150,
                left: window.innerWidth / 2 - 200
            });
        }
    }, [currentStep, isVisible, steps]);

    useEffect(() => {
        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition);
        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition);
        };
    }, [updatePosition]);

    if (!isVisible) return null;

    const step = steps[currentStep];

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[100] pointer-events-auto"
                onClick={handleClose}
            />

            {/* Tooltip Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: "spring", duration: 0.4 }}
                style={{
                    position: "fixed",
                    top: tooltipPosition.top,
                    left: tooltipPosition.left
                }}
                className="z-[101] w-[400px] max-w-[90vw] pointer-events-auto"
            >
                <Card className="border-primary/20 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-muted">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>

                    <CardContent className="p-6 pt-7">
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">{step.title}</h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Step {currentStep + 1} of {steps.length}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
                            {step.content}
                        </p>

                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePrev}
                                disabled={currentStep === 0}
                                className="text-muted-foreground"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Back
                            </Button>

                            <Button
                                size="sm"
                                onClick={handleNext}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {currentStep === steps.length - 1 ? "Finish" : "Next"}
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}
