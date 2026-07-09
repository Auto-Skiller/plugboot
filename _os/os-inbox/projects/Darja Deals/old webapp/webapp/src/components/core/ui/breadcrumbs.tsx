"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";

// ============================================================================
// BREADCRUMBS
// ============================================================================

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items?: BreadcrumbItem[];
    showHome?: boolean;
    className?: string;
    separator?: React.ReactNode;
}

// Route label mappings
const routeLabels: Record<string, string> = {
    "": "Home",
    "operations": "Operations",
    "orders": "Orders",
    "call-center": "Call Center",
    "marketing-campaigns": "Marketing Campaigns",
    "ecom": "E-Commerce",
    "inventory": "Inventory",
    "product-research": "Product Research",
    "ecommerce": "E-Commerce Tools",
    "market-intelligence": "Market Intelligence",
    "product-discovery": "Product Discovery",
    "marketing": "Marketing",
    "traffic-stats": "Traffic Stats",
    "roas-monitor": "ROAS Monitor",
    "ads-manager": "Ads Manager",
    "social": "Social",
    "manage": "Social Studio",
    "create": "Content Creation",
    "tools": "Social Tools",
    "analytics": "Analytics",
    "settings": "Settings",
    "wallet": "Wallet",
    "profile": "Profile",
    "subscription": "Subscription",
    "notifications": "Notifications",
    "keyword-rules": "Keyword Rules",
    "beta": "Beta Lab",
    "brand-kit": "Brand Kit",
    "identity": "Identity",
    "store-design": "Store Design",
    "ai-trainer": "AI Trainer",
    "funnels": "Funnels",
    "whatsapp": "WhatsApp",
    "auth": "Authentication",
    "login": "Login",
    "signup": "Sign Up",
    "new": "New",
    "messaging": "Messaging",
};

function getLabel(segment: string): string {
    // Check if it's a route label
    if (routeLabels[segment]) {
        return routeLabels[segment];
    }

    // Convert slug to title case
    return segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function Breadcrumbs({
    items,
    showHome = true,
    className,
    separator = <ChevronRight className="h-4 w-4 text-muted-foreground/50" />,
}: BreadcrumbsProps) {
    const pathname = usePathname();

    // Auto-generate breadcrumbs from pathname if items not provided
    const breadcrumbs = React.useMemo(() => {
        if (items) return items;

        const segments = pathname.split("/").filter(Boolean);
        const crumbs: BreadcrumbItem[] = [];

        const filteredSegments = segments.filter(segment => {
            // Skip dynamic route segments like [slug]
            if (segment.startsWith("[") && segment.endsWith("]")) return false;
            // Skip "analytics" segment from breadcrumbs
            if (segment === "analytics") return false;
            return true;
        });

        filteredSegments.forEach((segment, index) => {
            const originalIndex = segments.indexOf(segment);
            const href = "/" + segments.slice(0, originalIndex + 1).join("/");
            const isLast = index === filteredSegments.length - 1;

            crumbs.push({
                label: getLabel(segment),
                href: isLast ? undefined : href,
            });
        });

        return crumbs;
    }, [pathname, items]);

    if (breadcrumbs.length === 0 && !showHome) return null;

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn("flex items-center gap-1.5 text-sm", className)}
        >
            {showHome && (
                <>
                    <Link
                        href="/analytics"
                        className={cn(
                            "flex items-center gap-1 text-muted-foreground hover:text-foreground",
                            "transition-colors"
                        )}
                    >
                        <Home className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only">Home</span>
                    </Link>
                    {breadcrumbs.length > 0 && separator}
                </>
            )}

            {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                    <React.Fragment key={index}>
                        {crumb.href ? (
                            <Link
                                href={crumb.href}
                                className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[150px]"
                                title={crumb.label}
                            >
                                {crumb.label}
                            </Link>
                        ) : (
                            <span
                                className="text-foreground font-medium truncate max-w-[200px]"
                                title={crumb.label}
                                aria-current="page"
                            >
                                {crumb.label}
                            </span>
                        )}
                        {!isLast && separator}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}

// ============================================================================
// PAGE HEADER WITH BREADCRUMBS
// ============================================================================

interface PageHeaderProps {
    title: string;
    description?: string;
    showBreadcrumbs?: boolean;
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    showBreadcrumbs = true,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn("space-y-4 mb-6", className)}>
            {showBreadcrumbs && <Breadcrumbs />}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        </div>
    );
}
