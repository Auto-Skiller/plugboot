"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { TopNavigation } from "./TopNavigation";
import { EcosystemBar, DetailPanel } from "./EcosystemBar";
import { BottomPanel } from "./BottomPanel";
import { WindowLayoutProvider, useWindowLayout } from "./WindowLayoutContext";
import { ScrollProvider, useScroll } from "./ScrollContext";
import { HelpProvider } from "./HelpContext";
import { PageActionsProvider, usePageActions } from "./PageActionsContext";
import { ModeProvider, useMode } from "./ModeContext";

import { CommandPalette } from "@/components/core/ui/command-palette";
import { NotificationCenter } from "@/components/core/ui/notification-center";

import { FloatingHelpWidget } from "@/app/help/_components/FloatingHelpWidget";
import { FloatingOnboardingWidget } from "@/components/core/ui/FloatingOnboardingWidget";

import { MobileSidebar, BottomTabBar } from "@/components/core/ui/mobile-sidebar";
import { PeriodSelector } from "@/components/core/ui/period-selector";
import { ViewModeToggle } from "@/components/core/ui/view-mode-toggle";
import { Breadcrumb, BreadcrumbItem } from "@/components/core/ui/breadcrumb";
import { Settings, Maximize2, Minimize2, ChevronRight } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Period } from "@/components/core/ui/period-selector";
import { ProfileMenu } from "./ProfileMenu";
import { saveLastVisitedPage } from "@/lib/last-visited";
import { AuthProvider } from "./AuthProvider";
import { BillingProvider } from "./BillingProvider";

interface LayoutWrapperProps {
    children: React.ReactNode;
}

// Inner component that uses the context
function LayoutContent({ children }: LayoutWrapperProps) {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<Period>("today");
    const [viewMode, setViewMode] = useState<"count" | "rate">("count");
    // RightPanel removed - pages now use local state for tabs/panels
    const { isTopNavCollapsed, toggleTopNav, setRightPanelOpen } = useWindowLayout();
    const { isScrolled } = useScroll();
    const { actions: pageActions } = usePageActions();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Generate breadcrumbs based on current path and config
    // Must be before any early returns to satisfy React hooks rules
    const breadcrumbs = useMemo(() => {
        const items: BreadcrumbItem[] = [];
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length === 0) return items;

        const routeMap: Record<string, { label: string; href: string }> = {
            'ecommerce': { label: 'E-Commerce', href: '/ecommerce/orders' },
            'social': { label: 'Social Content', href: '/social/inbox' },
            'marketing': { label: 'Marketing & ADS', href: '/marketing/ads-manager' },
            'beta': { label: 'Beta', href: '/beta' },
            'admin': { label: 'Admin', href: '/admin/general' },
        };

        if (segments.length >= 1 && routeMap[segments[0]]) {
            items.push({
                label: routeMap[segments[0]].label,
                href: routeMap[segments[0]].href
            });
        }
        return items;
    }, [pathname]);

    // Track last visited page for redirect on next visit
    useEffect(() => {
        saveLastVisitedPage(pathname);
    }, [pathname]);

    // Enforce Access Control
    const { canAccessPage } = useMode();
    useEffect(() => {
        // Allow public/hub pages
        if (pathname === '/hub' || pathname.startsWith('/auth')) return;

        if (!canAccessPage(pathname)) {
            // If access is denied (e.g. Team inactive or wrong page), redirect to Hub
            router.push('/hub');
        }
    }, [pathname, canAccessPage, router]);

    // Sync focus mode with fullscreen changes (e.g. Esc key)
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFocusMode(false);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Skip full layout for hub page (fullscreen mode)
    if (pathname === '/hub') {
        return <>{children}</>;
    }

    const handleProfileMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsProfileMenuOpen(true);
    };

    const handleProfileMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setIsProfileMenuOpen(false);
        }, 300);
    };
    const handleModuleClick = (moduleId: string) => {
        if (activeModule === moduleId && isPanelOpen) {
            setIsPanelOpen(false);
            setActiveModule(null);
        } else {
            setActiveModule(moduleId);
            setIsPanelOpen(true);
        }
    };


    const handleToggleExpand = () => {
        // Toggle panel expansion logic only
        if (isPanelOpen) {
            setIsPanelOpen(false);
            setActiveModule(null);
        }
    };



    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setActiveModule(null);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground relative selection:bg-primary/30">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />

            {/* Top Navigation - Floating Capsule */}
            <TopNavigation />

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 relative z-10 transition-all duration-300 ${isFocusMode ? 'pt-4' : 'pt-2'}`}>


                {/* Content Row with Split Layout */}
                <div className="flex-1 flex relative px-4 md:px-6">
                    <main className={`w-full p-4 md:p-6 pb-20 md:pb-16`}>
                        {children}
                    </main>
                </div>
            </div>

            {/* Ecosystem Bar - Bottom */}
            <EcosystemBar
                onModuleClick={handleModuleClick}
                isExpanded={isPanelOpen}
                onToggleExpand={handleToggleExpand}
            />

            {/* Bottom Panel - Expandable */}
            <BottomPanel
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
                activeModule={activeModule}
            />

            {/* Mobile Bottom Tab Bar */}
            <div className="md:hidden">
                <BottomTabBar />
            </div>

            {/* Floating Widgets */}
            <FloatingHelpWidget />
            <FloatingOnboardingWidget />
        </div>
    );
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
    return (
        <HelpProvider>
            <AuthProvider>
                <BillingProvider>
                    <ScrollProvider threshold={100}>
                        <WindowLayoutProvider>
                            <PageActionsProvider>
                                <ModeProvider>
                                    <LayoutContent>{children}</LayoutContent>
                                </ModeProvider>
                            </PageActionsProvider>
                        </WindowLayoutProvider>
                    </ScrollProvider>
                </BillingProvider>
            </AuthProvider>
        </HelpProvider>
    );
}
