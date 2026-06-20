"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FocusRingProps {
    children: ReactNode;
    className?: string;
}

/**
 * FocusRing - Enhanced focus indicator wrapper for accessibility
 */
export function FocusRing({ children, className }: FocusRingProps) {
    return (
        <div
            className={cn(
                "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background rounded-lg transition-shadow",
                className
            )}
        >
            {children}
        </div>
    );
}

/**
 * SkipLink - Skip to main content link for keyboard users
 */
export function SkipLink() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none"
        >
            Skip to main content
        </a>
    );
}

/**
 * VisuallyHidden - Hide content visually but keep accessible for screen readers
 */
export function VisuallyHidden({ children }: { children: ReactNode }) {
    return <span className="sr-only">{children}</span>;
}

/**
 * Accessible button wrapper with proper focus and ARIA attributes
 */
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    description?: string;
    children: ReactNode;
}

export function AccessibleButton({
    label,
    description,
    children,
    className,
    ...props
}: AccessibleButtonProps) {
    const describedById = description ? `${props.id || label}-description` : undefined;

    return (
        <>
            <button
                aria-label={label}
                aria-describedby={describedById}
                className={cn(
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    className
                )}
                {...props}
            >
                {children}
            </button>
            {description && (
                <span id={describedById} className="sr-only">
                    {description}
                </span>
            )}
        </>
    );
}
