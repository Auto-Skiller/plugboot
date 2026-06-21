import {
    LayoutDashboard, BarChart3, MapPin, ShoppingBag, Package, Search,
    Calendar, Share2, Sparkles, PenTool, Image, Users, Eye, Zap,
    DollarSign, TrendingUp, Target, Truck, Store, Bot, MessageSquare,
    CreditCard, Settings, Shield, HelpCircle, Star
} from "lucide-react";
import { LucideIcon } from "lucide-react";

// ============================================================================
// FEATURE FAVORITES CONFIGURATION
// All favoritable features from DG.md specification across all categories
// ============================================================================

export type FeatureCategory = "analytics" | "ecommerce" | "social" | "marketing" | "admin";

export interface FavoriteFeature {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    category: FeatureCategory;
    page: string;          // Page where this feature lives
    pageHref: string;      // Link to the page
    color: string;         // Category color
}

// All features that can be favorited (extracted from DG.md)
export const ALL_FEATURES: FavoriteFeature[] = [
    // ============================================================================
    // ANALYTICS CATEGORY
    // ============================================================================

    // Business Analytics
    { id: "business-performance", name: "Business Performance", description: "Overall business metrics", icon: BarChart3, category: "analytics", page: "Business Analytics", pageHref: "/analytics", color: "text-blue-400" },
    { id: "social-performance", name: "Social Performance", description: "Social media metrics overview", icon: Share2, category: "analytics", page: "Business Analytics", pageHref: "/analytics", color: "text-blue-400" },
    { id: "clients-lifecycle", name: "Clients Lifecycle", description: "Customer journey analytics", icon: Users, category: "analytics", page: "Business Analytics", pageHref: "/analytics", color: "text-blue-400" },
    { id: "traffic-lifecycle", name: "Traffic Lifecycle", description: "Traffic flow analysis", icon: TrendingUp, category: "analytics", page: "Business Analytics", pageHref: "/analytics", color: "text-blue-400" },
    { id: "revenue-chart", name: "Revenue Chart", description: "Revenue trends and projections", icon: DollarSign, category: "analytics", page: "Business Analytics", pageHref: "/analytics", color: "text-blue-400" },
    { id: "cost-adspend-chart", name: "Cost & Ad Spend", description: "Cost analysis and ad spend", icon: CreditCard, category: "analytics", page: "Business Analytics", pageHref: "/analytics", color: "text-blue-400" },
    { id: "profit-chart", name: "Profit & Net Profit", description: "Profit analysis charts", icon: BarChart3, category: "analytics", page: "Business Analytics", pageHref: "/analytics", color: "text-blue-400" },

    // Smart Heatmap
    { id: "smart-heatmap", name: "Smart Heatmap", description: "Data heatmap with filters", icon: MapPin, category: "analytics", page: "Smart Heatmap", pageHref: "/analytics/heatmap", color: "text-blue-400" },

    // ============================================================================
    // E-COMMERCE CATEGORY
    // ============================================================================

    // Orders & Delivery (Mapped to /sales-dashboard)
    { id: "orders-process", name: "Orders Process Table", description: "Active orders management", icon: ShoppingBag, category: "ecommerce", page: "Sales Center", pageHref: "/sales-dashboard", color: "text-green-400" },
    { id: "wilaya-performance", name: "Top Wilaya Performance", description: "Best performing regions", icon: MapPin, category: "ecommerce", page: "Sales Center", pageHref: "/sales-dashboard", color: "text-green-400" },
    { id: "orders-conversion", name: "Orders Conversion Chart", description: "Conversion rate analytics", icon: TrendingUp, category: "ecommerce", page: "Sales Center", pageHref: "/sales-dashboard", color: "text-green-400" },
    { id: "top-sources", name: "Top Sources Performance", description: "Best traffic sources", icon: Target, category: "ecommerce", page: "Sales Center", pageHref: "/sales-dashboard", color: "text-green-400" },

    // Inventory & Store (Mapped to /stock)
    { id: "inventory-gestion", name: "Inventory Gestion", description: "Inventory management & stock", icon: Package, category: "ecommerce", page: "Gestion de Stock", pageHref: "/stock", color: "text-green-400" },
    { id: "low-stock-alerts", name: "Low Stock Alerts", description: "Stock level notifications", icon: Package, category: "ecommerce", page: "Gestion de Stock", pageHref: "/stock", color: "text-green-400" },
    { id: "discounts-offers", name: "Discounts & Offers", description: "Promotions management", icon: DollarSign, category: "ecommerce", page: "Gestion de Stock", pageHref: "/stock", color: "text-green-400" },
    { id: "online-store", name: "Online Store Design", description: "Store & LP templates", icon: Store, category: "ecommerce", page: "Gestion de Stock", pageHref: "/stock", color: "text-green-400" },

    // Research Studio (Kept as /product-research if exists, otherwise /ecommerce/research)
    { id: "trending-winners", name: "Trending Winners", description: "Trending products discovery", icon: TrendingUp, category: "ecommerce", page: "Product Research", pageHref: "/product-research", color: "text-green-400" },
    { id: "product-search", name: "Product Search", description: "Search by name/photo/URL", icon: Search, category: "ecommerce", page: "Product Research", pageHref: "/product-research", color: "text-green-400" },
    { id: "search-reports", name: "Search Reports", description: "Pricing & competitor reports", icon: BarChart3, category: "ecommerce", page: "Product Research", pageHref: "/product-research", color: "text-green-400" },

    // ============================================================================
    // SOCIAL MEDIA CATEGORY (Mapped to /creatives)
    // ============================================================================

    // Posts Studio (Mapped to /creatives)
    { id: "posts-calendar", name: "Posts Calendar", description: "Content scheduling calendar", icon: Calendar, category: "social", page: "Studio Créatif", pageHref: "/creatives", color: "text-purple-400" },
    { id: "platforms-engagement", name: "Platforms Engagement", description: "Engagement by platform", icon: MessageSquare, category: "social", page: "Studio Créatif", pageHref: "/creatives", color: "text-purple-400" },
    { id: "comment-guard", name: "Comment Guard Rules", description: "Auto-moderation settings", icon: Shield, category: "social", page: "Studio Créatif", pageHref: "/creatives", color: "text-purple-400" },
    { id: "biolink", name: "Biolink", description: "Link in bio management", icon: Share2, category: "social", page: "Studio Créatif", pageHref: "/creatives", color: "text-purple-400" },

    // Creation Studio (Mapped to /creatives)
    { id: "content-insight", name: "Content Insight", description: "Content performance analysis", icon: Eye, category: "social", page: "Studio Créatif", pageHref: "/creatives", color: "text-purple-400" },
    { id: "ai-copywriter", name: "AI Copy Writer", description: "AI-powered copy generation", icon: Sparkles, category: "social", page: "Studio Créatif", pageHref: "/creatives", color: "text-purple-400" },
    { id: "publish-content", name: "Publish Content", description: "Multi-platform publishing", icon: Share2, category: "social", page: "Studio Créatif", pageHref: "/creatives", color: "text-purple-400" },
    { id: "create-content", name: "Create Content", description: "Content creation tools", icon: PenTool, category: "social", page: "Studio Créatif", pageHref: "/creatives", color: "text-purple-400" },
    { id: "media-studio", name: "Media Studio", description: "Media editing & management", icon: Image, category: "social", page: "Studio Créatif", pageHref: "/creatives", color: "text-purple-400" },

    // ============================================================================
    // MARKETING & ADS CATEGORY
    // ============================================================================

    // AD Accounts (Mapped to /ads or /marketing/ad-accounts if exists, likely /ads)
    { id: "ad-accounts-gestion", name: "AD Accounts Gestion", description: "Ad account management", icon: Users, category: "marketing", page: "Ads Center", pageHref: "/ads", color: "text-pink-400" },
    { id: "anti-ban-marketplace", name: "Anti-Ban Marketplace", description: "Rent & manage ad accounts", icon: Shield, category: "marketing", page: "Ads Center", pageHref: "/ads", color: "text-pink-400" },

    // Product Research (Ads features moved here)
    { id: "trending-ads", name: "Trending Ads", description: "Discover trending advertisements", icon: TrendingUp, category: "marketing", page: "Product Research", pageHref: "/product-research", color: "text-pink-400" },
    { id: "high-conversion-ads", name: "High Conversion Ads", description: "Best performing ads", icon: Target, category: "marketing", page: "Product Research", pageHref: "/product-research", color: "text-pink-400" },
    { id: "ads-tracker", name: "ADs Tracker", description: "Track competitor ads", icon: Eye, category: "marketing", page: "Product Research", pageHref: "/product-research", color: "text-pink-400" },

    // ADs Manager (Mapped to /ads)
    { id: "active-ads", name: "Active & Draft Ads", description: "Manage current ads", icon: Zap, category: "marketing", page: "Ads Center", pageHref: "/ads", color: "text-pink-400" },
    { id: "create-launch-ads", name: "Create & Launch Ads", description: "AI ad generation & launch", icon: Sparkles, category: "marketing", page: "Ads Center", pageHref: "/ads", color: "text-pink-400" },

    // Budget Manager (Mapped to /ads or /marketing/budget)
    { id: "budget-spend", name: "Budget & Spend", description: "Budget distribution & tracking", icon: DollarSign, category: "marketing", page: "Ads Center", pageHref: "/ads", color: "text-pink-400" },
    { id: "smart-stoploss", name: "Smart Stop-Loss", description: "Automated spend limits", icon: Shield, category: "marketing", page: "Ads Center", pageHref: "/ads", color: "text-pink-400" },

    // Traffic Tracking (Mapped to /ads/traffic or /marketing/traffic?)
    { id: "ads-traffic-analytics", name: "Ads-Traffic Analytics", description: "Traffic from ads analysis", icon: TrendingUp, category: "marketing", page: "Ads Center", pageHref: "/ads", color: "text-pink-400" },
    { id: "clients-analytics", name: "Clients Analytics", description: "Client demographics", icon: Users, category: "marketing", page: "Ads Center", pageHref: "/ads", color: "text-pink-400" },
    { id: "customer-behaviors", name: "Customer Behaviors", description: "Behavioral analytics", icon: Target, category: "marketing", page: "Ads Center", pageHref: "/ads", color: "text-pink-400" },

    // Engagement Targeting
    { id: "engagement-conversion", name: "Engagement & Conversion", description: "Engagement analytics", icon: Target, category: "marketing", page: "Marketing Center", pageHref: "/marketing", color: "text-pink-400" },
    { id: "ads-performance", name: "ADS Performance & Reports", description: "Ad performance reports", icon: BarChart3, category: "marketing", page: "Marketing Center", pageHref: "/marketing", color: "text-pink-400" },

    // Commission Marketing
    { id: "pay-to-sell", name: "Pay-To-Sell", description: "Commission-based marketing", icon: DollarSign, category: "marketing", page: "Marketing Center", pageHref: "/marketing", color: "text-pink-400" },
    { id: "commission-links", name: "Commission Links", description: "Affiliate link generation", icon: Share2, category: "marketing", page: "Marketing Center", pageHref: "/marketing", color: "text-pink-400" },
    { id: "influencers-collab", name: "Influencers Collab", description: "Influencer partnerships", icon: Users, category: "marketing", page: "Marketing Center", pageHref: "/marketing", color: "text-pink-400" },

    // ============================================================================
    // ECOSYSTEM BAR MODULES (as features)
    // ============================================================================
    { id: "dm-sales-agent", name: "DM Sales Agent", description: "AI sales automation", icon: Bot, category: "marketing", page: "AI Agents", pageHref: "/marketing", color: "text-pink-400" },
    { id: "dm-support-agent", name: "DM Support Agent", description: "AI support automation", icon: Bot, category: "marketing", page: "AI Agents", pageHref: "/marketing", color: "text-pink-400" },
    { id: "comment-response-agent", name: "Comment Response Agent", description: "Auto comment replies", icon: Bot, category: "marketing", page: "AI Agents", pageHref: "/marketing", color: "text-pink-400" },
];

// ============================================================================
// STORAGE & UTILITY FUNCTIONS
// ============================================================================

const FEATURE_FAVORITES_KEY = "ecoma-favorite-features";

export function getFavoriteFeatureIds(): string[] {
    if (typeof window === "undefined") return [];

    try {
        const stored = localStorage.getItem(FEATURE_FAVORITES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function saveFavoriteFeatureIds(ids: string[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(FEATURE_FAVORITES_KEY, JSON.stringify(ids));
}

export function toggleFeatureFavorite(featureId: string): boolean {
    const favorites = getFavoriteFeatureIds();
    const isFavorited = favorites.includes(featureId);

    if (isFavorited) {
        saveFavoriteFeatureIds(favorites.filter(id => id !== featureId));
        return false;
    } else {
        saveFavoriteFeatureIds([...favorites, featureId]);
        return true;
    }
}

export function isFeatureFavorited(featureId: string): boolean {
    return getFavoriteFeatureIds().includes(featureId);
}

export function getFavoriteFeatures(): FavoriteFeature[] {
    const favoriteIds = getFavoriteFeatureIds();
    return ALL_FEATURES.filter(f => favoriteIds.includes(f.id));
}

export function getFeaturesByCategory(category: FeatureCategory): FavoriteFeature[] {
    return ALL_FEATURES.filter(f => f.category === category);
}

export function getFeaturesByPage(pageHref: string): FavoriteFeature[] {
    return ALL_FEATURES.filter(f => f.pageHref === pageHref);
}
