"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/core/ui/sheet";
import { Button } from "@/components/core/ui/button";
import { Label } from "@/components/core/ui/label";
import { Input } from "@/components/core/ui/input";
import { Badge } from "@/components/core/ui/badge";
import { Slider } from "@/components/core/ui/slider";
import { Checkbox } from "@/components/core/ui/checkbox";
import { Separator } from "@/components/core/ui/separator";
import { ScrollArea } from "@/components/core/ui/scroll-area";
import { Filter, X, RotateCcw } from "lucide-react";

export interface FilterState {
    riskScore: string[];
    wilayas: string[];
    minAmount: number;
    maxAmount: number;
    paymentStatus: string[];
}

interface AdvancedFiltersProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onReset: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    className?: string;
}

const WILAYAS = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
    "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers",
    "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
    "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran"
];

export function AdvancedFilters({
    filters,
    onFilterChange,
    onReset,
    open,
    onOpenChange,
    className
}: AdvancedFiltersProps) {
    const [localFilters, setLocalFilters] = React.useState<FilterState>(filters);

    // Sync local state when props change
    React.useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleApply = () => {
        onFilterChange(localFilters);
        onOpenChange?.(false);
    };

    const handleReset = () => {
        const resetState = {
            riskScore: [],
            wilayas: [],
            minAmount: 0,
            maxAmount: 100000,
            paymentStatus: []
        };
        setLocalFilters(resetState);
        onReset();
    };

    const toggleFilter = (key: keyof FilterState, value: string) => {
        setLocalFilters(prev => {
            const current = prev[key] as string[];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [key]: updated };
        });
    };

    const activeFilterCount =
        localFilters.riskScore.length +
        localFilters.wilayas.length +
        localFilters.paymentStatus.length +
        (localFilters.minAmount > 0 || localFilters.maxAmount < 100000 ? 1 : 0);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Advanced Filters</span>
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0">
                <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle>Advanced Filters</SheetTitle>
                    <SheetDescription>
                        Refine your order search with multiple criteria.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 px-6 py-4">
                    <div className="space-y-6">
                        {/* Risk Score */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">Risk Score</Label>
                            <div className="flex flex-wrap gap-2">
                                {["Low", "Medium", "High", "Critical"].map((score) => (
                                    <Badge
                                        key={score}
                                        variant={localFilters.riskScore.includes(score.toLowerCase()) ? "default" : "outline"}
                                        className="cursor-pointer px-3 py-1"
                                        onClick={() => toggleFilter("riskScore", score.toLowerCase())}
                                    >
                                        {score}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Amount Range */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-medium">Order Amount (DZD)</Label>
                                <span className="text-sm text-muted-foreground">
                                    {localFilters.minAmount.toLocaleString()} - {localFilters.maxAmount.toLocaleString()}
                                </span>
                            </div>
                            <Slider
                                defaultValue={[0, 100000]}
                                value={[localFilters.minAmount, localFilters.maxAmount]}
                                min={0}
                                max={100000}
                                step={1000}
                                onValueChange={(value) => setLocalFilters(prev => ({ ...prev, minAmount: value[0], maxAmount: value[1] }))}
                                className="py-4"
                            />
                        </div>

                        <Separator />

                        {/* Payment Status */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">Payment Status</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {["Paid", "Unpaid", "Refunded", "Partial"].map((status) => (
                                    <div key={status} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`payment-${status}`}
                                            checked={localFilters.paymentStatus.includes(status.toLowerCase())}
                                            onCheckedChange={() => toggleFilter("paymentStatus", status.toLowerCase())}
                                        />
                                        <label
                                            htmlFor={`payment-${status}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {status}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Wilayas */}
                        <div className="space-y-3">
                            <Label className="text-base font-medium">Wilayas</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {WILAYAS.slice(0, 10).map((wilaya) => (
                                    <div key={wilaya} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`wilaya-${wilaya}`}
                                            checked={localFilters.wilayas.includes(wilaya)}
                                            onCheckedChange={() => toggleFilter("wilayas", wilaya)}
                                        />
                                        <label
                                            htmlFor={`wilaya-${wilaya}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {wilaya}
                                        </label>
                                    </div>
                                ))}
                                <div className="text-xs text-muted-foreground pt-1 pl-1">
                                    + {WILAYAS.length - 10} more...
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <SheetFooter className="px-6 py-4 border-t bg-muted/20 sm:justify-between">
                    <Button variant="ghost" onClick={handleReset} className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange?.(false)}>Cancel</Button>
                        <Button onClick={handleApply}>Apply Filters</Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
