"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Progress } from "@/components/core/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/core/ui/dialog";
import {
    ChevronLeft,
    ChevronRight,
    Target,
    Layout,
    MessageSquare,
    FileText,
    Sparkles,
    CheckCircle,
    Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";

// Wizard Context for sharing state between steps
interface WizardData {
    goal: string;
    platforms: string[];
    hook: string;
    product: string;
    audience: string;
    cta: string;
}

const WizardContext = createContext<{
    data: WizardData;
    updateData: (partial: Partial<WizardData>) => void;
} | null>(null);

const useWizard = () => {
    const ctx = useContext(WizardContext);
    if (!ctx) throw new Error("useWizard must be used within CreationWizard");
    return ctx;
};

// Step Components
function GoalStep() {
    const { data, updateData } = useWizard();
    const goals = [
        { id: "product_launch", label: "Product Launch", icon: Rocket },
        { id: "engagement_boost", label: "Engagement Boost", icon: MessageSquare },
        { id: "brand_awareness", label: "Brand Awareness", icon: Target },
        { id: "sales_conversion", label: "Sales Conversion", icon: CheckCircle },
    ];

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                What's the main goal of your content?
            </p>
            <div className="grid grid-cols-2 gap-3">
                {goals.map(goal => (
                    <Card
                        key={goal.id}
                        className={cn(
                            "cursor-pointer transition-all hover:shadow-md p-4",
                            data.goal === goal.id && "ring-2 ring-primary bg-primary/5"
                        )}
                        onClick={() => updateData({ goal: goal.id })}
                        role="radio"
                        aria-checked={data.goal === goal.id}
                    >
                        <div className="flex items-center gap-3">
                            <goal.icon className="h-5 w-5 text-primary" />
                            <span className="font-medium text-sm">{goal.label}</span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function PlatformsStep() {
    const { data, updateData } = useWizard();
    const platforms = ["Instagram", "Facebook", "TikTok", "LinkedIn", "Twitter", "YouTube"];

    const togglePlatform = (platform: string) => {
        const current = data.platforms;
        const updated = current.includes(platform)
            ? current.filter(p => p !== platform)
            : [...current, platform];
        updateData({ platforms: updated });
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Select target platforms (you can choose multiple)
            </p>
            <div className="grid grid-cols-3 gap-2">
                {platforms.map(platform => (
                    <Button
                        key={platform}
                        variant={data.platforms.includes(platform) ? "default" : "outline"}
                        className="h-12"
                        onClick={() => togglePlatform(platform)}
                        role="checkbox"
                        aria-checked={data.platforms.includes(platform)}
                    >
                        {platform}
                    </Button>
                ))}
            </div>
        </div>
    );
}

function ProductStep() {
    const { data, updateData } = useWizard();

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium">Product/Topic Name</label>
                <input
                    type="text"
                    value={data.product}
                    onChange={e => updateData({ product: e.target.value })}
                    placeholder="e.g., Wireless Earbuds Pro"
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm"
                    aria-label="Product or topic name"
                />
            </div>
            <div>
                <label className="text-sm font-medium">Target Audience</label>
                <input
                    type="text"
                    value={data.audience}
                    onChange={e => updateData({ audience: e.target.value })}
                    placeholder="e.g., Tech-savvy millennials in Algeria"
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm"
                    aria-label="Target audience"
                />
            </div>
            <div>
                <label className="text-sm font-medium">Call to Action</label>
                <input
                    type="text"
                    value={data.cta}
                    onChange={e => updateData({ cta: e.target.value })}
                    placeholder="e.g., Shop now, Link in bio"
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm"
                    aria-label="Call to action"
                />
            </div>
        </div>
    );
}

function HookStep() {
    const { data, updateData } = useWizard();
    const suggestedHooks = [
        `🚀 Introducing ${data.product || "[Product]"} - Game changer!`,
        `Stop scrolling if you want the best ${data.product || "[Product]"}`,
        `POV: You finally found the perfect ${data.product || "[Product]"}`,
        `3 reasons why ${data.product || "[Product]"} is a must-have 👇`,
    ];

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Choose or write your opening hook:
            </p>
            <div className="space-y-2">
                {suggestedHooks.map((hook, i) => (
                    <Card
                        key={i}
                        className={cn(
                            "cursor-pointer transition-all hover:bg-muted/50 p-3",
                            data.hook === hook && "ring-2 ring-primary"
                        )}
                        onClick={() => updateData({ hook })}
                        role="radio"
                        aria-checked={data.hook === hook}
                    >
                        <p className="text-sm">{hook}</p>
                    </Card>
                ))}
            </div>
            <div>
                <label className="text-sm font-medium">Or write your own:</label>
                <textarea
                    value={data.hook}
                    onChange={e => updateData({ hook: e.target.value })}
                    placeholder="Type your custom hook..."
                    rows={2}
                    className="w-full mt-1 px-3 py-2 rounded-lg border bg-background text-sm resize-none"
                    aria-label="Custom hook"
                />
            </div>
        </div>
    );
}

function ReviewStep() {
    const { data } = useWizard();

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Review your content configuration:
            </p>
            <div className="space-y-3 bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Goal:</span>
                    <span className="font-medium">{data.goal.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platforms:</span>
                    <span className="font-medium">{data.platforms.join(", ") || "None selected"}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Product:</span>
                    <span className="font-medium">{data.product || "Not specified"}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Audience:</span>
                    <span className="font-medium">{data.audience || "Not specified"}</span>
                </div>
                <div className="text-sm">
                    <span className="text-muted-foreground">Hook:</span>
                    <p className="font-medium mt-1 p-2 bg-background rounded border">
                        {data.hook || "Not specified"}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Wizard Steps Configuration
const WIZARD_STEPS = [
    { id: "goal", title: "Select Goal", icon: Target, component: GoalStep },
    { id: "platforms", title: "Choose Platforms", icon: Layout, component: PlatformsStep },
    { id: "product", title: "Add Details", icon: FileText, component: ProductStep },
    { id: "hook", title: "Create Hook", icon: MessageSquare, component: HookStep },
    { id: "review", title: "Review", icon: CheckCircle, component: ReviewStep },
];

interface CreationWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (data: WizardData) => void;
}

/**
 * CreationWizard - Multi-step guided content creation flow
 */
export function CreationWizard({ isOpen, onClose, onComplete }: CreationWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<WizardData>({
        goal: "",
        platforms: [],
        hook: "",
        product: "",
        audience: "",
        cta: "",
    });

    const updateData = (partial: Partial<WizardData>) => {
        setData(prev => ({ ...prev, ...partial }));
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: return !!data.goal;
            case 1: return data.platforms.length > 0;
            case 2: return !!data.product;
            case 3: return !!data.hook;
            case 4: return true;
            default: return true;
        }
    };

    const handleNext = () => {
        if (currentStep < WIZARD_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete?.(data);
            onClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        setCurrentStep(0);
        setData({ goal: "", platforms: [], hook: "", product: "", audience: "", cta: "" });
        onClose();
    };

    const step = WIZARD_STEPS[currentStep];
    const StepComponent = step.component;
    const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent size="lg" className="p-0 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <DialogHeader className="p-4 border-b">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <DialogTitle>Creation Wizard</DialogTitle>
                    </div>
                    <Progress value={progress} className="h-1.5" aria-label={`Step ${currentStep + 1} of ${WIZARD_STEPS.length}`} />
                    <DialogDescription className="sr-only">
                        A guided wizard to help you create content
                    </DialogDescription>
                </DialogHeader>

                {/* Step Indicator */}
                <div className="px-4 py-3 bg-muted/30 flex items-center gap-2 overflow-x-auto">
                    {WIZARD_STEPS.map((s, i) => (
                        <div
                            key={s.id}
                            className={cn(
                                "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs whitespace-nowrap",
                                i === currentStep && "bg-primary text-primary-foreground",
                                i < currentStep && "text-muted-foreground",
                                i > currentStep && "text-muted-foreground/50"
                            )}
                        >
                            <s.icon className="h-3 w-3" />
                            <span className="hidden sm:inline">{s.title}</span>
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <WizardContext.Provider value={{ data, updateData }}>
                    <div className="p-6 min-h-[300px] flex-1 overflow-y-auto">
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h3 className="font-semibold mb-4">{step.title}</h3>
                            <StepComponent />
                        </motion.div>
                    </div>
                </WizardContext.Provider>

                {/* Footer */}
                <DialogFooter className="p-4 border-t flex justify-between sm:justify-between">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        aria-label="Previous step"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={!canProceed()}
                        aria-label={currentStep === WIZARD_STEPS.length - 1 ? "Generate content" : "Next step"}
                    >
                        {currentStep === WIZARD_STEPS.length - 1 ? (
                            <>
                                <Sparkles className="h-4 w-4 mr-1" />
                                Generate Content
                            </>
                        ) : (
                            <>
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
