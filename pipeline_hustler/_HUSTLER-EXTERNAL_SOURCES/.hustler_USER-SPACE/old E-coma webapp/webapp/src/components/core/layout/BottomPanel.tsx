"use client";

import { useState, useEffect, useRef } from "react";
import { X, Maximize2, Minimize2, Truck, Share2, Bot, Key, Settings, Save, Rocket, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingChecklistInline } from "@/components/core/ui/onboarding-checklist";
import { useWindowLayout } from "./WindowLayoutContext";
import { useScroll } from "./ScrollContext";
import { ECOSYSTEM_MODULES } from "@/config/ecosystem-config";
import { AIAgentsPanel } from "./AIAgentsPanel";
import { SessionModuleContent } from "./SessionControlPanel";


interface BottomPanelProps {
    isOpen: boolean;
    onClose: () => void;
    activeModule: string | null;
}

// Construct content map from config + defaults
const MODULE_CONTENT: Record<string, { title: string; icon: any; tabs: string[] }> = {};

// 1. Add ecosystem modules
ECOSYSTEM_MODULES.forEach((m) => {
    MODULE_CONTENT[m.id] = {
        title: m.name,
        icon: m.icon,
        tabs: ["General", "Configuration", "Logs"]
    };
});

// 2. Add special modules
MODULE_CONTENT["onboarding"] = {
    title: "Onboarding Checklist",
    icon: Rocket,
    tabs: ["Steps"]
};

// 3. Override AI Agents with specific tabs
MODULE_CONTENT["ai-agents"] = {
    title: "AI Agents",
    icon: Bot,
    tabs: ["Accounts", "Configuration", "Logs"]
};

// 4. Session Module
MODULE_CONTENT["session"] = {
    title: "Session Control",
    icon: Target, // Imported from lucide-react? Need to check imports
    tabs: ["Overview"]
};

export function BottomPanel({ isOpen, onClose, activeModule }: BottomPanelProps) {
    // Layout State
    const [isMaximized, setIsMaximized] = useState(false);
    const [height, setHeight] = useState(320); // Default height
    const [isResizing, setIsResizing] = useState(false);

    // Refs for resizing
    const activeTabState = useState(0);
    const [activeTab, setActiveTab] = activeTabState;
    const { bottomPanelStyle, setBottomPanelOpen } = useWindowLayout();
    const { isScrolled } = useScroll();
    const isResizingRef = useRef(false);
    const lastHeightRef = useRef(320);

    // Sync visibility
    useEffect(() => {
        setBottomPanelOpen(isOpen);
        return () => setBottomPanelOpen(false);
    }, [isOpen, setBottomPanelOpen]);

    // Resizing Logic
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizingRef.current) return;

            // Calculate new height: Window Height - Mouse Y - Bottom Offset (48px for footer)
            const newHeight = window.innerHeight - e.clientY - 48;

            // Constraints
            const minHeight = 200;
            const maxHeight = window.innerHeight - 80; // Leave space for top bar

            const clampedHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
            setHeight(clampedHeight);
        };

        const handleMouseUp = () => {
            isResizingRef.current = false;
            setIsResizing(false);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto'; // Re-enable selection
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const startResizing = (e: React.MouseEvent) => {
        e.preventDefault();
        isResizingRef.current = true;
        setIsResizing(true);
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    };

    const toggleMaximize = () => {
        if (isMaximized) {
            // Restore
            setHeight(lastHeightRef.current);
            setIsMaximized(false);
        } else {
            // Maximize
            lastHeightRef.current = height;
            setHeight(window.innerHeight - 100); // Almost full screen
            setIsMaximized(true);
        }
    };

    if (!isOpen || !activeModule) return null;

    const activeModuleConfig = MODULE_CONTENT[activeModule];
    if (!activeModuleConfig) return null;

    return (
        <div
            className={cn(
                "fixed left-0 bottom-12 z-40 bg-card/98 backdrop-blur-xl border-t border-border shadow-2xl flex flex-col",
                // Remove fixed height classes, use inline style instead
            )}
            style={{
                right: bottomPanelStyle.right,
                height: `${height}px`,
                // Disable transition during resize for performance
                transition: isResizing ? "none" : "right 300ms ease-in-out, height 300ms cubic-bezier(0.4, 0, 0.2, 1)"
            }}
        >
            {/* Drag Handle */}
            <div
                onMouseDown={startResizing}
                className="absolute top-0 left-0 right-0 h-1.5 cursor-row-resize hover:bg-primary/20 transition-colors z-50 transform -translate-y-1/2 w-full"
            />

            {/* Header */}
            <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-muted/30 shrink-0 select-none">
                <div className="flex items-center gap-3">
                    <activeModuleConfig.icon className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-foreground">{activeModuleConfig.title}</span>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 mx-4">
                    {activeModuleConfig.tabs.map((tab, index) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(index)}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                                activeTab === index
                                    ? "bg-primary/15 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={toggleMaximize}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title={isMaximized ? "Restore" : "Maximize"}
                    >
                        {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Custom Content for Onboarding */}
                    {activeModule === "onboarding" ? (
                        <OnboardingChecklistInline />
                    ) : activeModule === "ai-agents" ? (
                        <AIAgentsPanel activeTab={activeTab} />
                    ) : activeModule === "session" ? (
                        <SessionModuleContent />
                    ) : (
                        /* Placeholder Content for other modules */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl border border-border bg-muted/30">
                                <div className="flex items-center gap-3 mb-4">
                                    <Settings className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-foreground">{activeModuleConfig.tabs[activeTab]} Settings</h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Configure your {activeModuleConfig.tabs[activeTab].toLowerCase()} settings here.
                                    This panel will contain the actual configuration options.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                                        <span className="text-sm">Enable auto-sync</span>
                                        <div className="w-10 h-5 rounded-full bg-primary relative">
                                            <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                                        <span className="text-sm">Notifications</span>
                                        <div className="w-10 h-5 rounded-full bg-muted relative">
                                            <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border border-border bg-muted/30">
                                <div className="flex items-center gap-3 mb-4">
                                    <activeModuleConfig.icon className="h-5 w-5 text-secondary" />
                                    <h3 className="font-semibold text-foreground">Quick Actions</h3>
                                </div>
                                <div className="space-y-2">
                                    <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors text-left">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Save className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">Save Configuration</div>
                                            <div className="text-xs text-muted-foreground">Save current settings</div>
                                        </div>
                                    </button>
                                    <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors text-left">
                                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                                            <Settings className="h-4 w-4 text-secondary" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">Advanced Settings</div>
                                            <div className="text-xs text-muted-foreground">More options</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
