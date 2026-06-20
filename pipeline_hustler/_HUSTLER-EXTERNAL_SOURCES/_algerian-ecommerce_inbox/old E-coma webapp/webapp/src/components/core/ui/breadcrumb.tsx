"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm", className)}>
            {/* Home Icon */}
            <Link
                href="/analytics"
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
                title="Dashboard"
            >
                <Home className="h-3.5 w-3.5" />
            </Link>

            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <div key={index} className="flex items-center gap-1">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="text-muted-foreground hover:text-foreground transition-colors px-1 py-0.5 rounded hover:bg-muted"
                            >
                                {item.icon && <span className="inline-flex mr-1">{item.icon}</span>}
                                {item.label}
                            </Link>
                        ) : (
                            <span
                                className={cn(
                                    "px-1 py-0.5",
                                    isLast ? "text-foreground font-medium" : "text-muted-foreground"
                                )}
                            >
                                {item.icon && <span className="inline-flex mr-1">{item.icon}</span>}
                                {item.label}
                            </span>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
