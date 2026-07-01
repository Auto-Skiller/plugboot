"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import {
    LayoutDashboard, Settings, ShoppingBag, Users, BarChart, Search, Zap, Share2,
    MessageSquare, Palette, Bot, Star, Package, Calendar,
    HelpCircle, FlaskConical, Sparkles, Lightbulb,
    TrendingUp, Target, FileText, Send, Plus, ChevronDown, Clock, AlertTriangle, ChevronRight, ChevronLeft,
    Rocket, PartyPopper, CheckCircle2, Circle, ArrowRight, X, Activity // Added Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "@/components/core/ui/notification-center";
import { FullscreenToggle } from "@/components/core/ui/fullscreen-toggle";
import { OnboardingChecklist } from "@/components/core/ui/onboarding-checklist";
import { OnboardingModal } from "@/components/core/ui/modals/OnboardingModal"; // Keep import if needed elsewhere, or remove if unused locally (removing usage so can likely remove import, but keeping it to avoid breaking if other stuff uses it - actually removing it is cleaner)
import { QuickSettingsModal } from "@/components/core/ui/modals/QuickSettingsModal";
import { SystemStatusModal } from "@/components/core/ui/modals/SystemStatusModal";
import { ProfileMenu } from "./ProfileMenu";

import { NAV_GROUPS, NAV_PAGES, CATEGORY_COLORS, CATEGORY_GLOW_COLORS, BADGE_URGENCY_THRESHOLD, NavGroup, NavItem } from "@/config/navigation";
import { useWindowLayout } from "./WindowLayoutContext";
import { useScroll } from "./ScrollContext";
import { useMode } from "./ModeContext";
import { Lock, ShieldCheck, ChevronUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/core/ui/tooltip";

interface TopNavigationProps {
}

export function TopNavigation({ }: TopNavigationProps) {
    const pathname = usePathname();
    const { isTopNavCollapsed, toggleTopNav, toggleEcosystemBar, stickyActions } = useWindowLayout();
    const { isScrolled: _isScrolled } = useScroll();
    const isScrolled = true; // Always use compact "scrolled" style

    // Onboarding State moved to EcosystemBar
    // const [onboardingProgress, setOnboardingProgress] = useState(0);
    // ...


    // Quick Settings State
    const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
    const [isSystemStatusOpen, setIsSystemStatusOpen] = useState(false);

    // Favorites State
    const [favorites, setFavorites] = useState<string[]>([]);

    // Mode Context
    const { mode, activeTeam, sessionObjective, switchToAdminMode, switchToTeamMode, getTeamFromPath, canAccessPage } = useMode();
    const [pin, setPin] = useState("");
    const [pinError, setPinError] = useState(false);

    const handlePassToAdmin = () => {
        if (switchToAdminMode(pin)) {
            setPin("");
            setPinError(false);
        } else {
            setPinError(true);
            setTimeout(() => setPinError(false), 2000);
        }
    };

    // Load states
    useEffect(() => {
        // Load favorites
        const savedFavorites = localStorage.getItem("sidebar-favorites");
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }

        // Onboarding load logic moved to EcosystemBar
    }, []);

    // Onboarding handlers moved to EcosystemBar

    const toggleFavorite = useCallback((href: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFavorites(prev => {
            const updated = prev.includes(href)
                ? prev.filter(f => f !== href)
                : [...prev, href];
            localStorage.setItem("sidebar-favorites", JSON.stringify(updated));
            return updated;
        });
    }, []);

    // const onboardingCompletedCount = onboardingSteps.filter(s => s.completed).length;
    // ...


    // Use shared config
    const navPages = NAV_PAGES;

    const isActive = useCallback((href: string) => {
        return href === "/" ? pathname === "/" : pathname.startsWith(href);
    }, [pathname]);

    // Handle scroll styles
    const containerClasses = cn(
        "relative z-[40] flex justify-start px-4 transition-all duration-300",
        isScrolled && !isTopNavCollapsed ? "fixed top-0 inset-x-0 pt-2 pb-2 bg-background/80 backdrop-blur-sm" : "",
        isScrolled && isTopNavCollapsed ? "fixed top-0 inset-x-0 pt-2 pb-2" : "",
        !isScrolled ? "pt-4" : "",
        isTopNavCollapsed && !isScrolled ? "h-0 p-0 overflow-hidden opacity-0 pointer-events-none" : "", // Collapse fully when min+top
        'opacity-100'
    );

    const showButton = true; // Always show toggle button for nav collapse/expand

    // TEAM MODE NAVIGATION
    if (mode === "TEAM" && activeTeam) {
        return (
            <div className={containerClasses}>
                {/* 1. Toggle Button - Same as Admin Mode */}
                {showButton && (
                    <button
                        onClick={() => { toggleTopNav(); toggleEcosystemBar(); }}
                        className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border/80 transition-all duration-200 shadow-lg shrink-0 z-50",
                            isTopNavCollapsed ? "translate-x-0" : "mr-2"
                        )}
                        title={isTopNavCollapsed ? "Expand Navigation" : "Collapse Navigation"}
                    >
                        {isTopNavCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                )}

                {/* 2. Team Content - Collapsible Pill Container */}
                <div
                    className={cn(
                        "flex items-center gap-4 border border-border/40 bg-card/85 backdrop-blur-md rounded-full shadow-lg overflow-hidden transition-all duration-300 origin-left",
                        isTopNavCollapsed
                            ? "w-0 opacity-0 px-0 border-0 scale-95 pointer-events-none"
                            : "w-full max-w-4xl opacity-100 scale-100 px-4",
                        !isTopNavCollapsed && "h-14" // Maintain height when expanded
                    )}
                >
                    {/* Team Icon & Info */}
                    <div className="flex items-center gap-4 shrink-0 whitespace-nowrap">
                        <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-xl shadow-lg shrink-0",
                            "bg-gradient-to-br from-background to-muted border border-border"
                        )}>
                            <activeTeam.icon className={cn("w-6 h-6", activeTeam.color)} />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold flex items-center gap-2">
                                {activeTeam.name}
                                <span className="px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] border border-green-500/20">Active Session</span>
                            </h2>
                            <p className="text-xs text-muted-foreground max-w-[300px] truncate">
                                {sessionObjective}
                            </p>
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Right: Pass to Admin */}
                    <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-xl border border-border/50 shrink-0">
                        <div className="flex items-center gap-1.5 px-2">
                            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Admin Access</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <input
                                    type="password"
                                    value={pin}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 4) setPin(e.target.value);
                                        setPinError(false);
                                    }}
                                    placeholder="PIN"
                                    className={cn(
                                        "w-16 h-8 text-center text-sm font-mono tracking-widest bg-background border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all",
                                        pinError ? "border-destructive ring-destructive/50 text-destructive" : "border-border"
                                    )}
                                    maxLength={4}
                                />
                            </div>
                            <button
                                onClick={handlePassToAdmin}
                                disabled={pin.length !== 4}
                                className={cn(
                                    "h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm",
                                    pin.length === 4
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : "bg-muted text-muted-foreground cursor-not-allowed"
                                )}
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Pass to Admin
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={containerClasses}>


            {/* Sticky Actions - Shown when scrolled (page-specific actions) */}
            {isScrolled && stickyActions && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                    {stickyActions}
                </div>
            )}

            {/* Main Nav Pill - Left/Center */}
            <div className="flex items-center gap-2">
                {/* Toggle Button */}
                {showButton && (
                    <button
                        onClick={() => { toggleTopNav(); toggleEcosystemBar(); }}
                        className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-muted hover:border-border/80 transition-all duration-200 shadow-lg",
                            isTopNavCollapsed && isScrolled ? "translate-x-0" : ""
                        )}
                        title={isTopNavCollapsed ? "Expand Navigation" : "Collapse Navigation"}
                    >
                        {isTopNavCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                )}

                {/* Nav Pills - Hidden when collapsed */}
                <nav
                    className={cn(
                        "border border-border/40 bg-card/85 backdrop-blur-md rounded-full shadow-lg flex items-center gap-1 overflow-visible relative transition-all duration-300 origin-left",
                        isTopNavCollapsed
                            ? "w-0 h-14 opacity-0 overflow-hidden px-0 border-0 scale-95 pointer-events-none"
                            : cn(
                                "opacity-100 scale-100",
                                "w-fit max-w-full"
                            ),
                        !isTopNavCollapsed && isScrolled ? "h-9 px-3" : "h-14 px-6"
                    )}
                >
                    {/* Subtle Glow Border Effect */}
                    {!isTopNavCollapsed && (
                        <>
                            <div className="absolute inset-0 rounded-full ring-1 ring-border/5 pointer-events-none" />
                            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_hsl(var(--accent-orange)/0.05)] pointer-events-none opacity-50 dark:opacity-100" />
                        </>
                    )}

                    {/* Nav Pages */}
                    <div className={cn(
                        "flex items-center gap-1 overflow-x-auto no-scrollbar mask-linear-fade transition-all duration-300",
                        isScrolled ? "pr-0" : ""
                    )}>
                        {navPages.map((page) => {
                            const isPageAccessible = canAccessPage(page.href);
                            return (
                                <div key={page.href} className="flex items-center gap-1">
                                    <Link
                                        href={isPageAccessible ? page.href : "#"}
                                        onClick={(e) => !isPageAccessible && e.preventDefault()}
                                        className={cn(
                                            "flex items-center rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap relative group click-feedback shrink-0 font-[Poppins,Arial,sans-serif]",
                                            isScrolled ? "px-1.5 py-1 gap-1" : "px-3 py-2 gap-2",
                                            !isPageAccessible && "opacity-40 cursor-not-allowed",
                                            isActive(page.href)
                                                ? "bg-[hsl(var(--accent-orange))]/15 text-[hsl(var(--accent-orange))] shadow-[0_0_15px_hsl(var(--accent-orange)/0.25)] nav-active-underline"
                                                : isPageAccessible
                                                    ? "text-muted-foreground hover:bg-accent hover:text-foreground"
                                                    : "text-muted-foreground"
                                        )}>
                                        <page.icon className={cn(
                                            "transition-colors",
                                            isScrolled ? "h-3.5 w-3.5" : "h-3.5 w-3.5",
                                            isActive(page.href) ? "text-[hsl(var(--accent-orange))]" : "text-muted-foreground/70 group-hover:text-foreground/80"
                                        )} />
                                        <span className={cn(
                                            "transition-all duration-300 overflow-hidden whitespace-nowrap",
                                            isScrolled
                                                ? "max-w-[200px] opacity-100 text-[10px]"
                                                : "max-w-[200px] opacity-100"
                                        )}>
                                            {page.name}
                                        </span>

                                        {/* Badge */}
                                        {page.badge && (
                                            <span className={cn(
                                                "ml-1 px-1.5 py-0.5 font-bold rounded-full border",
                                                isScrolled ? "text-[8px]" : "text-[9px]",
                                                isActive(page.href)
                                                    ? "bg-[hsl(var(--accent-orange))] text-background border-[hsl(var(--accent-orange))]"
                                                    : "bg-destructive/20 text-destructive border-destructive/50"
                                            )}>
                                                {page.badge}
                                            </span>
                                        )}

                                        {/* Favorite Star */}
                                        <button
                                            onClick={(e) => toggleFavorite(page.href, e)}
                                            className={cn(
                                                "ml-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100",
                                                favorites.includes(page.href) && "opacity-100"
                                            )}
                                        >
                                            <Star className={cn(
                                                "w-3 h-3 transition-colors",
                                                favorites.includes(page.href)
                                                    ? "fill-yellow-500 text-yellow-500"
                                                    : "text-muted-foreground hover:text-yellow-500"
                                            )} />
                                        </button>
                                    </Link>

                                    {/* GLOBAL SWITCH TO TEAM MODE BUTTON - ONLY IN ADMIN MODE AND NEAR ACTIVE PAGE */}
                                    {isActive(page.href) && mode === "ADMIN" && (
                                        <div className="flex items-center">
                                            <div className="w-px h-3 bg-border/50 mx-0.5" />
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => {
                                                            const detectedTeam = getTeamFromPath && getTeamFromPath(pathname);
                                                            if (detectedTeam) {
                                                                switchToTeamMode(detectedTeam.id);
                                                            } else {
                                                                alert("No specific team context found for this page. Please navigate to a team page (e.g. Sales, Marketing) to switch.");
                                                            }
                                                        }}
                                                        className={cn(
                                                            "relative px-1.5 py-0.5 rounded-full text-[8px] font-bold overflow-hidden group transition-all duration-300 shrink-0",
                                                            "bg-gradient-to-r from-primary/10 to-blue-500/10",
                                                            "border border-primary/20 hover:border-primary/50",
                                                            "hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)]",
                                                            "text-primary flex items-center gap-0.5"
                                                        )}
                                                    >
                                                        <Lock className="w-2 h-2 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
                                                        <span className="relative z-10 font-bold tracking-wide">TEAM</span>
                                                        {/* Background shine effect */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom" className="text-xs">
                                                    Switch the current page to Focused Team Mode
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </nav>
            </div >



            {/* Right Side Actions - Separate Persistent Container */}
            <div className={cn(
                "flex items-center gap-1.5 ml-auto border border-border/40 bg-card/85 backdrop-blur-md rounded-full shadow-lg transition-all duration-300 origin-right",
                isTopNavCollapsed
                    ? "w-0 opacity-0 overflow-hidden px-0 border-0 scale-95 pointer-events-none"
                    : "opacity-100 scale-100",
                !isTopNavCollapsed && isScrolled ? "h-9 px-2" : "h-14 px-4 gap-2"
            )}>
                {/* Command Palette - REMOVED (Moved to Ecosystem Bar) */}
                {/* <CommandPalette compact className="hidden md:flex border-none bg-transparent hover:bg-muted/50 w-8 h-8 rounded-full" /> */}

                {/* Onboarding Button - REMOVED (Moved to Ecosystem Bar) */}




                {/* Utilities - Always visible & Persistent */}
                <div className={cn("flex items-center gap-1", isScrolled ? "" : "pl-2 ml-1 border-l border-border/20")}>
                    <button onClick={() => setQuickSettingsOpen(true)}>
                        <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                    </button>
                    <QuickSettingsModal
                        isOpen={quickSettingsOpen}
                        onClose={() => setQuickSettingsOpen(false)}
                    />
                    <NotificationCenter />
                    <FullscreenToggle className="hidden md:flex" />

                    {/* System Status System (Moved from Ecosystem Bar) */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    className="flex items-center justify-center w-8 h-8 rounded-full border border-transparent hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                                    onClick={() => setIsSystemStatusOpen(true)}
                                >
                                    <Activity className="h-4 w-4" />
                                    <span className="sr-only">System Status</span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>System Status</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <SystemStatusModal
                        open={isSystemStatusOpen}
                        onOpenChange={setIsSystemStatusOpen}
                    />
                </div>
                {/* Profile Menu - Popup opens left */}
                <ProfileMenu
                    variant="header"
                    user={{
                        name: "User",
                        email: "user@riglify.com",
                        plan: "Free"
                    }}
                    align="end"
                    triggerClassName={isScrolled ? "w-7 h-7 text-xs" : undefined}
                />
            </div>
        </div>
    );
}

