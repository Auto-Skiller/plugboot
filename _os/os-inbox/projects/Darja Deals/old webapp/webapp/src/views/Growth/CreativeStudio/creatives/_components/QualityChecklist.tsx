"use client";

import React from 'react';
import { CheckCircle2, Circle, AlertCircle, ShieldCheck } from 'lucide-react';
import { Card } from "@/components/core/ui/card";
import { cn } from "@/lib/utils";

// Types
export type ContentGoal = 'product_launch' | 'ad' | 'ugc' | 'post';
export type ContentFormat = 'image' | 'reel' | 'story' | 'text';

interface QualityChecklistProps {
    goal: ContentGoal;
    format: ContentFormat;
    data: {
        hook: string;
        cta: string;
        offer: string;
        proof: string;
    };
    className?: string;
}

type ChecklistItemId = 'hook' | 'cta' | 'offer' | 'proof' | 'platform';

interface ChecklistItemDef {
    id: ChecklistItemId;
    label: string;
    description: string;
    check: (data: QualityChecklistProps['data']) => boolean;
}

// 1. Definition of all possible checklist items
const CHECKLIST_ITEMS: Record<ChecklistItemId, ChecklistItemDef> = {
    hook: {
        id: 'hook',
        label: 'Hook Present',
        description: 'Grabs attention immediately (3+ chars)',
        check: (data) => !!data.hook && data.hook.length > 3
    },
    cta: {
        id: 'cta',
        label: 'CTA Present',
        description: 'Clear next step for the user',
        check: (data) => !!data.cta && data.cta.length > 2
    },
    offer: {
        id: 'offer',
        label: 'Offer Clear',
        description: 'Value proposition is explicit',
        check: (data) => !!data.offer && data.offer.length > 5
    },
    proof: {
        id: 'proof',
        label: 'Proof Included',
        description: 'Reviews, stats, or results',
        check: (data) => !!data.proof && data.proof.length > 3
    },
    platform: {
        id: 'platform',
        label: 'Matches Platform',
        description: 'Fits format constraints',
        check: () => true // UI-only nudge, always passes for now
    }
};

// 2. Configuration Matrix: Defines which items are needed per Goal
// format is currently not differentiating much in the user request ("differ per goal/format"), 
// but we structure it to allow format overrides if needed.
const CHECKLIST_MATRIX: Record<ContentGoal, Partial<Record<ContentFormat, { required: ChecklistItemId[], recommended: ChecklistItemId[] }>>> = {
    product_launch: {
        // Defaults for product launch
        image: { required: ['hook', 'cta', 'offer', 'platform'], recommended: ['proof'] },
        reel: { required: ['hook', 'cta', 'offer', 'platform'], recommended: ['proof'] },
        story: { required: ['hook', 'cta', 'offer', 'platform'], recommended: [] },
        text: { required: ['hook', 'cta', 'offer', 'platform'], recommended: ['proof'] },
    },
    ad: {
        image: { required: ['hook', 'cta', 'offer', 'platform'], recommended: ['proof'] },
        reel: { required: ['hook', 'cta', 'offer', 'platform'], recommended: ['proof'] },
        story: { required: ['hook', 'cta', 'offer', 'platform'], recommended: [] },
        text: { required: ['hook', 'cta', 'offer', 'platform'], recommended: ['proof'] },
    },
    ugc: {
        image: { required: ['hook', 'cta', 'platform'], recommended: ['proof', 'offer'] },
        reel: { required: ['hook', 'cta', 'platform'], recommended: ['proof', 'offer'] },
        story: { required: ['hook', 'cta', 'platform'], recommended: [] },
        text: { required: ['hook', 'cta', 'platform'], recommended: ['proof'] },
    },
    post: {
        image: { required: ['hook', 'cta', 'platform'], recommended: ['proof'] },
        reel: { required: ['hook', 'cta', 'platform'], recommended: [] },
        story: { required: ['cta', 'platform'], recommended: ['hook'] }, // Stories might just be updates
        text: { required: ['hook', 'cta', 'platform'], recommended: [] },
    }
};

export function QualityChecklist({
    goal,
    format,
    data,
    className
}: QualityChecklistProps) {

    const config = CHECKLIST_MATRIX[goal]?.[format] || { required: ['hook', 'cta'], recommended: [] };

    // Merge required and recommended into a single list for rendering
    const displayItems = [
        ...config.required.map(id => ({ ...CHECKLIST_ITEMS[id], required: true })),
        ...config.recommended.map(id => ({ ...CHECKLIST_ITEMS[id], required: false }))
    ];

    const itemsWithStatus = displayItems.map(item => ({
        ...item,
        isMet: item.check(data)
    }));

    const metCount = itemsWithStatus.filter(i => i.isMet).length;
    const totalCount = itemsWithStatus.length;
    const allMet = metCount === totalCount;
    const requiredMet = itemsWithStatus.filter(i => i.required && i.isMet).length === itemsWithStatus.filter(i => i.required).length;

    return (
        <Card className={cn("p-4 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800", className)}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <ShieldCheck className={cn("w-4 h-4", requiredMet ? "text-green-500" : "text-amber-500")} />
                    Output Quality Checklist
                </h3>
                <span className={cn("text-xs font-mono px-2 py-0.5 rounded-full border",
                    allMet ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                        : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                )}>
                    {metCount}/{totalCount} Checks
                </span>
            </div>

            <div className="space-y-1">
                {itemsWithStatus.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-2 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors group">
                        <div className={cn("mt-0.5 transition-colors",
                            item.isMet ? "text-green-500" : item.required ? "text-amber-300" : "text-slate-300"
                        )}>
                            {item.isMet ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className={cn("text-xs font-semibold transition-colors",
                                    item.isMet ? "text-slate-700 dark:text-slate-200" : "text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                                )}>
                                    {item.label}
                                </p>
                                {!item.required && (
                                    <span className="text-[9px] text-slate-400 border border-slate-200 dark:border-slate-700 px-1 rounded">Recommended</span>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {!requiredMet && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 italic flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3" />
                        Complete required items for best results.
                    </p>
                </div>
            )}
        </Card>
    );
}
