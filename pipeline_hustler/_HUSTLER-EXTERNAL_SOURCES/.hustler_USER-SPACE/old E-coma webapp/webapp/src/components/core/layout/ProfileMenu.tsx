"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    User, Moon, Sun, Keyboard, Globe, HelpCircle, LogOut,
    ChevronRight, ChevronLeft, Sparkles, CreditCard, UserPlus, Zap, Monitor,
    Users, Settings
} from "lucide-react";
import { ProfileSettingsModal } from "@/components/core/ui/modals/profile/ProfileSettingsModal";
import { ReferralModal } from "@/components/core/ui/modals/profile/ReferralModal";
import { KeyboardShortcutsModal } from "@/components/core/ui/modals/profile/KeyboardShortcutsModal";
import { SignOutConfirmModal } from "@/components/core/ui/modals/profile/SignOutConfirmModal";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/core/ui/theme-provider";
import { useAuth } from "./AuthProvider";

interface ProfileMenuProps {
    user?: {
        name: string;
        email: string;
        avatar?: string;
        plan?: string;
    };
    variant?: "header" | "sidebar";
    /** Callback when menu open state changes - enables mutual exclusion with other menus */
    onOpenChange?: (isOpen: boolean) => void;
    /** Controlled open state from parent */
    isOpenControlled?: boolean;
    /** Dropdown alignment */
    align?: "start" | "end";
    /** Optional class name for the trigger button */
    triggerClassName?: string;
}

export function ProfileMenu({
    user = { name: "User", email: "user@riglify.com", plan: "Free" },
    variant = "header",

    onOpenChange,
    isOpenControlled,
    align = "end",
    triggerClassName
}: ProfileMenuProps) {
    const { user: authUser, logout } = useAuth();

    // Fallback if auth context is not yet waiting or empty (though it should handle loading)
    const displayUser = authUser || user;

    const [isOpenInternal, setIsOpenInternal] = useState(false);
    const [showSubMenu, setShowSubMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { resolvedTheme, toggleTheme } = useTheme();

    // Use controlled state if provided, otherwise use internal state
    const isOpen = isOpenControlled !== undefined ? isOpenControlled : isOpenInternal;

    const setIsOpen = useCallback((open: boolean) => {
        setIsOpenInternal(open);
        onOpenChange?.(open);
    }, [onOpenChange]);

    // Widget visibility state
    const [helpWidgetVisible, setHelpWidgetVisible] = useState(true);

    useEffect(() => {
        const helpVis = localStorage.getItem("riglify-help-widget-visible");
        if (helpVis !== null) setHelpWidgetVisible(JSON.parse(helpVis));
    }, []);

    const toggleHelpWidget = () => {
        const newValue = !helpWidgetVisible;
        setHelpWidgetVisible(newValue);
        localStorage.setItem("riglify-help-widget-visible", JSON.stringify(newValue));
        window.dispatchEvent(new CustomEvent('toggle-help-widget'));
    };

    // Modal states
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsTab, setSettingsTab] = useState("general");
    const [isReferralOpen, setIsReferralOpen] = useState(false);
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
    const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);

    const openSettings = (tab: string = "general") => {
        setSettingsTab(tab);
        setIsSettingsOpen(true);
        setIsOpen(false); // Close menu
    };

    const handleSignOut = () => {
        setIsSignOutConfirmOpen(false);
        logout();
        setIsOpen(false);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setShowSubMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsOpen]);

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
                setShowSubMenu(false);
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [setIsOpen]);

    return (
        <div className="relative" ref={menuRef}>
            {/* Avatar Trigger - Anthropic Brand Styling with Theme Support */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all font-[Poppins,Arial,sans-serif]",
                    "bg-gradient-to-br from-[hsl(var(--accent-orange))] to-[hsl(var(--accent-blue))] text-[hsl(var(--background))] font-semibold text-sm",
                    "hover:ring-2 hover:ring-[hsl(var(--accent-orange))]/50 hover:ring-offset-2 hover:ring-offset-background",
                    isOpen && "ring-2 ring-[hsl(var(--accent-orange))] ring-offset-2 ring-offset-background",
                    triggerClassName
                )}
            >
                {displayUser.avatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={displayUser.avatar} alt={displayUser.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                    displayUser.name.charAt(0).toUpperCase()
                )}
            </button>

            {/* Menu Panel - Anthropic Brand with Theme Support */}
            {isOpen && (

                <div
                    className={cn(
                        "absolute w-72 bg-popover/95 backdrop-blur-xl border border-border rounded-2xl shadow-[0_0_30px_hsl(var(--accent-orange)/0.15)] z-[70] duration-200 ring-1 ring-[hsl(var(--accent-orange))]/10",
                        variant === "sidebar"
                            ? "left-full top-0 ml-4 animate-in fade-in slide-in-from-left-2"
                            : cn(
                                "top-12 animate-in fade-in slide-in-from-top-2",
                                align === "end" ? "right-0" : "left-0"
                            )
                    )}
                >
                    {/* Header with Logo - Anthropic Brand */}
                    <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-[hsl(var(--accent-orange))]/10 to-[hsl(var(--accent-blue))]/10">
                        <div className="font-bold text-lg bg-gradient-to-r from-[hsl(var(--accent-orange))] to-[hsl(var(--accent-blue))] bg-clip-text text-transparent text-right font-[Poppins,Arial,sans-serif]">
                            Riglify
                        </div>
                    </div>

                    {/* User Info */}
                    <div
                        className="px-4 py-3 border-b border-border hover:bg-accent cursor-pointer transition-colors relative"
                        onMouseEnter={() => setShowSubMenu(true)}
                        onMouseLeave={() => setShowSubMenu(false)}
                        onClick={() => setShowSubMenu((prev) => !prev)}
                    >
                        <div className="flex items-center gap-3">
                            {align === "end" ? (
                                <>
                                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1 min-w-0 text-right">
                                        <div className="font-medium text-foreground truncate font-[Poppins,Arial,sans-serif]">{displayUser.name}</div>
                                        <div className="text-xs text-muted-foreground truncate font-[Lora,Georgia,serif]">{displayUser.email}</div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--accent-orange))] to-[hsl(var(--accent-blue))] flex items-center justify-center text-background font-semibold font-[Poppins,Arial,sans-serif]">
                                        {displayUser.name.charAt(0).toUpperCase()}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--accent-orange))] to-[hsl(var(--accent-blue))] flex items-center justify-center text-background font-semibold font-[Poppins,Arial,sans-serif]">
                                        {displayUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="font-medium text-foreground truncate font-[Poppins,Arial,sans-serif]">{displayUser.name}</div>
                                        <div className="text-xs text-muted-foreground truncate font-[Lora,Georgia,serif]">{displayUser.email}</div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </>
                            )}
                        </div>

                        {/* Sub Menu - Anthropic Brand with Theme Support */}
                        {showSubMenu && (
                            <div className={cn(
                                "absolute top-0 w-56 bg-popover/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 py-2 animate-in fade-in duration-150",
                                align === "end"
                                    ? "right-full mr-2 slide-in-from-right-2"
                                    : "left-full ml-2 slide-in-from-left-2"
                            )}>
                                <Link href="/admin/billing" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[hsl(var(--accent-orange))] hover:bg-accent transition-colors font-[Lora,Georgia,serif]">
                                    <Sparkles className="h-4 w-4" />
                                    Explore our plans
                                </Link>
                                <button onClick={() => openSettings("general")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-[Lora,Georgia,serif]">
                                    <User className="h-4 w-4" />
                                    Your profile
                                </button>
                                <button onClick={() => openSettings("security")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-[Lora,Georgia,serif]">
                                    <Users className="h-4 w-4" />
                                    Team & Security
                                </button>
                                <button onClick={() => openSettings("billing")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-[Lora,Georgia,serif]">
                                    <CreditCard className="h-4 w-4" />
                                    Credits & Billing
                                </button>
                                <button onClick={() => { setIsReferralOpen(true); setIsOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-[Lora,Georgia,serif]">
                                    <div className="flex items-center gap-3">
                                        <UserPlus className="h-4 w-4" />
                                        Refer a friend
                                    </div>
                                    <span className="text-muted-foreground/70">$0</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Navigation Items */}
                    <div className="py-2">

                        <Link href="/whats-new" className="flex items-center justify-between px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-[Lora,Georgia,serif]">
                            <span className="flex items-center gap-3">
                                <Zap className="h-4 w-4" />
                                What&apos;s new
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-[hsl(var(--accent-orange))] text-background rounded-full font-[Poppins,Arial,sans-serif]">11</span>
                        </Link>
                    </div>

                    {/* Toggles */}
                    <div className="py-2 border-t border-border">
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-[Lora,Georgia,serif]"
                        >
                            <span className="flex items-center gap-3">
                                {resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                                Dark theme
                            </span>
                            <div className={cn(
                                "w-10 h-5 rounded-full transition-colors relative",
                                resolvedTheme === "dark" ? "bg-[hsl(var(--accent-orange))]" : "bg-muted"
                            )}>
                                <div className={cn(
                                    "absolute top-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform",
                                    resolvedTheme === "dark" ? "translate-x-5" : "translate-x-0.5"
                                )} />
                            </div>
                        </button>

                        <button
                            onClick={toggleHelpWidget}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-[Lora,Georgia,serif]"
                        >
                            <span className="flex items-center gap-3">
                                <HelpCircle className="h-4 w-4" />
                                Co-pilot & Help
                            </span>
                            <div className={cn(
                                "w-10 h-5 rounded-full transition-colors relative",
                                helpWidgetVisible ? "bg-[hsl(var(--accent-blue))]" : "bg-muted"
                            )}>
                                <div className={cn(
                                    "absolute top-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform",
                                    helpWidgetVisible ? "translate-x-5" : "translate-x-0.5"
                                )} />
                            </div>
                        </button>
                    </div>

                    {/* Settings */}
                    <div className="py-2 border-t border-border">
                        <button onClick={() => { setIsShortcutsOpen(true); setIsOpen(false); }} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-[Lora,Georgia,serif]">
                            <span className="flex items-center gap-3">
                                <Keyboard className="h-4 w-4" />
                                Keyboard shortcuts
                            </span>
                        </button>
                        <button className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-[Lora,Georgia,serif]">
                            <span className="flex items-center gap-3">
                                <Globe className="h-4 w-4" />
                                Language
                            </span>
                            <span className="text-xs">English</span>
                        </button>

                    </div>

                    {/* App Access */}
                    <div className="py-2 border-t border-border">
                        <Link href="/download" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-[Lora,Georgia,serif]">
                            <Monitor className="h-4 w-4" />
                            Get Desktop App
                        </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="py-2 border-t border-border">
                        <button onClick={() => { setIsSignOutConfirmOpen(true); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[hsl(var(--accent-orange))] hover:bg-[hsl(var(--accent-orange))]/10 transition-colors font-[Lora,Georgia,serif]">
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <ProfileSettingsModal
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
                initialTab={settingsTab}
            />
            <ReferralModal
                open={isReferralOpen}
                onOpenChange={setIsReferralOpen}
            />
            <KeyboardShortcutsModal
                open={isShortcutsOpen}
                onOpenChange={setIsShortcutsOpen}
            />
            <SignOutConfirmModal
                open={isSignOutConfirmOpen}
                onOpenChange={setIsSignOutConfirmOpen}
                onConfirm={handleSignOut}
            />
        </div>
    );
}
