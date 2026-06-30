"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Lock, Unlock, CheckCircle2, Circle, ArrowRight, DollarSign, AlertTriangle } from "lucide-react";

const STEPS = [
    {
        title: "The Golden Rule",
        content: "NEVER insert an Algerian SIM card into the phone you use for this TikTok account. TikTok detects region primarily via SIM card MCC (Mobile Country Code).",
        icon: Lock
    },
    {
        title: "Clean Slate",
        content: "Factory reset a dedicated phone or use a secure folder/separate profile. Do not log in with old Google/Apple IDs associated with Algeria.",
        icon: Circle
    },
    {
        title: "Network Setup",
        content: "1. Remove SIM card.\n2. Connect to Wi-Fi.\n3. Turn on a high-quality VPN (Target: France, UK, or US).",
        icon: Circle
    },
    {
        title: "Account Creation",
        content: "Download TikTok (sideload APK if needed, or create new foreign Play/App Store account). Sign up using Email (not phone number).",
        icon: Circle
    },
    {
        title: "Verification",
        content: "Navigate to 'Creator Tools'. If you see 'Creator Fund' or 'Creativity Program Beta', you succeeded! Maintain VPN use for posting.",
        icon: Unlock
    },
    {
        title: "Troubleshooting",
        content: "If it fails: 1. Check IP leak (whoer.net). 2. Ensure SIM is REMOVED. 3. Clear App Data and retry with a new email.",
        icon: CheckCircle2
    }
];

export default function TikTokMonetizationWizard() {
    const [currentStep, setCurrentStep] = useState(0);

    return (
        <Card className="h-full border-black dark:border-gray-700 shadow-sm bg-gray-50 dark:bg-gray-900/50 flex flex-col">
            <CardHeader className="bg-black text-white pb-4 rounded-t-lg flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-800 rounded-lg">
                        <DollarSign className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <CardTitle className="text-lg text-white">Monetization Wizard</CardTitle>
                        <CardDescription className="text-gray-400">Unlock generic revenue streams from Algeria</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow flex flex-col">
                <div className="p-6 flex-grow flex flex-col justify-between min-h-[200px]">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-bold px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded-md uppercase tracking-wide">
                                Step {currentStep + 1} of {STEPS.length}
                            </span>
                            <h3 className="font-bold text-lg">{STEPS[currentStep].title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                            {STEPS[currentStep].content}
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <div className="flex gap-1">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 w-6 rounded-full transition-all ${i === currentStep ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentStep === 0}
                            onClick={() => setCurrentStep(prev => prev - 1)}
                        >
                            Back
                        </Button>
                        <Button
                            size="sm"
                            className="bg-cyan-500 hover:bg-cyan-600 text-white"
                            onClick={() => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))}
                        >
                            {currentStep === STEPS.length - 1 ? "Finish" : "Next"} <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                    </div>
                </div>
            </CardContent>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-t border-yellow-100 dark:border-yellow-900/30 rounded-b-lg flex-shrink-0">
                <div className="flex gap-2">
                    <div className="mt-0.5">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">
                        <span className="font-bold">Disclaimer:</span> Use at your own risk. Using VPNs or foreign SIMs to bypass region locks may violate TikTok&apos;s Terms of Service and could result in account suspension.
                    </p>
                </div>
            </div>
        </Card>
    );
}
