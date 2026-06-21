import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "lucide-react"; // Wait, Link is from next/link usually. Oh, looking at previous file content, Link was next/link.
// Checking imports...
import { usePathname } from "next/navigation";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Clock, Target, Sparkles, X, ChevronUp as ChevronUpIcon, Bot, Lightbulb, TrendingUp, ThumbsUp, ThumbsDown, Settings, Bell, StickyNote, Rocket, PartyPopper } from "lucide-react";
import { CommandPalette } from "@/components/core/ui/command-palette";
import { cn } from "@/lib/utils";
import { SessionModal } from "./SessionModal";
import { TeamConfigModal } from "./TeamConfigModal";
import { NotificationCenterModal } from "@/components/core/ui/modals/NotificationCenterModal";
import { QuickNotesModal } from "@/components/core/ui/modals/QuickNotesModal";
// SystemStatusModal moved to TopNavigation
import { usePageActions } from "@/components/core/layout/PageActionsContext";
import { AISuggestion } from "@/types/ai-tips";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/core/ui/popover";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { TEAMS } from "@/config/teams";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

import { NAV_GROUPS, CATEGORY_COLORS, NavItem } from "@/config/navigation";
import {
    ECOSYSTEM_MODULES,
    STATUS_COLORS,
    STATUS_LABELS,
    getModuleStatus,
    ModuleStatusInfo
} from "@/config/ecosystem-config";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider
} from "@/components/core/ui/tooltip";
import { useWindowLayout } from "@/components/core/layout/WindowLayoutContext";
import { useScroll } from "@/components/core/layout/ScrollContext";
import { useMode } from "@/components/core/layout/ModeContext";
import { ProductTour } from "@/components/core/layout/ProductTour";
import { TOUR_CONFIG } from "@/config/tour-config";
import { Flag } from "lucide-react";
import { PageTabsNavigation } from "@/components/core/layout/PageTabsNavigation";



interface EcosystemBarProps {
    onModuleClick?: (moduleId: string) => void;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
}

export function EcosystemBar({ onModuleClick, isExpanded = false, onToggleExpand }: EcosystemBarProps) {
    const { isTopNavCollapsed, isEcosystemBarCollapsed, toggleEcosystemBar } = useWindowLayout();
    const { isScrolled } = useScroll();
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [moduleStatuses, setModuleStatuses] = useState<Record<string, ModuleStatusInfo>>({});

    // Onboarding State moved to FloatingOnboardingWidget
    // ...

    // Load module statuses
    useEffect(() => {
        const statuses: Record<string, ModuleStatusInfo> = {};
        ECOSYSTEM_MODULES.forEach(m => {
            statuses[m.id] = getModuleStatus(m.id);
        });
        setModuleStatuses(statuses);
    }, []);

    const getStatusColor = (status: ModuleStatusInfo) => STATUS_COLORS[status.status] || STATUS_COLORS.disconnected;

    const handleModuleClick = useCallback((moduleId: string) => {
        setActiveModule(prev => prev === moduleId ? null : moduleId);
        onModuleClick?.(moduleId);
    }, [onModuleClick]);



    // Get all modules (previously split into left/right)
    const allModules = ECOSYSTEM_MODULES;

    const renderModuleButton = (module: typeof ECOSYSTEM_MODULES[0]) => {
        const status = moduleStatuses[module.id] || { status: 'disconnected' };
        const colors = getStatusColor(status);
        const isActive = activeModule === module.id;

        return (
            <Tooltip key={module.id}>
                <TooltipTrigger asChild>
                    <button
                        onClick={() => handleModuleClick(module.id)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all relative click-feedback shrink-0",
                            isActive
                                ? "bg-primary/15 text-primary module-active-indicator"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <module.icon className="h-4 w-4" />
                        <span className="hidden lg:inline">{module.shortName}</span>

                        {/* Status dot */}
                        <span
                            className={cn(
                                "absolute top-1 right-1 h-2 w-2 rounded-full ring-2",
                                colors.bg,
                                colors.ring,
                                status.status === 'attention' && "status-dot-attention"
                            )}
                        />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[220px] p-3">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                            <span className="font-semibold">{module.name}</span>
                            {module.shortcut && (
                                <kbd className="tooltip-shortcut">{module.shortcut}</kbd>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">{module.description}</p>
                        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                            <span className={cn("h-2 w-2 rounded-full", colors.bg)} />
                            <span className="text-xs">{STATUS_LABELS[status.status]}</span>
                            {status.progress && (
                                <span className="text-xs text-primary ml-auto">
                                    {status.progress.current}/{status.progress.total}
                                </span>
                            )}
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        );
    };



    // Session Info State relative to EcosystemBar
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [sessionStart] = useState<Date>(new Date()); // Mock session start
    const { isAdmin, mode, activeTeams, onlineTeams } = useMode();
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [isTeamConfigOpen, setIsTeamConfigOpen] = useState(false);

    // New Modals State
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isQuickNotesOpen, setIsQuickNotesOpen] = useState(false);
    // System Status moved to TopNavigation


    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const sessionDuration = Math.floor((currentTime.getTime() - sessionStart.getTime()) / 60000); // minutes

    const handleSessionClick = () => {
        if (!isAdmin) {
            setIsSessionModalOpen(true);
        } else {
            handleModuleClick('session');
        }
    };

    // Product Tour State
    const pathname = usePathname();
    const [isTourOpen, setIsTourOpen] = useState(false);
    const tourSteps = TOUR_CONFIG[pathname] || [];

    // AI Tips State
    const { suggestions, setSuggestions } = usePageActions();
    const [isAIOpen, setIsAIOpen] = useState(false);

    const getTypeIcon = (type: AISuggestion["type"]) => {
        switch (type) {
            case "timing": return Clock;
            case "trend": return TrendingUp;
            case "content": return Lightbulb;
            case "improvement": return Sparkles;
        }
    };

    const getTypeColor = (type: AISuggestion["type"]) => {
        switch (type) {
            case "timing": return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
            case "trend": return "text-green-500 bg-green-100 dark:bg-green-900/30";
            case "content": return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30";
            case "improvement": return "text-purple-500 bg-purple-100 dark:bg-purple-900/30";
        }
    };

    const dismissSuggestion = (id: string) => {
        setSuggestions(suggestions.filter(s => s.id !== id));
    };

    // Tabs Logic - now using local state since pages use local tab navigation
    // The center section will show modules when no external tabs are configured
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const hasTabs = false; // Tabs now handled by individual pages with InlineTabNavigation

    const scrollTabs = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: "smooth"
            });
        }
    };

    // Full bar view
    return (
        <TooltipProvider delayDuration={200}>
            {/* Product Tour Component */}
            {isTourOpen && (
                <ProductTour
                    steps={tourSteps}
                    autoStart={true}
                    onClose={() => setIsTourOpen(false)}
                />
            )}

            <div className={cn(
                "hidden md:block fixed z-[40] transition-all duration-300 left-0 right-0",
                // Collapse behavior - slide down when collapsed
                isEcosystemBarCollapsed
                    ? "translate-y-full opacity-0 pointer-events-none"
                    : "translate-y-0 opacity-100",
                // Always attached at bottom with consistent styling
                "bottom-0 border-t border-border/40 bg-card/85 backdrop-blur-md shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.5)]"
            )}>
                <div className="h-12 w-full flex items-center justify-between pl-4 pr-2 relative gap-4">

                    {/* LEFT SECTION: Session Info */}
                    <div className="flex items-center gap-4 shrink-0">
                        {/* Session Timer & User */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground border-r border-border/20 pr-4">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{sessionStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-muted-foreground/50">({sessionDuration}m)</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="font-medium text-foreground">User</span>
                        </div>

                        {/* Session Objectives Panel */}
                        <button
                            onClick={handleSessionClick}
                            className={cn(
                                "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-300 group",
                                "bg-primary/10 text-primary border border-primary/20",
                                "hover:bg-primary/20 hover:border-primary/40 hover:shadow-[0_0_10px_hsl(var(--primary)/0.2)]",
                                activeModule === 'session' && "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
                            )}
                        >
                            <Target className={cn(
                                "w-3.5 h-3.5 transition-transform duration-500",
                                activeModule === 'session' && "rotate-180 scale-110",
                                "group-hover:rotate-12"
                            )} />
                            <span>{mode === "ADMIN" ? "Admin Objectives" : "Session Objectives"}</span>
                        </button>

                        {/* Quick Notes (Moved from Right Section) */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-9 w-9 p-0 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground",
                                        isQuickNotesOpen && "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500"
                                    )}
                                    onClick={() => setIsQuickNotesOpen(true)}
                                >
                                    <StickyNote className="h-4 w-4" />
                                    <span className="sr-only">Quick Notes</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Quick Notes</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Onboarding Button (Moved to Floating Widget) */}
                    </div>


                    {/* CENTER SECTION: Page Tabs Navigation */}
                    <div className="flex-1 flex items-center justify-center min-w-0 px-4">
                        <PageTabsNavigation />
                    </div>

                    {/* RIGHT SECTION: Search & Tour & Detail Toggle */}
                    <div className="flex items-center gap-2 shrink-0">

                        {/* Collaboration UI (Moved from CollaborationBar) - ONLY IN ADMIN MODE */}
                        {mode === "ADMIN" && (
                            <div className="hidden lg:flex items-center gap-3 mr-2 pr-2 border-r border-border/20">
                                {/* Active Teams Count */}
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
                                    <Users className="h-3.5 w-3.5" />
                                    <span>{onlineTeams.length} Active Teams</span>
                                </div>

                                {/* Team Icons - Only show active teams */}
                                <div className="flex -space-x-1.5">
                                    {onlineTeams.map((team) => (
                                        <Tooltip key={team.id}>
                                            <TooltipTrigger asChild>
                                                <motion.button
                                                    whileHover={{ scale: 1.1, zIndex: 10 }}
                                                    className="relative group"
                                                    onClick={() => {
                                                        if (typeof window !== 'undefined') {
                                                            const event = new CustomEvent('open-module', { detail: 'session' });
                                                            window.dispatchEvent(event);
                                                        }
                                                    }}
                                                >
                                                    <div className={cn(
                                                        "flex items-center justify-center w-7 h-7 rounded-full border border-background cursor-pointer bg-card shadow-sm",
                                                        "hover:ring-2 hover:ring-primary ring-offset-1 ring-offset-background"
                                                    )}>
                                                        <team.icon className={cn("h-3.5 w-3.5", team.color)} />
                                                    </div>
                                                    {/* Active indicator */}
                                                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-background rounded-full z-20" />
                                                </motion.button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-xs">
                                                <div className="font-medium">{team.name}</div>
                                                <div className="text-muted-foreground">Click to manage session</div>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>

                                {/* Team Configuration Button */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => setIsTeamConfigOpen(true)}
                                            className={cn(
                                                "flex items-center justify-center w-7 h-7 rounded-full border border-border/50 cursor-pointer bg-muted/50 shadow-sm transition-all",
                                                "hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                                            )}
                                        >
                                            <Settings className="h-3.5 w-3.5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                        <div className="font-medium">Team Configuration</div>
                                        <div className="text-muted-foreground">Manage team access & objectives</div>
                                    </TooltipContent>
                                </Tooltip>

                                {/* Notification Center (Admin Only) */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => setIsNotificationOpen(true)}
                                            className={cn(
                                                "flex items-center justify-center w-7 h-7 rounded-full border border-border/50 cursor-pointer bg-muted/50 shadow-sm transition-all relative",
                                                "hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                                            )}
                                        >
                                            <Bell className="h-3.5 w-3.5" />
                                            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full ring-2 ring-background scale-75" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                        <div className="font-medium">Notification Center</div>
                                        <div className="text-muted-foreground">View system alerts (Admin)</div>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )}

                        {/* AI Tips Button (Left of Search) */}
                        <Popover open={isAIOpen} onOpenChange={setIsAIOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-9 w-9 p-0 rounded-full hover:bg-muted relative transition-colors",
                                        isAIOpen && "bg-primary/10 text-primary",
                                        suggestions.length > 0 && "text-primary"
                                    )}
                                >
                                    <Bot className="h-5 w-5" />
                                    {suggestions.length > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px] ring-2 ring-background"
                                        >
                                            {suggestions.length}
                                        </Badge>
                                    )}
                                    <span className="sr-only">AI Tips</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="end" sideOffset={12}>
                                <div className="p-3 border-b bg-muted/30">
                                    <div className="flex items-center gap-2">
                                        <Bot className="h-4 w-4 text-primary" />
                                        <span className="font-semibold text-sm">AI Suggestions</span>
                                        <Badge variant="secondary" className="text-[10px] ml-auto">
                                            {suggestions.length} tips
                                        </Badge>
                                    </div>
                                </div>
                                <div className="max-h-64 overflow-y-auto p-2 space-y-2">
                                    {suggestions.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No suggestions right now. Keep creating! ✨
                                        </p>
                                    ) : (
                                        suggestions.map((suggestion) => {
                                            const Icon = getTypeIcon(suggestion.type);
                                            return (
                                                <div
                                                    key={suggestion.id}
                                                    className="p-3 rounded-lg bg-muted/50 border hover:bg-muted/80 transition-colors"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <div className={cn("p-1.5 rounded-md", getTypeColor(suggestion.type))}>
                                                            <Icon className="h-3.5 w-3.5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-xs">{suggestion.title}</p>
                                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                                {suggestion.description}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                {suggestion.action && (
                                                                    <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1">
                                                                        {suggestion.action}
                                                                        <ChevronRight className="h-3 w-3" />
                                                                    </Button>
                                                                )}
                                                                <div className="flex-1" />
                                                                <button
                                                                    onClick={() => dismissSuggestion(suggestion.id)}
                                                                    className="p-1 text-muted-foreground hover:text-green-500"
                                                                    aria-label="Helpful"
                                                                >
                                                                    <ThumbsUp className="h-3 w-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => dismissSuggestion(suggestion.id)}
                                                                    className="p-1 text-muted-foreground hover:text-red-500"
                                                                    aria-label="Not helpful"
                                                                >
                                                                    <ThumbsDown className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Search */}
                        <CommandPalette compact className="bg-transparent border-0 hover:bg-muted w-9 h-9 rounded-full transition-colors text-muted-foreground hover:text-foreground" />

                        {/* Quick Notes Removed from here */}

                        {/* System Status Removed from here */}


                        {/* Product Tour Trigger */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                                    onClick={() => setIsTourOpen(true)}
                                >
                                    <Flag className="h-4 w-4" />
                                    <span className="sr-only">Start Product Tour</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Take a Tour</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                </div>
            </div>

            <SessionModal
                isOpen={isSessionModalOpen}
                onClose={() => setIsSessionModalOpen(false)}
            />
            <TeamConfigModal
                isOpen={isTeamConfigOpen}
                onClose={() => setIsTeamConfigOpen(false)}
            />

            <NotificationCenterModal
                open={isNotificationOpen}
                onOpenChange={setIsNotificationOpen}
            />

            <QuickNotesModal
                open={isQuickNotesOpen}
                onOpenChange={setIsQuickNotesOpen}
            />

        </TooltipProvider>
    );
}

// DetailPanel is now a standalone component in DetailPanel.tsx
// Export it from here for backwards compatibility
export { DetailPanel } from "./DetailPanel";

