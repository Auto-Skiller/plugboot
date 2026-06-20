import { Megaphone, Search, ShoppingBag, TrendingUp, PieChart, Truck, Palette } from "lucide-react";

export interface Team {
    id: string;
    name: string;
    icon: any;
    color: string;
    badge?: number;
    // Algerian COD: Each team has access to exactly one page
    allowedPage: string;
    isActive: boolean;
    chatEnabled: boolean;
}

// 7 Teams for Algerian COD E-Commerce
// Each team has access to exactly one page
export const TEAMS: Team[] = [
    {
        id: "analytics",
        name: "Analytics Team",
        icon: PieChart,
        color: "text-blue-500",
        allowedPage: "/analytics",
        isActive: true,
        chatEnabled: true,
    },
    {
        id: "confirmation",
        name: "Confirmation Team",
        icon: ShoppingBag,
        color: "text-green-500",
        badge: 24,
        allowedPage: "/sales-dashboard",
        isActive: true,
        chatEnabled: true,
    },
    {
        id: "stock",
        name: "Stock Team",
        icon: Truck,
        color: "text-orange-500",
        allowedPage: "/stock",
        isActive: true,
        chatEnabled: true,
    },
    {
        id: "creative",
        name: "Creative Team",
        icon: Palette,
        color: "text-purple-500",
        allowedPage: "/creatives",
        isActive: true,
        chatEnabled: true,
    },
    {
        id: "mediaBuying",
        name: "Media Buying Team",
        icon: Megaphone,
        color: "text-pink-500",
        badge: 5,
        allowedPage: "/ads",
        isActive: true,
        chatEnabled: true,
    },
    {
        id: "marketing",
        name: "Marketing Team",
        icon: TrendingUp,
        color: "text-cyan-500",
        allowedPage: "/marketing",
        isActive: true,
        chatEnabled: true,
    },
    {
        id: "sourcing",
        name: "Sourcing Team",
        icon: Search,
        color: "text-yellow-500",
        allowedPage: "/product-research",
        isActive: true,
        chatEnabled: true,
    },
];

// Helper to get team by page
export function getTeamByPage(pathname: string): Team | null {
    return TEAMS.find(t => pathname.startsWith(t.allowedPage)) || null;
}

// Helper to get team by ID
export function getTeamById(teamId: string): Team | null {
    return TEAMS.find(t => t.id === teamId) || null;
}
