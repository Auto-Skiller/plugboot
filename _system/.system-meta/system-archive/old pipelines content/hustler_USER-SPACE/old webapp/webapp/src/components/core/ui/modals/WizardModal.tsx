"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/core/ui/dialog";
import { Button } from "@/components/core/ui/button";
import { Progress } from "@/components/core/ui/progress";
import { cn } from "@/lib/utils";

interface WizardStep {
    id: string;
    title: string;
    description?: string;
    component: React.ReactNode;
    isValid?: boolean; // If false, Next is disabled
}

interface WizardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    steps: WizardStep[];
    onComplete: () => void;
}

export function WizardModal({
    open,
    onOpenChange,
    title,
    steps,
    onComplete
}: WizardModalProps) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const currentStep = steps[currentStepIndex];
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const isLastStep = currentStepIndex === steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent size="lg" className="h-[600px] flex flex-col p-0 gap-0">
                <div className="p-6 pb-2 border-b bg-muted/10">
                    <div className="flex items-center justify-between mb-4">
                        <DialogTitle>{title}</DialogTitle>
                        <span className="text-sm text-muted-foreground font-medium">
                            Step {currentStepIndex + 1} of {steps.length}
                        </span>
                    </div>
                    {/* Progress Indicator */}
                    <div className="relative pt-2">
                        <div className="flex justify-between mb-2">
                            {steps.map((step, idx) => (
                                <div key={step.id} className="flex flex-col items-center">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-300",
                                        idx <= currentStepIndex ? "bg-primary scale-125" : "bg-muted-foreground/30"
                                    )} />
                                </div>
                            ))}
                        </div>
                        <Progress value={progress} className="h-1" />
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep.id}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="h-full flex flex-col"
                        >
                            <div className="mb-6">
                                <h2 className="text-xl font-bold">{currentStep.title}</h2>
                                {currentStep.description && (
                                    <p className="text-muted-foreground">{currentStep.description}</p>
                                )}
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2">
                                {currentStep.component}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <DialogFooter className="p-6 border-t bg-muted/10 flex-row justify-between sm:justify-between">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStepIndex === 0}
                        className="w-24"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        className="w-32"
                        disabled={currentStep.isValid === false}
                    >
                        {isLastStep ? (
                            <>Complete <Check className="w-4 h-4 ml-2" /></>
                        ) : (
                            <>Next <ChevronRight className="w-4 h-4 ml-2" /></>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
