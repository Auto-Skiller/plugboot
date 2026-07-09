"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Rocket, X, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingModal } from "@/components/core/ui/modals/OnboardingModal";

const ONBOARDING_PROGRESS_KEY = "riglify-onboarding";
const ONBOARDING_HIDDEN_SESSION_KEY = "riglify-onboarding-hidden-session";

export function FloatingOnboardingWidget() {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Onboarding Data State
    const [steps, setSteps] = useState([
        { id: "profile", title: "Complete your profile", description: "Add your business information and logo", href: "/admin/general", completed: false },
        { id: "product", title: "Add your first product", description: "Create a product to start selling", href: "/ecommerce/inventory", completed: false },
        { id: "delivery", title: "Set up delivery zones", description: "Configure shipping areas and prices", href: "/ecommerce/orders?tab=wilaya", completed: false },
        { id: "payment", title: "Configure payment methods", description: "Set up COD and other payment options", href: "/admin/billing", completed: false },
        { id: "campaign", title: "Launch your first campaign", description: "Create your first marketing campaign", href: "/marketing/ads-manager", completed: false },
    ]);

    const completedCount = steps.filter(s => s.completed).length;
    const totalCount = steps.length;

    // Load state
    useEffect(() => {
        // Check session hide state
        const isHiddenSession = sessionStorage.getItem(ONBOARDING_HIDDEN_SESSION_KEY);

        // Load progress
        const savedData = localStorage.getItem(ONBOARDING_PROGRESS_KEY);
        let currentCompletedCount = 0;

        if (savedData) {
            const parsed = JSON.parse(savedData);
            const completedIds = parsed.completedIds || [];

            const updatedSteps = steps.map(step => ({
                ...step,
                completed: completedIds.includes(step.id)
            }));

            setSteps(updatedSteps);
            currentCompletedCount = completedIds.length;

            const currentProgress = (currentCompletedCount / totalCount) * 100;
            setProgress(currentProgress);

            if (currentCompletedCount === totalCount) {
                setIsComplete(true);
            }
        }

        // Determine visibility:
        // Show if: NOT complete AND NOT hidden in this session
        // If complete -> Hide permanently (or show congrats briefly? User said "disappears entirely once all tasks are complete")
        // User said: "if hide it will reappear once the user singin again" -> Session based hide.
        if (currentCompletedCount < totalCount && !isHiddenSession) {
            setIsVisible(true);
        }

        setHasLoaded(true);
    }, []);

    const handleStepComplete = useCallback((stepId: string) => {
        setSteps(prev => {
            const updated = prev.map(step =>
                step.id === stepId ? { ...step, completed: true } : step
            );
            const completedIds = updated.filter(s => s.completed).map(s => s.id);
            localStorage.setItem(ONBOARDING_PROGRESS_KEY, JSON.stringify({ completedIds }));

            const newProgress = (completedIds.length / updated.length) * 100;
            setProgress(newProgress);

            if (completedIds.length === updated.length) {
                setIsComplete(true);
                // Delay hiding slightly to show 100% or allow user to see "All Done" in modal
                // But generally widget should disappear.
                // We'll keep it visible if modal is open, or hide it after a delay?
                // For now, reactive close logic handles it.
            }
            return updated;
        });
    }, []);

    const handleHide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible(false);
        // Persist hide for this session only
        sessionStorage.setItem(ONBOARDING_HIDDEN_SESSION_KEY, "true");
    };

    // Don't render until client-side loaded to avoid hydration mismatch
    if (!hasLoaded) return null;

    // If complete, don't show widget (unless modal is open to show "Done" state?)
    // User said "disappears entirely once all tasks are complete"
    if (isComplete && !isModalOpen) return null;

    if (!isVisible && !isModalOpen) return null;

    // Circular Progress Calculation
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <>
            <AnimatePresence>
                {isVisible && !isModalOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0, y: 50 }}
                        className="fixed bottom-6 right-6 z-[60]"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                            {/* Gamified Glow/Pulse */}
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />

                            {/* Main Button Container */}
                            <div className="relative w-16 h-16 bg-background/80 backdrop-blur-md border border-border rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">

                                {/* Progress Ring SVG */}
                                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 64 64">
                                    {/* Track */}
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r={radius}
                                        className="stroke-muted"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    {/* Indicator */}
                                    <motion.circle
                                        cx="32"
                                        cy="32"
                                        r={radius}
                                        className="stroke-primary"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeDasharray={circumference}
                                        animate={{ strokeDashoffset }}
                                        transition={{ duration: 1, ease: "easeInOut" }}
                                        strokeLinecap="round"
                                    />
                                </svg>

                                {/* Icon */}
                                <div className="z-10 text-primary">
                                    {isComplete ? (
                                        <PartyPopper className="w-7 h-7 animate-bounce" />
                                    ) : (
                                        <Rocket className="w-7 h-7 group-hover:animate-pulse" />
                                    )}
                                </div>
                            </div>

                            {/* Label Tag on Hover */}
                            <AnimatePresence>
                                {isHovered && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="absolute right-full top-1/2 -translate-y-1/2 mr-4 bg-popover text-popover-foreground px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap border border-border"
                                    >
                                        Setup Progress: {Math.round(progress)}%
                                        {/* Arrow */}
                                        <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 bg-popover border-t border-r border-border rotate-45" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Close Button on Hover */}
                            <AnimatePresence>
                                {isHovered && (
                                    <motion.button
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        onClick={handleHide}
                                        className="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md border-2 border-background z-20 hover:bg-destructive/90 transition-colors"
                                        title="Hide for this session"
                                    >
                                        <X className="w-3 h-3" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <OnboardingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                progress={progress}
                steps={steps}
                completedCount={completedCount}
                totalCount={totalCount}
                isComplete={isComplete}
                onStepComplete={handleStepComplete}
            />
        </>
    );
}
