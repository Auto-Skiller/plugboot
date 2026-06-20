"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/core/ui/button"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/core/ui/collapsible"
import { cn } from "@/lib/utils"

type FeatureType = "sales" | "stock" | "creatives" | "ads" | "analytics" | "marketing" | "product-research" | "confirmation" | "warehouse" | "logistics" | "logistics-recovery" | "finance" | "sourcing";

const ASSET_MAP: Record<FeatureType, string> = {
    "sales": "sales",
    "stock": "stock",
    "creatives": "creatives",
    "ads": "ads",
    "analytics": "analytics",
    "marketing": "marketing",
    "product-research": "product-research",
    // Mappings for new semantic names to existing assets
    "confirmation": "sales",
    "warehouse": "stock",
    "logistics": "stock",
    "logistics-recovery": "stock",
    "finance": "analytics",
    "sourcing": "product-research"
};

interface FeatureCollapsibleProps {
    feature: FeatureType;
    title: string;
    description?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export function FeatureCollapsible({
    feature,
    title,
    description,
    children,
    defaultOpen = false,
}: FeatureCollapsibleProps) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen)

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className={cn(
                "w-full rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-300",
                isOpen ? "ring-1 ring-primary/20" : "hover:shadow-md"
            )}
        >
            <div className="relative">
                {/* Background Image (Visible when collapsed, dimmed when open) */}
                <div
                    className={cn(
                        "absolute inset-0 z-0 transition-opacity duration-500",
                        isOpen ? "opacity-10" : "opacity-40"
                    )}
                >
                    {/* Desktop Wide Image */}
                    <img
                        src={`/assets/features/${ASSET_MAP[feature] || feature}_wide.svg`}
                        alt={`${feature} background`}
                        className="hidden md:block w-full h-full object-cover"
                    />
                    {/* Mobile Square Image */}
                    <img
                        src={`/assets/features/${ASSET_MAP[feature] || feature}_square.svg`}
                        alt={`${feature} background`}
                        className="block md:hidden w-full h-full object-cover"
                    />
                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/40" />
                </div>

                <div className="relative z-10 p-1">
                    <CollapsibleTrigger className="w-full flex items-center justify-between space-x-4 px-4 py-4 cursor-pointer hover:bg-accent/5 rounded-lg group text-left">
                        <div className="flex-1 space-y-1">
                            <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                                {title}
                            </h3>
                            {description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                    {description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center justify-center w-9 h-9 rounded-md bg-background/50 backdrop-blur-sm group-hover:bg-background/80 transition-colors">
                            <ChevronsUpDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                        </div>
                    </CollapsibleTrigger>
                </div>
            </div>

            <CollapsibleContent className="space-y-2 relative border-t">
                <div className="p-6 bg-background/50 backdrop-blur-sm">
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
