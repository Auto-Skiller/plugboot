import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    Truck,
    Calculator,
    FileText,
    ShoppingCart,
    Shield,
    BarChart3,
    MessageSquare,
    Package,
    AlertTriangle,
    MapPin,
    Users,
    Palette,
    Video,
    FolderOpen,
    Sparkles,
    Megaphone,
    DollarSign,
    Target,
    TrendingUp,
    UserPlus,
    Share2,
    Globe,
    Search,
    Zap,
    Building,
    type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/core/ui/hover-card";

// Tab configuration interface with description
interface TabConfig {
    id: string;
    name: string;
    shortName: string;
    description: string;
    icon: LucideIcon;
}

// Tabs configuration per page - synced with actual page implementations
const PAGE_TABS: Record<string, TabConfig[]> = {
    // Tableau de Bord - Analytics Dashboard
    "/analytics": [
        { id: "vue-ensemble", name: "Vue d'Ensemble", shortName: "Vue d'Ensemble", description: "Performance Globale & KPIs", icon: LayoutDashboard },
        { id: "livraison-wilayas", name: "Livraison & Wilayas", shortName: "Livraison", description: "Transporteurs & Cartographie", icon: Truck },
        { id: "finance-rentabilite", name: "Finance & Rentabilité", shortName: "Finance", description: "Profits, Coûts & IFU", icon: Calculator },
        { id: "rapports-outils", name: "Rapports & Outils", shortName: "Rapports", description: "Exports & Intégrations", icon: FileText },
    ],
    // Centre de Confirmation - Sales Dashboard
    "/sales-dashboard": [
        { id: "traitement-commandes", name: "Traitement Commandes", shortName: "Commandes", description: "Validation, Appels & Suivi", icon: ShoppingCart },
        { id: "risque-clients", name: "Risque & Clients", shortName: "Risque", description: "Scoring, Blacklist & Historique", icon: Shield },
        { id: "performance-sources", name: "Performance Sources", shortName: "Sources", description: "Canaux, ROAS & Conversions", icon: BarChart3 },
        { id: "comms-automatisations", name: "Comms & Automatisations", shortName: "Comms", description: "SMS, WhatsApp & Bots", icon: MessageSquare },
    ],
    // Entrepôt - Stock Management
    "/stock": [
        { id: "etat-stock", name: "État du Stock", shortName: "Stock", description: "Inventaire & Vue Globale", icon: Package },
        { id: "alertes-mouvements", name: "Alertes & Mouvements", shortName: "Alertes", description: "Réapprovisionnement & Historique", icon: AlertTriangle },
        { id: "sites-retours", name: "Sites & Retours", shortName: "Sites", description: "Emplacements & Suivi Retours", icon: MapPin },
        { id: "fournisseurs-import", name: "Fournisseurs & Import", shortName: "Import", description: "Sourcing & Douane", icon: Users },
    ],
    // Studio Créatif - Creatives
    "/creatives": [
        { id: "creation-ia", name: "Création & IA", shortName: "Création", description: "AI Copywriter & Hooks", icon: Sparkles },
        { id: "modeles-flux", name: "Modèles & Flux", shortName: "Modèles", description: "Templates & Pipeline", icon: FolderOpen },
        { id: "marque-conformite", name: "Marque & Conformité", shortName: "Marque", description: "Brand Voice & Safety", icon: Palette },
        { id: "outils-tiktok", name: "Outils & TikTok", shortName: "Outils", description: "Monétisation & Qualité", icon: Video },
    ],
    // Gestionnaire Pubs - Ads Manager
    "/ads": [
        { id: "campagnes-roas", name: "Campagnes & ROAS", shortName: "Campagnes", description: "Gestion & Performance", icon: Megaphone },
        { id: "budget-regles", name: "Budget & Règles", shortName: "Budget", description: "Stop-Loss & Devises", icon: DollarSign },
        { id: "trafic-tunnel", name: "Trafic & Tunnel", shortName: "Trafic", description: "Analytics & Conversions", icon: Target },
        { id: "compte-rapports", name: "Compte & Rapports", shortName: "Compte", description: "Santé & Exports", icon: FileText },
    ],
    // Partenariats & Croissance - Marketing
    "/marketing": [
        { id: "influenceurs-ugc", name: "Influenceurs & UGC", shortName: "Influenceurs", description: "Marketplace & Tarifs", icon: UserPlus },
        { id: "affiliation", name: "Affiliation", shortName: "Affiliation", description: "Affiliés & Commissions", icon: Share2 },
        { id: "plateformes-social", name: "Plateformes & Social", shortName: "Plateformes", description: "Engagement & Bots", icon: Globe },
        { id: "analyses-config", name: "Analyses & Config", shortName: "Analyses", description: "KPIs & Paramètres", icon: BarChart3 },
    ],
    // Découverte Produits - Product Research
    "/product-research": [
        { id: "recherche-tendances", name: "Recherche & Tendances", shortName: "Tendances", description: "Découverte & Tracking", icon: TrendingUp },
        { id: "marche-algerien", name: "Marché Algérien", shortName: "Algérie", description: "Tendances Locales", icon: Search },
        { id: "fournisseurs-couts", name: "Fournisseurs & Coûts", shortName: "Fournisseurs", description: "Sourcing & Landed Cost", icon: Building },
        { id: "social-validation", name: "Social & Validation", shortName: "Social", description: "Concurrents & Signaux", icon: Zap },
    ],
};

interface PageTabsNavigationProps {
    onTabChange?: (tabId: string) => void;
    className?: string;
}

export function PageTabsNavigation({ onTabChange, className }: PageTabsNavigationProps) {
    const pathname = usePathname();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Get tabs for current page
    const currentTabs = PAGE_TABS[pathname] || [];

    // Get/set active tab from localStorage
    const storageKey = `page-tabs-${pathname}`;
    const [activeTab, setActiveTab] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(storageKey) || currentTabs[0]?.id || "";
        }
        return currentTabs[0]?.id || "";
    });

    // Update active tab when page changes
    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        setActiveTab(stored || currentTabs[0]?.id || "");
    }, [pathname, currentTabs, storageKey]);

    // Check scroll state
    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [currentTabs]);

    const scrollTabs = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 150;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
            setTimeout(checkScroll, 300);
        }
    };

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
        localStorage.setItem(storageKey, tabId);
        onTabChange?.(tabId);

        // Dispatch custom event for page components to listen to
        const event = new CustomEvent('page-tab-change', { detail: { tabId, pathname } });
        window.dispatchEvent(event);
    };

    // Don't render if no tabs for current page
    if (currentTabs.length === 0) {
        return null;
    }

    return (
        <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-xl",
            "border border-border/40 bg-background/60 backdrop-blur-md",
            "shadow-sm",
            className
        )}>
            {/* Scroll Left */}
            {canScrollLeft && (
                <button
                    onClick={() => scrollTabs('left')}
                    className="shrink-0 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
            )}

            {/* Tabs Container */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide"
            >
                {currentTabs.map((tab) => (
                    <HoverCard key={tab.id} openDelay={200} closeDelay={100}>
                        <HoverCardTrigger asChild>
                            <button
                                onClick={() => handleTabClick(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-200",
                                    activeTab === tab.id
                                        ? "bg-muted/80 text-foreground font-medium border border-border/50"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                                )}
                            >
                                <tab.icon className="h-4 w-4" />
                                <span className="hidden lg:inline">{tab.shortName}</span>
                            </button>
                        </HoverCardTrigger>
                        <HoverCardContent
                            side="top"
                            align="center"
                            sideOffset={8}
                            className="w-auto p-0 border-border/50 bg-card/95 backdrop-blur-lg shadow-xl"
                        >
                            <div className="flex flex-col items-center gap-1 px-4 py-3">
                                {/* Icon in circle */}
                                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/80 mb-1">
                                    <tab.icon className="h-4 w-4 text-foreground" />
                                </div>
                                {/* Tab name */}
                                <span className="font-semibold text-sm text-foreground">{tab.name}</span>
                                {/* Description */}
                                <span className="text-xs text-muted-foreground">{tab.description}</span>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                ))}
            </div>

            {/* Scroll Right */}
            {canScrollRight && (
                <button
                    onClick={() => scrollTabs('right')}
                    className="shrink-0 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

// Export tabs config for use by pages
export { PAGE_TABS };
export type { TabConfig };

