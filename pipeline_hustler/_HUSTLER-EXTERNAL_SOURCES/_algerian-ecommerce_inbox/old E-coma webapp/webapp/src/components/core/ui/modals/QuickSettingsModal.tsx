"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    X, Settings, Moon, Sun, Monitor,
    Type, LayoutGrid, LayoutList, Bell, Shield
} from "lucide-react";
import { useTheme } from "next-themes";

interface QuickSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function QuickSettingsModal({ isOpen, onClose }: QuickSettingsModalProps) {
    const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
    // Mocking theme state for safety if provider missing
    const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
    const [notifications, setNotifications] = useState(true);

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-transparent z-[80]"
                onClick={onClose}
            />
            <div className="fixed right-20 top-16 w-[320px] z-[90] animate-in slide-in-from-top-5 fade-in-0">
                <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden ring-1 ring-border/5">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold">Quick Settings</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    </div>

                    <div className="p-2 space-y-1">
                        {/* Theme Section */}
                        <div className="px-2 py-2">
                            <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Appearance</label>
                            <div className="grid grid-cols-3 gap-1 bg-muted/50 p-1 rounded-lg">
                                <button
                                    onClick={() => setTheme("light")}
                                    className={cn(
                                        "flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                                        theme === "light" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Sun className="w-3.5 h-3.5" />
                                    Light
                                </button>
                                <button
                                    onClick={() => setTheme("dark")}
                                    className={cn(
                                        "flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                                        theme === "dark" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Moon className="w-3.5 h-3.5" />
                                    Dark
                                </button>
                                <button
                                    onClick={() => setTheme("system")}
                                    className={cn(
                                        "flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                                        theme === "system" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Monitor className="w-3.5 h-3.5" />
                                    System
                                </button>
                            </div>
                        </div>

                        {/* Density Section */}
                        <div className="px-2 py-2">
                            <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wider">Density</label>
                            <div className="grid grid-cols-2 gap-1 bg-muted/50 p-1 rounded-lg">
                                <button
                                    onClick={() => setDensity("comfortable")}
                                    className={cn(
                                        "flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                                        density === "comfortable" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    Comfortable
                                </button>
                                <button
                                    onClick={() => setDensity("compact")}
                                    className={cn(
                                        "flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all",
                                        density === "compact" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <LayoutList className="w-3.5 h-3.5" />
                                    Compact
                                </button>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="px-2 py-2 space-y-1">
                            <label className="text-xs font-medium text-muted-foreground mb-1 block uppercase tracking-wider">Preferences</label>

                            <button
                                onClick={() => setNotifications(!notifications)}
                                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-1.5 rounded-md transition-colors", notifications ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground")}>
                                        <Bell className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">Notifications</span>
                                </div>
                                <div className={cn(
                                    "w-8 h-4 rounded-full transition-colors relative",
                                    notifications ? "bg-primary" : "bg-muted-foreground/30"
                                )}>
                                    <div className={cn(
                                        "absolute top-0.5 left-0.5 w-3 h-3 bg-background rounded-full shadow-sm transition-transform",
                                        notifications ? "translate-x-4" : "translate-x-0"
                                    )} />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
