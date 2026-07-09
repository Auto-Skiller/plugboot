/**
 * Zone-Based Navigation Configuration
 * Anti-Gravity Restructured Navigation for Algerian COD E-commerce
 * 
 * ============================================================================
 * THE SKYSCRAPER MODEL - 3-Zone Architecture
 * ============================================================================
 * 
 * 🔴 Operations (Zone 1): Foundation - Daily workflow that keeps the business running
 * 🟢 Growth (Zone 2): Engine - Traffic, content, and revenue acceleration
 * 🟣 Command (Zone 3): Penthouse - Finance, sourcing, and strategic intelligence
 * 
 * ============================================================================
 * ROUTE MAPPING NOTE:
 * Paths are currently mapped to legacy routes for stability.
 * The `route` values maintain backward compatibility with existing URLs.
 * Future migration will update routes without breaking navigation.
 * ============================================================================
 */

import {
    // Operations Zone Icons
    Phone, Warehouse, Truck, Package,
    // Growth Zone Icons
    Palette, Target, Megaphone, TrendingUp,
    // Command Zone Icons
    Crown, Banknote, Search, Settings,
    // Utility Icons
    HelpCircle, ToggleRight,
    type LucideIcon
} from "lucide-react";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ZoneTab {
    id: string;
    label: string;
    labelAr: string;
    priority?: "HIGH" | "NORMAL";
}

export interface ZonePage {
    id: string;
    label: string;
    labelAr: string;
    icon: LucideIcon;
    route: string;
    isDefault?: boolean;
    isOwnerDefault?: boolean;
    badge?: { type: "alert" | "count"; source?: string };
    tabs?: ZoneTab[];
}

export interface Zone {
    id: string;
    label: string;
    labelAr: string;
    icon: LucideIcon;
    color: string;
    colorClass: string;
    pages: ZonePage[];
}

export interface GlobalSetting {
    id: string;
    label: string;
    labelAr: string;
    icon: LucideIcon;
    location: "header" | "footer";
    tooltip?: string;
}

export interface ZoneNavigation {
    zones: Zone[];
    globalSettings: GlobalSetting[];
}

// ============================================================================
// ZONE COLORS
// ============================================================================

export const ZONE_COLORS = {
    operations: {
        primary: "#EF4444",
        bg: "bg-red-500/10",
        text: "text-red-500",
        border: "border-red-200 dark:border-red-800",
        gradient: "from-red-500/20 to-orange-500/10"
    },
    growth: {
        primary: "#22C55E",
        bg: "bg-green-500/10",
        text: "text-green-500",
        border: "border-green-200 dark:border-green-800",
        gradient: "from-green-500/20 to-emerald-500/10"
    },
    command: {
        primary: "#8B5CF6",
        bg: "bg-purple-500/10",
        text: "text-purple-500",
        border: "border-purple-200 dark:border-purple-800",
        gradient: "from-purple-500/20 to-indigo-500/10"
    }
} as const;

// ============================================================================
// SKYSCRAPER MODEL - ZONE NAVIGATION CONFIGURATION
// ============================================================================
// Source: docs/MAIN PAGES/Side_bar_navigation/
// - 01_Operations_Zone.md
// - 02_Growth_Zone.md  
// - 03_Command_Zone.md
// ============================================================================

export const ZONE_NAVIGATION: ZoneNavigation = {
    zones: [
        // =====================================================================
        // 🔴 OPERATIONS ZONE - The Foundation
        // "If it happens every day and requires immediate action, it belongs here."
        // Owners: Operations Manager, Call Center Leads, Logistics Team
        // =====================================================================
        {
            id: "operations",
            label: "Operations",
            labelAr: "العمليات",
            icon: Phone,
            color: ZONE_COLORS.operations.primary,
            colorClass: ZONE_COLORS.operations.text,
            pages: [
                // Hub 1: Centre de Confirmation
                // Route: /operations/confirmation
                {
                    id: "confirmation-center",
                    label: "Centre de Confirmation",
                    labelAr: "مركز التأكيد",
                    icon: Phone,
                    route: "/operations/confirmation",
                    isDefault: true,
                    badge: { type: "count", source: "pendingConfirmations" },
                    tabs: [
                        { id: "traitement-commandes", label: "Traitement Commandes", labelAr: "معالجة الطلبات" },
                        { id: "risque-clients", label: "Risque & Clients", labelAr: "المخاطر والعملاء", priority: "HIGH" },
                        { id: "performance-sources", label: "Performance Sources", labelAr: "أداء المصادر" },
                        { id: "comms-automatisations", label: "Comms & Automatisations", labelAr: "الاتصالات والأتمتة" }
                    ]
                },
                // Hub 2: Entrepôt (Warehouse)
                // Route: /operations/warehouse
                {
                    id: "warehouse",
                    label: "Entrepôt",
                    labelAr: "المستودع",
                    icon: Warehouse,
                    route: "/operations/warehouse",
                    badge: { type: "alert", source: "returnsCount" },
                    tabs: [
                        { id: "etat-stock", label: "État du Stock", labelAr: "حالة المخزون" },
                        { id: "alertes-mouvements", label: "Alertes & Mouvements", labelAr: "التنبيهات والحركات", priority: "HIGH" },
                        { id: "sites-retours", label: "Sites & Retours", labelAr: "المواقع والمرتجعات", priority: "HIGH" },
                        { id: "fournisseurs-import", label: "Fournisseurs & Import", labelAr: "الموردين والاستيراد" }
                    ]
                },
                // Hub 3: Logistique & Retour
                // Route: /operations/logistics-recovery
                {
                    id: "logistics-recovery",
                    label: "Logistique & Retour",
                    labelAr: "اللوجيستيك والروتور",
                    icon: Truck,
                    route: "/operations/logistics-recovery",
                    tabs: [
                        { id: "expeditions", label: "Expéditions", labelAr: "الشحنات" },
                        { id: "retours-rotour", label: "Retours (Rotour)", labelAr: "إدارة المرتجعات" }
                    ]
                }
            ]
        },

        // =====================================================================
        // 🟢 GROWTH ZONE - The Engine
        // "If it creates content, manages ads, or drives acquisition, it belongs here."
        // Owners: Marketing Manager, Media Buyers, Content Creators, Influencer Managers
        // =====================================================================
        {
            id: "growth",
            label: "Growth",
            labelAr: "النمو",
            icon: TrendingUp,
            color: ZONE_COLORS.growth.primary,
            colorClass: ZONE_COLORS.growth.text,
            pages: [
                // Hub 1: Studio Créatif
                // Route: /growth/creative-studio
                {
                    id: "creative-studio",
                    label: "Studio Créatif",
                    labelAr: "ستوديو الإبداع",
                    icon: Palette,
                    route: "/growth/creative-studio", // Updated to match folder structure
                    tabs: [
                        { id: "creation-ia", label: "Création & IA", labelAr: "الإنشاء والذكاء الاصطناعي" },
                        { id: "modeles-flux", label: "Modèles & Flux", labelAr: "النماذج والتدفق" },
                        { id: "marque-conformite", label: "Marque & Conformité", labelAr: "العلامة والامتثال" },
                        { id: "outils-tiktok", label: "Outils & TikTok", labelAr: "الأدوات وتيك توك" }
                    ]
                },
                // Hub 2: Gestionnaire Pubs
                // Route: /growth/ads-manager
                {
                    id: "ads-manager",
                    label: "Gestionnaire Pubs",
                    labelAr: "مدير الإعلانات",
                    icon: Target,
                    route: "/growth/ads-manager", // Updated to match folder structure
                    tabs: [
                        { id: "campagnes-roas", label: "Campagnes & ROAS", labelAr: "الحملات والعائد" },
                        { id: "budget-regles", label: "Budget & Règles", labelAr: "الميزانية والقواعد" },
                        { id: "trafic-tunnel", label: "Trafic & Tunnel", labelAr: "الزيارات والقمع" },
                        { id: "compte-rapports", label: "Compte & Rapports", labelAr: "الحساب والتقارير" }
                    ]
                },
                // Hub 3: Marketing & Growth
                // Route: /growth/marketing
                {
                    id: "marketing-hub",
                    label: "Marketing & Growth",
                    labelAr: "التسويق والنمو",
                    icon: Megaphone,
                    route: "/growth", // Per navigation_docs: /growth is the route for Marketing & Growth
                    tabs: [
                        { id: "influenceurs-ugc", label: "Influenceurs & UGC", labelAr: "المؤثرين والمحتوى" },
                        { id: "affiliation", label: "Affiliation", labelAr: "التسويق بالعمولة" },
                        { id: "plateformes-social", label: "Plateformes & Social", labelAr: "المنصات والتواصل" },
                        { id: "analyses-config", label: "Analyses & Config", labelAr: "التحليلات والإعدادات" }
                    ]
                }
            ]
        },

        // =====================================================================
        // 🟣 COMMAND ZONE - The Penthouse
        // "If it involves money, strategic sourcing, or CEO-level decisions, it belongs here."
        // Owners: CEO, CFO, Business Owner, Strategic Planners
        // =====================================================================
        {
            id: "command",
            label: "Command",
            labelAr: "القيادة",
            icon: Crown,
            color: ZONE_COLORS.command.primary,
            colorClass: ZONE_COLORS.command.text,
            pages: [
                // Hub 1: Tableau de Bord (Finance & Insights)
                // Route: /command/finance
                {
                    id: "finance-dashboard",
                    label: "Tableau de Bord",
                    labelAr: "لوحة التحكم",
                    icon: Banknote,
                    route: "/command/finance", // Legacy route preserved
                    isOwnerDefault: true,
                    tabs: [
                        { id: "vue-ensemble", label: "Vue d'Ensemble", labelAr: "نظرة عامة" },
                        { id: "livraison-wilayas", label: "Livraison & Wilayas", labelAr: "التوصيل والولايات" },
                        { id: "finance-rentabilite", label: "Finance & Rentabilité", labelAr: "المالية والربحية" },
                        { id: "rapports-outils", label: "Rapports & Outils", labelAr: "التقارير والأدوات" }
                    ]
                },
                // Hub 2: Découverte Produits (Sourcing)
                // Route: /command/sourcing
                {
                    id: "product-sourcing",
                    label: "Découverte Produits",
                    labelAr: "اكتشاف المنتجات",
                    icon: Search,
                    route: "/command/sourcing", // Legacy route preserved
                    tabs: [
                        { id: "recherche-tendances", label: "Recherche & Tendances", labelAr: "البحث والاتجاهات" },
                        { id: "marche-algerien", label: "Marché Algérien", labelAr: "السوق الجزائري" },
                        { id: "fournisseurs-couts", label: "Fournisseurs & Coûts", labelAr: "الموردين والتكاليف" },
                        { id: "social-validation", label: "Social & Validation", labelAr: "التحقق الاجتماعي" }
                    ]
                }
            ]
        }
    ],

    // =========================================================================
    // GLOBAL SETTINGS - Header/Footer Controls
    // =========================================================================
    globalSettings: [
        {
            id: "data-mode-toggle",
            label: "Data Mode (Square Rate)",
            labelAr: "نمط البيانات",
            icon: ToggleRight,
            location: "header",
            tooltip: "Toggle between official rate and Square rate (سعر السكوار)"
        },
        {
            id: "settings",
            label: "Settings",
            labelAr: "الإعدادات",
            icon: Settings,
            location: "footer"
        },
        {
            id: "help",
            label: "Help",
            labelAr: "المساعدة",
            icon: HelpCircle,
            location: "footer"
        }
    ]
};

// ============================================================================
// BADGE COUNTS (Mock - would come from API in production)
// ============================================================================

export const ZONE_BADGES: Record<string, number> = {
    "operations.confirmation-center": 24,
    "operations.warehouse": 12,
    "operations.warehouse.returns": 8,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get zone by ID
 */
export const getZoneById = (zoneId: string): Zone | undefined => {
    return ZONE_NAVIGATION.zones.find(z => z.id === zoneId);
};

/**
 * Get page by route - supports active state detection
 * Matches route prefixes to allow for nested routes
 */
export const getPageByRoute = (route: string): { zone: Zone; page: ZonePage } | undefined => {
    for (const zone of ZONE_NAVIGATION.zones) {
        const page = zone.pages.find(p => route.startsWith(p.route));
        if (page) return { zone, page };
    }
    return undefined;
};

/**
 * Get active zone based on current route
 * Returns the zone that contains the matching page
 */
export const getActiveZone = (currentRoute: string): Zone | undefined => {
    const result = getPageByRoute(currentRoute);
    return result?.zone;
};

/**
 * Get all pages across all zones (flat list)
 */
export const getAllPages = (): ZonePage[] => {
    return ZONE_NAVIGATION.zones.flatMap(zone => zone.pages);
};

/**
 * Get default page for a zone
 */
export const getDefaultPageForZone = (zoneId: string): ZonePage | undefined => {
    const zone = getZoneById(zoneId);
    if (!zone) return undefined;
    return zone.pages.find(p => p.isDefault) || zone.pages[0];
};

/**
 * Get page tabs by page ID
 */
export const getPageTabs = (pageId: string): ZoneTab[] => {
    const allPages = getAllPages();
    const page = allPages.find(p => p.id === pageId);
    return page?.tabs || [];
};

// ============================================================================
// ALGERIAN MARKET LABEL OVERRIDES
// ============================================================================

export const ALGERIAN_LABELS: Record<string, string> = {
    "Cart": "Couffa",
    "Basket": "Couffa",
    "Revenue": "Cash Collection",
    "Sales": "Pending COD",
    "Returns": "Rotour",
    "Checkout": "Confirm Order",
    "Order": "Couffa",
    "Warehouse": "Entrepôt",
    "Dashboard": "Tableau de Bord",
    "Product Discovery": "Découverte Produits",
    "Creative Studio": "Studio Créatif",
    "Ads Manager": "Gestionnaire Pubs"
};
