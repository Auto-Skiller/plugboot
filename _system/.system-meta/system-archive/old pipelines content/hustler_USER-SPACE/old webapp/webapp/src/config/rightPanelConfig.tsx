"use client";

import { ReactNode } from "react";

// Types
export interface QuickStat {
    id: string;
    label: string;
    value: string;
    change?: number;
    icon: ReactNode;
}

export interface QuickAction {
    id: string;
    label: string;
    icon: ReactNode;
    href?: string;
    onClick?: () => void;
    description?: string;
}

export interface CategoryConfig {
    id: string;
    name: string;
    routes: string[];
    stats: QuickStat[];
    actions: QuickAction[];
    activityTypes: string[];
}

// Page-Specific Quick Actions - EMPTY
export const PAGE_QUICK_ACTIONS: Record<string, QuickAction[]> = {};

// Helper to get page-specific actions
export function getPageQuickActions(pathname: string): QuickAction[] {
    // Try exact match first
    if (PAGE_QUICK_ACTIONS[pathname]) {
        return PAGE_QUICK_ACTIONS[pathname];
    }

    // Try parent path match
    const parentPath = pathname.split('/').slice(0, -1).join('/');
    if (parentPath && PAGE_QUICK_ACTIONS[parentPath]) {
        return PAGE_QUICK_ACTIONS[parentPath];
    }

    return [];
}

// Category Configurations - EMPTY
export const CATEGORY_CONFIGS: CategoryConfig[] = [];

// Helper to get category from pathname
export function getCategoryFromPath(pathname: string): CategoryConfig | undefined {
    return CATEGORY_CONFIGS.find(cat =>
        cat.routes.some(route => pathname.startsWith(route))
    );
}

// Demo activity data - EMPTY
export interface ActivityItem {
    id: string;
    type: string;
    message: string;
    time: string;
}

export const DEMO_ACTIVITIES: ActivityItem[] = [];

