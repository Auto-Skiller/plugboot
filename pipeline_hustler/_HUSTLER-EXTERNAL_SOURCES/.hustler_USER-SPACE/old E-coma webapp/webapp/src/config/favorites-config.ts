import {
    BarChart3, ShoppingCart, TrendingUp, Users, Package,
    Truck, DollarSign, Target, MapPin, Calendar, Zap,
    PenTool, Eye, MessageCircle, Wallet, PiggyBank
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface FavoriteWidget {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    category: "analytics" | "ecommerce" | "social" | "marketing";
    color: string;
    size: "small" | "medium" | "large";
}

// All available widgets that can be favorited
export const AVAILABLE_WIDGETS: FavoriteWidget[] = [
    // Analytics
    {
        id: "revenue-chart",
        name: "Revenue Chart",
        description: "Daily/weekly revenue trends",
        icon: DollarSign,
        category: "analytics",
        color: "text-green-500",
        size: "large",
    },
    {
        id: "orders-chart",
        name: "Orders Chart",
        description: "Order volume over time",
        icon: ShoppingCart,
        category: "analytics",
        color: "text-blue-500",
        size: "large",
    },
    {
        id: "traffic-stats",
        name: "Traffic Stats",
        description: "Website visitor analytics",
        icon: Eye,
        category: "analytics",
        color: "text-purple-500",
        size: "medium",
    },
    {
        id: "conversion-rate",
        name: "Conversion Rate",
        description: "Visitor to customer ratio",
        icon: Target,
        category: "analytics",
        color: "text-orange-500",
        size: "small",
    },

    // Business KPIs (from /analytics/business)
    {
        id: "total-revenue",
        name: "Total Revenue",
        description: "Total revenue across all orders",
        icon: DollarSign,
        category: "analytics",
        color: "text-green-500",
        size: "small",
    },
    {
        id: "net-profit",
        name: "Net Profit",
        description: "Net profit after costs",
        icon: PiggyBank,
        category: "analytics",
        color: "text-emerald-500",
        size: "small",
    },
    {
        id: "total-orders",
        name: "Total Orders",
        description: "Total number of orders",
        icon: ShoppingCart,
        category: "analytics",
        color: "text-blue-500",
        size: "small",
    },
    {
        id: "avg-order-value",
        name: "Avg. Order Value",
        description: "Average order value",
        icon: Wallet,
        category: "analytics",
        color: "text-cyan-500",
        size: "small",
    },

    // E-commerce
    {
        id: "pending-orders",
        name: "Pending Orders",
        description: "Orders awaiting confirmation",
        icon: Package,
        category: "ecommerce",
        color: "text-yellow-500",
        size: "small",
    },
    {
        id: "delivery-status",
        name: "Delivery Status",
        description: "Shipment tracking overview",
        icon: Truck,
        category: "ecommerce",
        color: "text-indigo-500",
        size: "medium",
    },
    {
        id: "low-stock",
        name: "Low Stock Alert",
        description: "Products running low",
        icon: Package,
        category: "ecommerce",
        color: "text-red-500",
        size: "small",
    },
    {
        id: "wilaya-heatmap",
        name: "Wilaya Heatmap",
        description: "Orders by region",
        icon: MapPin,
        category: "ecommerce",
        color: "text-teal-500",
        size: "large",
    },

    // Social
    {
        id: "scheduled-posts",
        name: "Scheduled Posts",
        description: "Upcoming social content",
        icon: Calendar,
        category: "social",
        color: "text-pink-500",
        size: "medium",
    },
    {
        id: "engagement-stats",
        name: "Engagement Stats",
        description: "Likes, @/app/ecommerce/_components/delivery/, shares",
        icon: MessageCircle,
        category: "social",
        color: "text-rose-500",
        size: "small",
    },

    // Marketing
    {
        id: "roas-monitor",
        name: "ROAS Monitor",
        description: "Ad spend performance",
        icon: TrendingUp,
        category: "marketing",
        color: "text-emerald-500",
        size: "medium",
    },
    {
        id: "campaign-performance",
        name: "Campaign Performance",
        description: "Active ad campaigns",
        icon: Zap,
        category: "marketing",
        color: "text-amber-500",
        size: "medium",
    },
];

// Storage key for favorites
const FAVORITES_STORAGE_KEY = "ecoma-favorite-widgets";

// Default favorites (shown on first visit)
export const DEFAULT_FAVORITES = ["revenue-chart", "pending-orders", "roas-monitor", "scheduled-posts"];

// Get favorited widget IDs from localStorage
export function getFavoriteWidgetIds(): string[] {
    if (typeof window === "undefined") return DEFAULT_FAVORITES;

    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return DEFAULT_FAVORITES;

    try {
        return JSON.parse(stored);
    } catch {
        return DEFAULT_FAVORITES;
    }
}

// Save favorite widget IDs to localStorage
export function saveFavoriteWidgetIds(ids: string[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
}

// Add a widget to favorites
export function addFavorite(widgetId: string): void {
    const favorites = getFavoriteWidgetIds();
    if (!favorites.includes(widgetId)) {
        saveFavoriteWidgetIds([...favorites, widgetId]);
    }
}

// Remove a widget from favorites
export function removeFavorite(widgetId: string): void {
    const favorites = getFavoriteWidgetIds();
    saveFavoriteWidgetIds(favorites.filter(id => id !== widgetId));
}

// Toggle a widget favorite status
export function toggleFavorite(widgetId: string): boolean {
    const favorites = getFavoriteWidgetIds();
    if (favorites.includes(widgetId)) {
        removeFavorite(widgetId);
        return false;
    } else {
        addFavorite(widgetId);
        return true;
    }
}

// Check if a widget is favorited
export function isFavorited(widgetId: string): boolean {
    return getFavoriteWidgetIds().includes(widgetId);
}

// Get full widget objects for favorited widgets
export function getFavoriteWidgets(): FavoriteWidget[] {
    const favoriteIds = getFavoriteWidgetIds();
    return AVAILABLE_WIDGETS.filter(w => favoriteIds.includes(w.id));
}

// ============================================================================
// PROFILE MANAGEMENT
// ============================================================================

const PROFILES_STORAGE_KEY = "ecoma-widget-profiles";

export interface WidgetProfile {
    id: string;
    name: string;
    widgetIds: string[];
    createdAt: number;
}

// Get all saved profiles
export function getSavedProfiles(): WidgetProfile[] {
    if (typeof window === "undefined") return [];

    try {
        const stored = localStorage.getItem(PROFILES_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

// Save a new profile with current widgets
export function saveProfile(name: string): WidgetProfile {
    const profiles = getSavedProfiles();
    const newProfile: WidgetProfile = {
        id: `profile-${Date.now()}`,
        name,
        widgetIds: getFavoriteWidgetIds(),
        createdAt: Date.now(),
    };

    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify([...profiles, newProfile]));
    return newProfile;
}

// Load a profile by ID
export function loadProfile(profileId: string): boolean {
    const profiles = getSavedProfiles();
    const profile = profiles.find(p => p.id === profileId);

    if (profile) {
        saveFavoriteWidgetIds(profile.widgetIds);
        return true;
    }
    return false;
}

// Delete a profile by ID
export function deleteProfile(profileId: string): void {
    const profiles = getSavedProfiles();
    const filtered = profiles.filter(p => p.id !== profileId);
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(filtered));
}

// Reset to default favorites
export function resetToDefault(): void {
    saveFavoriteWidgetIds(DEFAULT_FAVORITES);
}
