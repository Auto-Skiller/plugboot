"use client";

/**
 * ZoneSidebar - Anti-Gravity 3-Zone Navigation Sidebar
 * 
 * Implements the Algerian E-commerce navigation structure:
 * - Zone 1: Operations (Confirmation, Logistics)
 * - Zone 2: Growth (Ads, Creatives)
 * - Zone 3: Command (Finance, Sourcing)
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Settings,
    HelpCircle,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    ZONE_NAVIGATION,
    ZONE_COLORS,
    ZONE_BADGES,
    type Zone,
    type ZonePage
} from "@/config/zone-navigation";

export function ZoneSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedZones, setExpandedZones] = useState<string[]>(["operations", "growth", "command"]);
    const [language, setLanguage] = useState<"en" | "ar">("en");

    // Load collapsed state from localStorage
    useEffect(() => {
        const savedCollapsed = localStorage.getItem("zone-sidebar-collapsed");
        if (savedCollapsed) setIsCollapsed(savedCollapsed === "true");
    }, []);

    useEffect(() => {
        localStorage.setItem("zone-sidebar-collapsed", String(isCollapsed));
    }, [isCollapsed]);

    // Check if a page is active
    const isPageActive = (route: string) => pathname.startsWith(route);

    // Check if a zone has an active page
    const isZoneActive = (zone: Zone) => zone.pages.some(p => isPageActive(p.route));

    // Toggle zone expansion
    const toggleZone = (zoneId: string) => {
        setExpandedZones(prev =>
            prev.includes(zoneId)
                ? prev.filter(z => z !== zoneId)
                : [...prev, zoneId]
        );
    };

    // Get zone colors
    const getZoneColors = (zoneId: string) => {
        return ZONE_COLORS[zoneId as keyof typeof ZONE_COLORS] || ZONE_COLORS.operations;
    };

    // Get badge for a page
    const getPageBadge = (zone: Zone, page: ZonePage) => {
        const key = `${zone.id}.${page.id}`;
        return ZONE_BADGES[key] || 0;
    };

    return (
        <aside className={cn(
            "hidden md:flex flex-col sticky top-0 h-screen transition-all duration-300",
            "border-r border-border/50 backdrop-blur-xl",
            "bg-gradient-to-b from-background/95 via-background/90 to-background/85",
            "dark:from-[hsl(60_4%_10%/0.98)] dark:via-[hsl(60_4%_9%/0.95)] dark:to-[hsl(60_4%_8%/0.92)]",
            isCollapsed ? "w-[68px]" : "w-[280px]"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">E</span>
                        </div>
                        <span className="font-bold text-lg">E-Coma</span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
            </div>

            {/* Zone Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-2">
                {ZONE_NAVIGATION.zones.map((zone) => {
                    const colors = getZoneColors(zone.id);
                    const isActive = isZoneActive(zone);
                    const isExpanded = expandedZones.includes(zone.id);

                    return (
                        <div key={zone.id} className="mb-2">
                            {/* Zone Header */}
                            <button
                                onClick={() => !isCollapsed && toggleZone(zone.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                                    isActive
                                        ? `bg-gradient-to-r ${colors.gradient} ${colors.border} border`
                                        : "hover:bg-muted"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-lg shrink-0",
                                    colors.bg
                                )}>
                                    <zone.icon className={cn("h-5 w-5", colors.text)} />
                                </div>
                                {!isCollapsed && (
                                    <>
                                        <div className="flex-1 text-left">
                                            <p className={cn(
                                                "text-sm font-semibold",
                                                isActive ? colors.text : "text-foreground"
                                            )}>
                                                {language === "ar" ? zone.labelAr : zone.label}
                                            </p>
                                        </div>
                                        <ChevronDown className={cn(
                                            "h-4 w-4 text-muted-foreground transition-transform",
                                            isExpanded && "rotate-180"
                                        )} />
                                    </>
                                )}
                            </button>

                            {/* Zone Pages */}
                            {!isCollapsed && isExpanded && (
                                <div className="mt-1 ml-3 pl-3 border-l border-border/50 space-y-1">
                                    {zone.pages.map((page) => {
                                        const pageActive = isPageActive(page.route);
                                        const badge = getPageBadge(zone, page);

                                        return (
                                            <Link
                                                key={page.id}
                                                href={page.route}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm",
                                                    pageActive
                                                        ? `${colors.bg} ${colors.text} font-medium`
                                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                                )}
                                            >
                                                <page.icon className="h-4 w-4 shrink-0" />
                                                <span className="flex-1 truncate">
                                                    {language === "ar" ? page.labelAr : page.label}
                                                </span>
                                                {page.badge?.type === "alert" && badge > 0 && (
                                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-500 text-xs font-medium">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {badge}
                                                    </span>
                                                )}
                                                {page.isDefault && !page.badge && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase bg-primary/10 text-primary">
                                                        Default
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Collapsed Mode - Show icons only */}
                            {isCollapsed && (
                                <div className="mt-1 space-y-1">
                                    {zone.pages.map((page) => {
                                        const pageActive = isPageActive(page.route);
                                        return (
                                            <Link
                                                key={page.id}
                                                href={page.route}
                                                className={cn(
                                                    "flex items-center justify-center p-2 rounded-lg transition-all group relative",
                                                    pageActive
                                                        ? `${colors.bg} ${colors.text}`
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                )}
                                                title={page.label}
                                            >
                                                <page.icon className="h-4 w-4" />
                                                {/* Tooltip */}
                                                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap z-50">
                                                    {page.label}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className={cn(
                "p-3 border-t border-border shrink-0 space-y-1",
                isCollapsed && "flex flex-col items-center"
            )}>
                <Link
                    href="/admin/general"
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                        isCollapsed && "justify-center"
                    )}
                >
                    <Settings className="h-4 w-4" />
                    {!isCollapsed && <span className="text-sm">Settings</span>}
                </Link>
                <Link
                    href="/help"
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
                        isCollapsed && "justify-center"
                    )}
                >
                    <HelpCircle className="h-4 w-4" />
                    {!isCollapsed && <span className="text-sm">Help Center</span>}
                </Link>

                {/* Language Toggle */}
                {!isCollapsed && (
                    <button
                        onClick={() => setLanguage(l => l === "en" ? "ar" : "en")}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
                    >
                        {language === "en" ? "🇬🇧 English" : "🇩🇿 العربية"}
                    </button>
                )}
            </div>
        </aside>
    );
}
