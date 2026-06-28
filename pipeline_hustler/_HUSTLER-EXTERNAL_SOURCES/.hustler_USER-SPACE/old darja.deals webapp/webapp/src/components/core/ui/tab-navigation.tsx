"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface TabItem {
    label: string;
    href: string;
    icon?: React.ReactNode;
    badge?: string | number;
}

interface TabNavigationProps {
    tabs: TabItem[];
    className?: string;
    variant?: "underline" | "pills";
}

export function TabNavigation({
    tabs,
    className,
    variant = "underline",
}: TabNavigationProps) {
    const pathname = usePathname();

    return (
        <div
            className={cn(
                "flex items-center gap-1",
                variant === "underline" && "border-b border-border",
                className
            )}
        >
            {tabs.map((tab) => {
                const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");

                if (variant === "pills") {
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg",
                                "transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.badge !== undefined && (
                                <span
                                    className={cn(
                                        "ml-1.5 px-1.5 py-0.5 text-xs font-medium rounded-full",
                                        isActive
                                            ? "bg-primary-foreground/20 text-primary-foreground"
                                            : "bg-muted-foreground/20 text-muted-foreground"
                                    )}
                                >
                                    {tab.badge}
                                </span>
                            )}
                        </Link>
                    );
                }

                // Underline variant
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "flex items-center gap-2 px-4 py-3 text-sm font-medium",
                            "border-b-2 -mb-px transition-all duration-200",
                            isActive
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.badge !== undefined && (
                            <span
                                className={cn(
                                    "ml-1.5 px-1.5 py-0.5 text-xs font-medium rounded-full",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                {tab.badge}
                            </span>
                        )}
                    </Link>
                );
            })}
        </div>
    );
}

// Inline tabs for within-page navigation (no href, just state)
interface InlineTabItem {
    label: string;
    value: string;
    icon?: React.ReactNode;
    badge?: string | number;
}

interface InlineTabNavigationProps {
    tabs: InlineTabItem[];
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    variant?: "underline" | "pills" | "boxed";
}

export function InlineTabNavigation({
    tabs,
    value,
    onChange,
    className,
    variant = "underline",
}: InlineTabNavigationProps) {
    const [selected, setSelected] = React.useState(value || tabs[0]?.value);

    const handleSelect = (tabValue: string) => {
        setSelected(tabValue);
        onChange?.(tabValue);
    };

    if (variant === "boxed") {
        return (
            <div
                className={cn(
                    "inline-flex items-center gap-1 p-1 bg-muted rounded-lg",
                    className
                )}
            >
                {tabs.map((tab) => {
                    const isActive = selected === tab.value;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => handleSelect(tab.value)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md",
                                "transition-all duration-200",
                                isActive
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.badge !== undefined && (
                                <span className="ml-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }

    if (variant === "pills") {
        return (
            <div className={cn("flex items-center gap-1", className)}>
                {tabs.map((tab) => {
                    const isActive = selected === tab.value;
                    return (
                        <button
                            key={tab.value}
                            onClick={() => handleSelect(tab.value)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg",
                                "transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        );
    }

    // Underline variant
    return (
        <div
            className={cn("flex items-center gap-1 border-b border-border", className)}
        >
            {tabs.map((tab) => {
                const isActive = selected === tab.value;
                return (
                    <button
                        key={tab.value}
                        onClick={() => handleSelect(tab.value)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-3 text-sm font-medium",
                            "border-b-2 -mb-px transition-all duration-200",
                            isActive
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.badge !== undefined && (
                            <span className="ml-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
