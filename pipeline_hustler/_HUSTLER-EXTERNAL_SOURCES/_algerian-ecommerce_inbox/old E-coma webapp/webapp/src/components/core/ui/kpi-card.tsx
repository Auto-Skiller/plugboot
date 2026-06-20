"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string | number;
    trend?: number; // Percentage change
    trendLabel?: string;
    icon?: React.ReactNode;
    className?: string;
    valuePrefix?: string;
    valueSuffix?: string;
}

export function KPICard({
    title,
    value,
    trend,
    trendLabel = "vs last period",
    icon,
    className,
    valuePrefix,
    valueSuffix,
}: KPICardProps) {
    const getTrendColor = () => {
        if (trend === undefined || trend === 0) return "text-muted-foreground";
        return trend > 0 ? "text-green-500" : "text-red-500";
    };

    const getTrendIcon = () => {
        if (trend === undefined) return null;
        if (trend === 0) return <Minus className="h-3 w-3" />;
        return trend > 0 ? (
            <TrendingUp className="h-3 w-3" />
        ) : (
            <TrendingDown className="h-3 w-3" />
        );
    };

    const formatTrend = () => {
        if (trend === undefined) return null;
        const sign = trend > 0 ? "+" : "";
        return `${sign}${trend.toFixed(1)}%`;
    };

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-xl border bg-card p-6",
                "transition-all duration-200 hover:shadow-lg hover:border-primary/20",
                className
            )}
        >
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

            <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    {icon && (
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            {icon}
                        </div>
                    )}
                </div>

                {/* Value */}
                <div className="flex items-baseline gap-1">
                    {valuePrefix && (
                        <span className="text-lg font-medium text-muted-foreground">
                            {valuePrefix}
                        </span>
                    )}
                    <span className="text-3xl font-bold tracking-tight">{value}</span>
                    {valueSuffix && (
                        <span className="text-lg font-medium text-muted-foreground">
                            {valueSuffix}
                        </span>
                    )}
                </div>

                {/* Trend */}
                {trend !== undefined && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <div
                            className={cn(
                                "flex items-center gap-0.5 text-sm font-medium",
                                getTrendColor()
                            )}
                        >
                            {getTrendIcon()}
                            <span>{formatTrend()}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{trendLabel}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// Grid wrapper for KPI cards
interface KPIGridProps {
    children: React.ReactNode;
    className?: string;
    columns?: 2 | 3 | 4 | 5;
}

export function KPIGrid({ children, className, columns = 4 }: KPIGridProps) {
    const gridCols = {
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    };

    return (
        <div className={cn("grid gap-4", gridCols[columns], className)}>
            {children}
        </div>
    );
}
