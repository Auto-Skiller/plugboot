"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/ui/button";
import {
    Menu,
    X,
    LayoutDashboard,
    ShoppingBag,
    Search,
    BarChart,
    Zap,
    Share2,
    Palette,
    Settings,
    Users,
    Bot,
    LogOut,
    ChevronRight,
    CreditCard,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

// ============================================================================
// NAVIGATION DATA
// ============================================================================

const navGroups: NavGroup[] = [
    {
        title: "Dashboard",
        items: [
            { name: "Overview", href: "/analytics", icon: LayoutDashboard },

            { name: "Traffic", href: "/marketing/traffic", icon: Settings },
            { name: "Heatmap", href: "/analytics/heatmap", icon: Search },
        ],
    },
    {
        title: "Orders & Inventory",
        items: [
            { name: "Orders", href: "/ecommerce/orders", icon: ShoppingBag },
            { name: "Inventory", href: "/ecommerce/inventory", icon: ShoppingBag },
            { name: "Research", href: "/ecommerce/research", icon: Search },
        ],
    },
    {
        title: "E-Commerce",
        items: [
            { name: "Research", href: "/ecommerce/research", icon: Search },
            { name: "Inventory", href: "/ecommerce/inventory", icon: Palette },
            { name: "Orders", href: "/ecommerce/orders", icon: ShoppingBag },
        ],
    },
    {
        title: "Social Content",
        items: [
            { name: "Inbox", href: "/social/inbox", icon: Share2 },
            { name: "Scheduler", href: "/social/posts-studio", icon: Palette },
            { name: "Analytics", href: "/social/analytics", icon: BarChart },
            { name: "Tools", href: "/social/tools", icon: Search },
        ],
    },
    {
        title: "Marketing & ADS",
        items: [
            { name: "Campaigns", href: "/marketing/ad-accounts", icon: Zap },
            { name: "Analytics", href: "/marketing/analytics", icon: BarChart },
            { name: "Tools", href: "/marketing/tools", icon: Search },
        ],
    },
    {
        title: "Beta Lab",
        items: [
            { name: "Operations", href: "/beta/operations", icon: Bot },
            { name: "Management", href: "/beta/management", icon: Palette },
        ],
    },
    {
        title: "Settings",
        items: [
            { name: "General Settings", href: "/admin/general", icon: Settings },
            { name: "Team & Security", href: "/admin/team", icon: Users },
            { name: "Credits & Billing", href: "/admin/billing", icon: CreditCard },
        ],
    },
];

// ============================================================================
// MOBILE SIDEBAR
// ============================================================================

interface MobileSidebarProps {
    className?: string;
}

export function MobileSidebar({ className }: MobileSidebarProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const pathname = usePathname();

    // Close on route change
    React.useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scroll when open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <>
            {/* Trigger Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
                className={cn("md:hidden h-9 w-9", className)}
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-full w-72 bg-card border-r z-50",
                    "transform transition-transform duration-300 ease-in-out md:hidden",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-end h-16 px-4 border-b">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                        className="h-9 w-9"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                    {navGroups.map((group) => (
                        <div key={group.title}>
                            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                {group.title}
                            </h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = item.href === "/"
                                        ? pathname === "/"
                                        : pathname.startsWith(item.href);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                                                "transition-colors",
                                                isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            {item.name}
                                            {isActive && (
                                                <ChevronRight className="h-4 w-4 ml-auto" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t">
                    <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => {
                            // Clear user data
                            localStorage.removeItem("user-session");
                            document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                            // Redirect to login
                            window.location.href = "/auth/login";
                        }}
                    >
                        <LogOut className="h-5 w-5" />
                        Log Out
                    </button>
                </div>
            </aside>
        </>
    );
}

// ============================================================================
// BOTTOM TAB BAR (Alternative Mobile Navigation)
// ============================================================================

const bottomTabs = [
    { name: "Home", href: "/analytics", icon: LayoutDashboard },
    { name: "Orders", href: "/ecommerce/orders", icon: ShoppingBag },
    { name: "Inventory", href: "/ecommerce/inventory", icon: Search },
    { name: "Research", href: "/ecommerce/research", icon: BarChart },
    { name: "Settings", href: "/admin/general", icon: Settings },
];

export function BottomTabBar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <nav
            className={cn(
                "fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-40 md:hidden",
                "flex items-center justify-around px-2",
                className
            )}
        >
            {bottomTabs.map((tab) => {
                const isActive = tab.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(tab.href);

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2 rounded-lg",
                            "transition-colors min-w-[60px]",
                            isActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <tab.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                        <span className="text-xs font-medium">{tab.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
