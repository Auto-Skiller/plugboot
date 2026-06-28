// Icons preserved for future use if modules are re-added
// import { Truck, Share2, Bot } from "lucide-react";

// ============================================================================
// ECOSYSTEM MODULE TYPES
// ============================================================================

export type ModuleStatus = 'connected' | 'partial' | 'disconnected' | 'attention';

export interface ModuleStatusInfo {
    status: ModuleStatus;
    progress?: { current: number; total: number };
    message?: string;
    lastUpdated?: string;
}

export interface EcosystemModule {
    id: string;
    name: string;
    shortName: string; // For collapsed/mobile view
    icon: React.ElementType;
    description: string;
    shortcut?: string;
    statusKey: string; // localStorage key for status
    defaultStatus: ModuleStatusInfo;
}

// ============================================================================
// MODULE CONFIGURATION
// ============================================================================

export const ECOSYSTEM_MODULES: EcosystemModule[] = [];

// ============================================================================
// STATUS UTILITIES
// ============================================================================

// Status color mapping for badges
export const STATUS_COLORS: Record<ModuleStatus, { bg: string; ring: string }> = {
    connected: { bg: "bg-green-500", ring: "ring-green-500/30" },
    partial: { bg: "bg-orange-500", ring: "ring-orange-500/30" },
    disconnected: { bg: "bg-zinc-500", ring: "ring-zinc-500/30" },
    attention: { bg: "bg-red-500", ring: "ring-red-500/30" }
};

// Status labels for display
export const STATUS_LABELS: Record<ModuleStatus, string> = {
    connected: "Connected",
    partial: "Partially configured",
    disconnected: "Not configured",
    attention: "Needs attention"
};

// Get module status from localStorage
export function getModuleStatus(moduleId: string): ModuleStatusInfo {
    if (typeof window === 'undefined') {
        const targetModule = ECOSYSTEM_MODULES.find(m => m.id === moduleId);
        return targetModule?.defaultStatus || { status: 'disconnected' };
    }

    try {
        const targetModule = ECOSYSTEM_MODULES.find(m => m.id === moduleId);
        if (!targetModule) return { status: 'disconnected' };

        const saved = localStorage.getItem(targetModule.statusKey);
        if (saved) {
            return JSON.parse(saved);
        }
        return targetModule.defaultStatus;
    } catch (e) {
        console.error('Failed to get module status:', e);
        return { status: 'disconnected' };
    }
}

// Set module status in localStorage
export function setModuleStatus(moduleId: string, status: ModuleStatusInfo): void {
    if (typeof window === 'undefined') return;

    const targetModule = ECOSYSTEM_MODULES.find(m => m.id === moduleId);
    if (!targetModule) return;

    try {
        localStorage.setItem(targetModule.statusKey, JSON.stringify({
            ...status,
            lastUpdated: new Date().toISOString()
        }));
    } catch (e) {
        console.error('Failed to set module status:', e);
    }
}

// Calculate overall ecosystem health
export function getEcosystemHealth(): { connected: number; total: number; percentage: number } {
    const statuses = ECOSYSTEM_MODULES.map(m => getModuleStatus(m.id));
    const connected = statuses.filter(s => s.status === 'connected').length;
    return {
        connected,
        total: ECOSYSTEM_MODULES.length,
        percentage: Math.round((connected / ECOSYSTEM_MODULES.length) * 100)
    };
}

// ============================================================================
// BAR COLLAPSE STATE
// ============================================================================

const BAR_COLLAPSED_KEY = 'ecosystem-bar-collapsed';

export function getBarCollapsedState(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(BAR_COLLAPSED_KEY) === 'true';
}

export function setBarCollapsedState(collapsed: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(BAR_COLLAPSED_KEY, String(collapsed));
}
