"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface TabItem {
    name: string;
    href: string;
    icon?: LucideIcon;
}

interface HubNavigationProps {
    title: string;
    description?: string;
    tabs: TabItem[];
}

export function HubNavigation({ title, description, tabs }: HubNavigationProps) {
    const pathname = usePathname();

    return (
        <div className="mb-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
                {description && <p className="text-slate-500 mt-1">{description}</p>}
            </div>

            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href;
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={cn(
                                    "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors",
                                    isActive
                                        ? "border-indigo-500 text-indigo-600"
                                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                )}
                            >
                                {tab.icon && <tab.icon className="h-4 w-4" />}
                                {tab.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
