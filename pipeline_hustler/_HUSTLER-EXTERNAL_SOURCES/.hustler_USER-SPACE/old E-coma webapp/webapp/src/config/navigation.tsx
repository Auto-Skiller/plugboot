import {
    Palette,
    LayoutDashboard, Settings, ShoppingBag, Users, BarChart, Search, Zap, Share2,
    MessageSquare, Package, Calendar, MapPin, Bot, Store, DollarSign,
    HelpCircle, Sparkles, Bell, Eye, Target as TargetIcon,
    TrendingUp, Target, FileText, AlertTriangle,
    ShoppingCart, Truck, Box, Megaphone, PieChart, UserCog, CreditCard
} from "lucide-react";

// Types
export interface NavItem { name: string; href: string; icon: React.ElementType; badge?: number; }
export interface NavGroup { title: string; icon: React.ElementType; items: NavItem[]; color?: string; }

export const BADGES: Record<string, number> = {
    "/sales-dashboard": 24,
    "/social/posts-studio": 5,
};

export const NAV_GROUPS: NavGroup[] = [
    {
        title: "Analytics", icon: PieChart, color: "blue", items: []
    },
    {
        title: "E-Commerce", icon: ShoppingCart, color: "green", items: [
            { name: "Sales Center", href: "/sales-dashboard", icon: BarChart, badge: BADGES["/sales-dashboard"] },
            { name: "Gestion de Stock", href: "/stock", icon: Truck },
        ]
    },
];

export const NAV_PAGES: NavItem[] = [];

// Category color mapping for visual hierarchy
export const CATEGORY_COLORS: Record<string, string> = {
    "Analytics": "text-blue-400",
    "E-Commerce": "text-green-400",
    "Social Media": "text-purple-400",
    "Marketing & ADs": "text-pink-400",
    "Admin": "text-slate-400"
};

// Category glow colors for hover effects
export const CATEGORY_GLOW_COLORS: Record<string, string> = {
    "Analytics": "glow-hover-blue",
    "E-Commerce": "glow-hover-green",
    "Social Media": "glow-hover-purple",
    "Marketing & ADs": "glow-hover-pink",
    "Admin": "glow-hover-slate"
};

// Badge urgency threshold - badges above this count will pulse
export const BADGE_URGENCY_THRESHOLD = 10;

