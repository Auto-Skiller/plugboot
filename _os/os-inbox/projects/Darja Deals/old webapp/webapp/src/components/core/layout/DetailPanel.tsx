"use client";

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/core/ui/button";
import { cn } from "@/lib/utils";
import { X, ChevronDown } from "lucide-react";

export interface DetailPanelTab {
    id: string;
    label: string;
    icon?: ReactNode;
    badge?: string | number;
    content: ReactNode;
}

export interface DetailPanelProps {
    tabs: DetailPanelTab[];
    isOpen: boolean;
    onClose: () => void;
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    title?: string;
    subtitle?: string;
    className?: string;
}

/**
 * DetailPanel - A slide-up panel that attaches to EcosystemBar
 * Used for contextual details, quick actions, and tab-based content
 * Replaces the old RightPanel pattern with a bottom-anchored design
 */
export function DetailPanel({
    tabs = [],
    isOpen,
    onClose,
    activeTab: controlledActiveTab,
    onTabChange,
    title,
    subtitle,
    className,
}: DetailPanelProps) {
    const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || "");

    // Support both controlled and uncontrolled modes
    const activeTab = controlledActiveTab ?? internalActiveTab;
    const handleTabChange = (tabId: string) => {
        setInternalActiveTab(tabId);
        onTabChange?.(tabId);
    };

    const currentTab = tabs.find(t => t.id === activeTab);

    if (!tabs || tabs.length === 0) {
        return null;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className={cn(
                        "fixed left-0 right-0 z-[55] bg-card border-t border-border/50 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.6)]",
                        "bottom-12", // Positioned above EcosystemBar (h-12)
                        className
                    )}
                >
                    {/* Header with tabs */}
                    <div className="flex items-center border-b border-border/30 px-4 h-12">
                        {/* Title section */}
                        {(title || subtitle) && (
                            <div className="flex-shrink-0 mr-4 pr-4 border-r border-border/30">
                                {title && <h3 className="text-sm font-semibold">{title}</h3>}
                                {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                            </div>
                        )}

                        {/* Tab Navigation */}
                        <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-none">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap",
                                        activeTab === tab.id
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                >
                                    {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
                                    <span>{tab.label}</span>
                                    {tab.badge !== undefined && (
                                        <span className={cn(
                                            "ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full",
                                            activeTab === tab.id
                                                ? "bg-primary-foreground/20"
                                                : "bg-muted-foreground/20"
                                        )}>
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Close button */}
                        <div className="flex-shrink-0 ml-4 flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="h-8 w-8 p-0 rounded-full"
                            >
                                <ChevronDown className="h-4 w-4" />
                                <span className="sr-only">Close panel</span>
                            </Button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-4 max-h-[40vh] overflow-y-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                {currentTab?.content}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * useDetailPanel - Hook for managing DetailPanel state
 */
export function useDetailPanel(initialTab?: string) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(initialTab || "");

    const open = (tabId?: string) => {
        if (tabId) setActiveTab(tabId);
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
    };

    const toggle = (tabId?: string) => {
        if (isOpen && tabId === activeTab) {
            close();
        } else {
            open(tabId);
        }
    };

    return {
        isOpen,
        activeTab,
        setActiveTab,
        open,
        close,
        toggle,
    };
}
