"use client";

import React, { useState, Children, cloneElement, isValidElement, ReactNode } from 'react';
import { cn } from "@/lib/utils";

interface FeatureClusterGroupProps {
    children: ReactNode;
    className?: string;
}

/**
 * FeatureClusterGroup - Wrapper for 2-column FeatureCluster layout
 * 
 * Smart expand behavior:
 * - If only ONE child is expanded → that child takes full width (col-span-2)
 * - If BOTH children are expanded → they stay side-by-side
 * - If neither is expanded → they stay side-by-side
 */
export function FeatureClusterGroup({ children, className }: FeatureClusterGroupProps) {
    // Track which clusters are expanded by their index
    const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

    const childArray = Children.toArray(children);

    // Smart layout logic:
    // - Both collapsed → 2-in-a-line
    // - One expanded → that expanded one takes full width
    // - Both expanded → each takes full width (stacked)
    // Rule: Any EXPANDED cluster gets col-span-2

    const handleExpandChange = (index: number, expanded: boolean) => {
        setExpandedIndices(prev => {
            const next = new Set(prev);
            if (expanded) {
                next.add(index);
            } else {
                next.delete(index);
            }
            return next;
        });
    };

    return (
        <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
            {childArray.map((child, index) => {
                if (!isValidElement(child)) return child;

                // Any expanded cluster takes full width
                const isExpanded = expandedIndices.has(index);

                // If it's the last item and we have an odd number of items, make it full width
                // independent of expansion state (so it fills the row)
                const isLastAndOdd = index === childArray.length - 1 && childArray.length % 2 !== 0;

                // Clone the child with additional props
                return cloneElement(child as React.ReactElement<any>, {
                    key: index,
                    className: cn(
                        (child as React.ReactElement<any>).props.className,
                        (isExpanded || isLastAndOdd) && "lg:col-span-2"
                    ),
                    onExpandChange: (expanded: boolean) => {
                        handleExpandChange(index, expanded);
                        // Call the original onExpandChange if it exists
                        const originalOnExpandChange = (child as React.ReactElement<any>).props.onExpandChange;
                        if (originalOnExpandChange) {
                            originalOnExpandChange(expanded);
                        }
                    }
                });
            })}
        </div>
    );
}

export default FeatureClusterGroup;
