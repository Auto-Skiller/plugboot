"use client";

import { Plus, Download, Upload, Filter, BarChart3, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "primary" | "success";
}

const actions: QuickAction[] = [
    {
        id: "create-order",
        label: "Create Order",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => { },
        variant: "primary"
    },
    {
        id: "import",
        label: "Bulk Import",
        icon: <Upload className="h-4 w-4" />,
        onClick: () => { },
    },
    {
        id: "export",
        label: "Export CSV",
        icon: <Download className="h-4 w-4" />,
        onClick: () => { },
    },
    {
        id: "view-stats",
        label: "View Stats",
        icon: <BarChart3 className="h-4 w-4" />,
        onClick: () => { },
    }
];

export function OperationsQuickActions() {
    return (
        <div className="space-y-3">
            <div className="px-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Quick Actions
                </h3>
                <div className="space-y-1.5">
                    {actions.map((action) => (
                        <button
                            key={action.id}
                            onClick={action.onClick}
                            className={cn(
                                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                                action.variant === "primary" && "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
                                action.variant === "success" && "bg-green-600 text-white hover:bg-green-700 shadow-sm",
                                !action.variant && "bg-muted/50 text-foreground hover:bg-muted hover:shadow-sm"
                            )}
                        >
                            <span className={cn(
                                "shrink-0",
                                action.variant ? "text-white" : "text-muted-foreground"
                            )}>
                                {action.icon}
                            </span>
                            <span className="truncate">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="px-2 pt-3 border-t border-border">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Today&apos;s Overview
                </h3>
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-2 py-1.5">
                        <span className="text-xs text-muted-foreground">Pending</span>
                        <span className="text-sm font-semibold text-orange-500">24</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1.5">
                        <span className="text-xs text-muted-foreground">Confirmed</span>
                        <span className="text-sm font-semibold text-green-500">156</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1.5">
                        <span className="text-xs text-muted-foreground">In Delivery</span>
                        <span className="text-sm font-semibold text-blue-500">89</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
