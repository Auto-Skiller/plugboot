"use client";

import { Button } from "@/components/core/ui/button";
import {
    Activity,
    Phone,
    MessageSquare,
    Clock,
    CheckCircle,
    Mail,
    Users,
    UserCheck,
    Trophy,
    User,
    Radio,
    LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportCategory {
    icon: LucideIcon;
    label: string;
    value: string;
}

const REPORT_CATEGORIES: ReportCategory[] = [
    { icon: Activity, label: "Lifecycle", value: "lifecycle" },
    { icon: Phone, label: "Appels", value: "calls" },
    { icon: MessageSquare, label: "Conversations", value: "conversations" },
    { icon: Clock, label: "Réponses", value: "responses" },
    { icon: CheckCircle, label: "Résolutions", value: "resolutions" },
    { icon: Mail, label: "Messages", value: "messages" },
    { icon: Users, label: "Contacts", value: "contacts" },
    { icon: UserCheck, label: "Assignments", value: "assignments" },
    { icon: Trophy, label: "Leaderboard", value: "leaderboard" },
    { icon: User, label: "Utilisateurs", value: "users" },
    { icon: Radio, label: "Broadcasts", value: "broadcasts" },
];

interface ReportSidebarProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export function ReportSidebar({ activeCategory, onCategoryChange }: ReportSidebarProps) {
    return (
        <div className="w-56 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 min-h-full">
            <div className="p-4">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                    Rapports
                </h3>
                <nav className="space-y-1">
                    {REPORT_CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        const isActive = activeCategory === category.value;

                        return (
                            <Button
                                key={category.value}
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3 font-medium transition-all",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700"
                                )}
                                onClick={() => onCategoryChange(category.value)}
                            >
                                <Icon
                                    className={cn(
                                        "h-4 w-4",
                                        isActive ? "text-indigo-600 dark:text-indigo-400" : ""
                                    )}
                                />
                                {category.label}
                            </Button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
