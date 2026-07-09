"use client";

import Link from "next/link";
import { QuickAction } from "@/config/rightPanelConfig";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
    actions: QuickAction[];
    className?: string;
}

export function QuickActions({ actions, className }: QuickActionsProps) {
    return (
        <div className={cn("space-y-2", className)}>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
                {actions.map((action) => {
                    const content = (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.03] transition-all duration-200 cursor-pointer group">
                            <span className="text-green-500 group-hover:text-green-400 transition-colors">
                                {action.icon}
                            </span>
                            <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground truncate">
                                {action.label}
                            </span>
                        </div>
                    );

                    if (action.href) {
                        return (
                            <Link key={action.id} href={action.href}>
                                {content}
                            </Link>
                        );
                    }

                    return (
                        <button
                            key={action.id}
                            onClick={action.onClick}
                            className="w-full text-left"
                        >
                            {content}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
