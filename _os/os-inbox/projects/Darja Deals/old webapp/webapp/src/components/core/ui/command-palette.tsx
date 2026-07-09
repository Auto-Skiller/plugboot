"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Command,
    Search,
    LayoutDashboard,
    ShoppingBag,
    BarChart,
    Settings,
    Plus,
    FileText,
    Users,
    ArrowRight,
    X,
} from "lucide-react";

interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    href?: string;
    action?: () => void;
    keywords?: string[];
    group?: string;
}

interface CommandPaletteProps {
    commands?: CommandItem[];
    placeholder?: string;
    className?: string;
    compact?: boolean;
}

const defaultCommands: CommandItem[] = [
    // Navigation
    {
        id: "nav-dashboard",
        label: "Go to Dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
        href: "/",
        group: "Navigation",
        keywords: ["home", "overview"],
    },
    {
        id: "nav-orders",
        label: "Go to Orders",
        icon: <ShoppingBag className="h-4 w-4" />,
        href: "/ecommerce/orders",
        group: "Navigation",
        keywords: ["sales", "purchases"],
    },
    {
        id: "nav-analytics",
        label: "Go to Analytics",
        icon: <BarChart className="h-4 w-4" />,
        href: "/analytics",
        group: "Navigation",
        keywords: ["reports", "stats", "data"],
    },
    {
        id: "nav-settings",
        label: "Go to Settings",
        icon: <Settings className="h-4 w-4" />,
        href: "/settings",
        group: "Navigation",
        keywords: ["preferences", "config"],
    },
    // Actions
    {
        id: "action-new-order",
        label: "Create New Order",
        icon: <Plus className="h-4 w-4" />,
        href: "/ecommerce/orders",
        group: "Quick Actions",
        keywords: ["add", "new", "create"],
    },
    {
        id: "action-new-product",
        label: "Add New Product",
        icon: <Plus className="h-4 w-4" />,
        href: "/ecom/inventory",
        group: "Quick Actions",
        keywords: ["add", "create", "item"],
    },
    {
        id: "action-new-campaign",
        label: "Create Campaign",
        icon: <Plus className="h-4 w-4" />,
        href: "/marketing/campaigns/messaging",
        group: "Quick Actions",
        keywords: ["marketing", "ads"],
    },
];

export function CommandPalette({
    commands = defaultCommands,
    placeholder = "Type a command or search...",
    className,
    compact = false,
}: CommandPaletteProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Keyboard shortcut to open
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
                setQuery("");
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Focus input when opened
    React.useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    // Filter commands
    const filteredCommands = React.useMemo(() => {
        if (!query) return commands;
        const lowerQuery = query.toLowerCase();
        return commands.filter(
            (cmd) =>
                cmd.label.toLowerCase().includes(lowerQuery) ||
                cmd.description?.toLowerCase().includes(lowerQuery) ||
                cmd.keywords?.some((k) => k.toLowerCase().includes(lowerQuery))
        );
    }, [commands, query]);

    // Group commands
    const groupedCommands = React.useMemo(() => {
        const groups: Record<string, CommandItem[]> = {};
        filteredCommands.forEach((cmd) => {
            const group = cmd.group || "Commands";
            if (!groups[group]) groups[group] = [];
            groups[group].push(cmd);
        });
        return groups;
    }, [filteredCommands]);

    // Handle selection
    const handleSelect = (cmd: CommandItem) => {
        if (cmd.action) {
            cmd.action();
        } else if (cmd.href) {
            router.push(cmd.href);
        }
        setIsOpen(false);
        setQuery("");
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                handleSelect(filteredCommands[selectedIndex]);
            }
        }
    };

    React.useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "flex items-center gap-2 text-sm text-muted-foreground transition-colors",
                    compact
                        ? "justify-center w-8 h-8 rounded-full hover:bg-muted hover:text-foreground"
                        : "px-3 py-2 bg-muted/50 border border-border rounded-lg hover:bg-muted hover:text-foreground",
                    className
                )}
                title={compact ? "Search (Ctrl+K)" : undefined}
            >
                <Search className="h-4 w-4" />
                {!compact && (
                    <>
                        <span className="text-left">Search...</span>
                        <kbd className="hidden md:inline-flex ml-auto px-1.5 py-0.5 text-[10px] font-medium bg-background border border-border rounded">
                            {typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac') ? '⌘K' : 'Ctrl+K'}
                        </kbd>
                    </>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                        onClick={() => {
                            setIsOpen(false);
                            setQuery("");
                        }}
                    />

                    {/* Dialog */}
                    <div className="fixed left-1/2 bottom-20 -translate-x-1/2 w-full max-w-lg z-[70]">
                        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                            {/* Input */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                                <Search className="h-5 w-5 text-muted-foreground" />
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={placeholder}
                                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                                />
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        setQuery("");
                                    }}
                                    className="p-1 hover:bg-muted rounded"
                                >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Results */}
                            <div className="max-h-80 overflow-y-auto p-2">
                                {Object.keys(groupedCommands).length === 0 ? (
                                    <div className="py-8 text-center text-muted-foreground text-sm">
                                        No results found
                                    </div>
                                ) : (
                                    Object.entries(groupedCommands).map(([group, items]) => (
                                        <div key={group} className="mb-2">
                                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                {group}
                                            </div>
                                            {items.map((cmd, idx) => {
                                                const globalIdx = filteredCommands.indexOf(cmd);
                                                return (
                                                    <button
                                                        key={cmd.id}
                                                        onClick={() => handleSelect(cmd)}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left",
                                                            "transition-colors",
                                                            globalIdx === selectedIndex
                                                                ? "bg-primary text-primary-foreground"
                                                                : "hover:bg-muted"
                                                        )}
                                                    >
                                                        {cmd.icon && (
                                                            <span
                                                                className={cn(
                                                                    globalIdx === selectedIndex
                                                                        ? "text-primary-foreground"
                                                                        : "text-muted-foreground"
                                                                )}
                                                            >
                                                                {cmd.icon}
                                                            </span>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">{cmd.label}</div>
                                                            {cmd.description && (
                                                                <div
                                                                    className={cn(
                                                                        "text-sm truncate",
                                                                        globalIdx === selectedIndex
                                                                            ? "text-primary-foreground/70"
                                                                            : "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {cmd.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <ArrowRight
                                                            className={cn(
                                                                "h-4 w-4 opacity-0 transition-opacity",
                                                                globalIdx === selectedIndex && "opacity-100"
                                                            )}
                                                        />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-muted rounded">↑↓</kbd> to navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-muted rounded">↵</kbd> to select
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-muted rounded">esc</kbd> to close
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
