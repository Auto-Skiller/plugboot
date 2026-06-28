import {
    Phone, Truck, TrendingUp, Target, Crown, Banknote,
    UserCog
} from "lucide-react";

// ============================================================================
// HUB CATEGORY CONFIGURATION
// Aligned with navigation_docs zone structure
// ============================================================================

// Popularity levels for features (shown as flame emojis)
export type PopularityLevel = 0 | 1 | 2 | 3; // 0=none, 1=🔥, 2=🔥🔥, 3=🔥🔥🔥

export interface FeatureInfo {
    name: string;
    featureId?: string; // Links to feature-favorites-config
    popularity?: PopularityLevel; // 1-3 flames for hot features
}

export interface SubTabInfo {
    name: string;
    description?: string;
    features?: (string | FeatureInfo)[]; // Can be string or FeatureInfo
}

export interface ProblemSolutionInfo {
    problem: string;   // Market pain point
    solution: string;  // How DG solves it
}

export interface PageInfo {
    name: string;
    href: string;
    description?: string; // Page description
    image?: string;       // Page cover image
    problemSolution?: ProblemSolutionInfo; // Market problem and solution
    subTabs?: SubTabInfo[]; // List of sub-tabs with descriptions
    features?: (string | FeatureInfo)[]; // Key features for single page views
}

export interface HubCategory {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;        // Tailwind gradient class
    glowColor: string;    // Glow effect color
    textColor: string;    // Text color class
    pages: PageInfo[];
}

export const HUB_CATEGORIES: HubCategory[] = [
    // =========================================================================
    // OPERATIONS ZONE - Red (#EF4444)
    // Route Prefix: /operations/
    // The Foundation — Efficiency, Reliability, and the Machine That Never Sleeps
    // =========================================================================
    {
        id: "operations",
        title: "Operations Zone",
        description: "Order Processing, Stock Management & Logistics",
        icon: Phone, // Phone / Truck
        color: "from-red-500/20 to-red-600/10",
        glowColor: "rgba(239, 68, 68, 0.4)",
        textColor: "text-red-400",
        pages: [
            {
                name: "Centre de Confirmation",
                href: "/operations/confirmation",
                description: "Gestion complète des commandes, confirmation, risques et automatisations",
                image: "/assets/features/sales_wide.svg",
                problemSolution: {
                    problem: "40% return rate in COD e-commerce destroys profit margins",
                    solution: "AI risk scoring per Wilaya + Blacklist + Confirmation workflow"
                },
                subTabs: [
                    {
                        name: "Traitement Commandes",
                        description: "Gestion complète du flux de validation des commandes avec tableau Kanban, scripts d'appel et suivi des expéditions",
                        features: ["Orders Kanban", "Confirmation Workflow", "Call Scripts", "GPS Collection", "Shipment Tracker"]
                    },
                    {
                        name: "Risque & Clients",
                        description: "Évaluation des risques par commande, gestion de la blacklist clients et cartographie des wilayas à risque",
                        features: ["Risk Calculator IA", "Customer Blacklist", "High-Risk Alerts", "Wilaya Risk Map"]
                    },
                    {
                        name: "Performance Sources",
                        description: "Analyse des volumes de commandes, taux de retour par produit et attribution des sources de trafic",
                        features: ["Orders Volume Chart", "Return Rates by Product", "Traffic Sources", "Conversion Funnel", "Offline Sync"]
                    },
                    {
                        name: "Comms & Automatisations",
                        description: "Bots automatisés pour confirmation et collecte GPS via WhatsApp, modèles SMS et historique des communications",
                        features: ["Confirmation Bot WhatsApp", "GPS Bot", "SMS Templates", "Communication Log"]
                    }
                ],
                features: ["Orders Kanban", "Risk Calculator IA", "Customer Blacklist", "Confirmation Bot", "GPS Collection", "Offline Sync"]
            },
            {
                name: "Entrepôt",
                href: "/operations/warehouse",
                description: "Gestion des stocks, alertes de réapprovisionnement et logistique multi-sites",
                image: "/assets/features/stock_wide.svg",
                problemSolution: {
                    problem: "Manual stock sync with carriers + Douane compliance risks",
                    solution: "Carrier API sync (Yalidine/ProColis) + Import budget tracker"
                },
                subTabs: [
                    {
                        name: "État du Stock",
                        description: "Vue globale de l'inventaire avec score IA, opérations produits en split view, et indicateurs clés",
                        features: ["AI Inventory Score", "Product Operations", "Stock KPIs", "Stock Value"]
                    },
                    {
                        name: "Alertes & Mouvements",
                        description: "Alertes de stock faible par urgence, historique complet des mouvements et suggestions IA de réapprovisionnement",
                        features: ["Low Stock Alerts", "Stock Movements History", "AI Reorder Suggestions"]
                    },
                    {
                        name: "Sites & Retours",
                        description: "Gestion multi-sites (entrepôt + transporteurs), synchronisation des stocks et suivi des retours clients",
                        features: ["Stock Locations", "Carrier Stock Sync", "Returns Tracking"]
                    },
                    {
                        name: "Fournisseurs & Import",
                        description: "Base de données fournisseurs, service d'import Chine avec suivi douane, et tracker de budget import",
                        features: ["Supplier Database", "China Import Service", "Import Budget Tracker"]
                    }
                ],
                features: ["AI Inventory Score", "Low Stock Alerts", "Carrier Stock Sync", "Import Budget Tracker", "Supplier Database"]
            },
            {
                name: "Logistique & Retour",
                href: "/operations/logistics-recovery",
                description: "Gestion des expéditions 3PL et traitement des retours (Rotour)",
                image: "/assets/features/stock_wide.svg",
                problemSolution: {
                    problem: "Lost packages with 3PLs & unmanaged returns eating profit",
                    solution: "Centralized shipment tracking + Recovery workflow"
                },
                subTabs: [
                    {
                        name: "Expéditions",
                        description: "Suivi centralisé des colis chez tous les partenaires logistiques (Yalidine, ProColis, etc.)",
                        features: ["Centralized Tracking", "Delivery Issues", "Claim Manager"]
                    },
                    {
                        name: "Retours (Rotour)",
                        description: "Workflow de gestion des retours, scan d'entrée entrepôt et remise en stock rapide",
                        features: ["Return Scan", "Damage Inspection", "Restock Workflow"]
                    }
                ],
                features: ["Centralized Tracking", "Delivery Issues", "Return Scan", "Restock Workflow"]
            },
        ]
    },

    // =========================================================================
    // GROWTH ZONE - Green (#22C55E)
    // Route Prefix: /growth/
    // The Engine — Traffic, Content, and Revenue Acceleration
    // =========================================================================
    {
        id: "growth",
        title: "Growth Zone",
        description: "Content Creation, Ads Management & Partner Networks",
        icon: TrendingUp, // TrendingUp / Target
        color: "from-green-500/20 to-green-600/10",
        glowColor: "rgba(34, 197, 94, 0.4)",
        textColor: "text-green-400",
        pages: [
            {
                name: "Studio Créatif",
                href: "/growth/creative-studio",
                description: "Création de contenu IA, flux de production et conformité",
                image: "/assets/features/creatives_wide.svg",
                problemSolution: {
                    problem: "Standard French content doesn't convert in DZ market",
                    solution: "Darja optimizer + format presets + AI photo/video editor"
                },
                subTabs: [
                    {
                        name: "Création & IA",
                        description: "Outils IA de création: générateur de textes, accroches virales, éditeur média et optimiseur pour l'arabe algérien",
                        features: ["AI Copywriter", "Hook Generator", "AI Media Editor", "Darja Optimizer"]
                    },
                    {
                        name: "Modèles & Flux",
                        description: "Bibliothèque de templates prêts à l'emploi, tableau Kanban de gestion du contenu et planificateur de publication",
                        features: ["Template Library", "Content Kanban", "Scheduler", "Content Pipeline"]
                    },
                    {
                        name: "Marque & Conformité",
                        description: "Profil de voix de marque pour cohérence, vérificateur de conformité et presets de format par plateforme",
                        features: ["Brand Voice Profile", "Content Safety Checker", "Format Presets"]
                    },
                    {
                        name: "Outils & TikTok",
                        description: "Outils de monétisation TikTok, optimiseur de qualité vidéo et accès au service de création UGC",
                        features: ["TikTok Monetization Wizard", "Quality Optimizer", "UGC Service Request"]
                    }
                ],
                features: ["AI Copywriter", "Hook Generator", "Darja Optimizer", "Template Library", "Brand Voice Profile", "TikTok Monetization"]
            },
            {
                name: "Gestionnaire Pubs",
                href: "/growth/ads-manager",
                description: "Gestion campagnes, budgets, ROAS et reporting",
                image: "/assets/features/ads_wide.svg",
                problemSolution: {
                    problem: "Account bans & hidden forex costs (Squar/Paysera/Wise)",
                    solution: "Account health monitor + currency expense tracker for real costs"
                },
                subTabs: [
                    {
                        name: "Campagnes & ROAS",
                        description: "Liste des campagnes avec métriques clés, suivi ROAS par campagne et plateforme, et taux de livraison",
                        features: ["Campaign List", "ROAS Tracking", "Delivery Rate KPI", "AI Campaign Rating"]
                    },
                    {
                        name: "Budget & Règles",
                        description: "Planification budgétaire, règles automatiques d'arrêt en cas de mauvaise performance, et suivi des taux de change",
                        features: ["Budget Planner", "Stop-Loss Rules", "Currency Tracker", "Spend Alerts"]
                    },
                    {
                        name: "Trafic & Tunnel",
                        description: "Analyse du trafic par source, visualisation du tunnel de conversion et performance des pages d'atterrissage",
                        features: ["Traffic Analytics", "Conversion Funnel", "Landing Page Performance"]
                    },
                    {
                        name: "Compte & Rapports",
                        description: "Monitoring de la santé des comptes publicitaires, gestion multi-comptes agence, et génération de rapports",
                        features: ["Account Health Monitor", "Agency Manager", "Performance Reports"]
                    }
                ],
                features: ["Campaign Management", "ROAS Tracking", "Stop-Loss Rules", "Currency Tracker", "Account Health", "Traffic Analytics"]
            },
            {
                name: "Marketing & Growth",
                href: "/growth/marketing",
                description: "Affiliation, automates sociaux et partenariats",
                image: "/assets/features/marketing_wide.svg",
                problemSolution: {
                    problem: "Finding verified DZ influencers is hard, manual confirmations don't scale",
                    solution: "Influencer marketplace + AI Confirmation Bots"
                },
                subTabs: [
                    {
                        name: "Influenceurs & UGC",
                        description: "Marketplace d'influenceurs algériens, calculateur de tarifs, demande de création UGC et modèles de contrats",
                        features: ["Influencer Marketplace", "Rate Calculator", "UGC Service", "Contract Generator"]
                    },
                    {
                        name: "Affiliation",
                        description: "Gestion des affiliés, création de liens de commission, tableau de bord des paiements et suivi des performances",
                        features: ["Affiliate Management", "Commission Links", "Payout Dashboard", "Performance Tracking"]
                    },
                    {
                        name: "Plateformes & Social",
                        description: "Hub multi-plateformes, bot IA de réponse aux commentaires, garde anti-spam et bot de confirmation WhatsApp",
                        features: ["Platform Hub", "AI Comment Responder", "Comments Guard", "Confirmation Bot"]
                    },
                    {
                        name: "Analyses & Config",
                        description: "Analytics des campagnes marketing, configuration des bots, KPIs globaux et paramètres d'intégration",
                        features: ["Campaign Analytics", "Bot Settings", "Marketing KPIs", "Integration Config"]
                    }
                ],
                features: ["Influencer Marketplace", "UGC Creators", "Affiliate System", "DM Sales Agent", "DM Support Agent", "Comment Response Agent"]
            },
        ]
    },

    // =========================================================================
    // COMMAND ZONE - Purple (#8B5CF6)
    // Route Prefix: /command/
    // The Penthouse — Finance, Sourcing, and Strategic Intelligence
    // =========================================================================
    {
        id: "command",
        title: "Command Zone",
        description: "Finance, Sourcing & Strategic Intelligence",
        icon: Crown, // Crown / Banknote
        color: "from-purple-500/20 to-purple-600/10",
        glowColor: "rgba(139, 92, 246, 0.4)",
        textColor: "text-purple-400",
        pages: [
            {
                name: "Tableau de Bord",
                href: "/command/finance",
                description: "Performance financière, livraison et reporting",
                image: "/assets/features/analytics_wide.svg",
                problemSolution: {
                    problem: "COD cash frozen at Yalidine/ProColis, tax compliance chaos",
                    solution: "Cash collector tracks remittances + IFU calculator ensures legal compliance"
                },
                subTabs: [
                    {
                        name: "Vue d'Ensemble",
                        description: "KPIs globaux de performance avec revenus, bénéfices, commandes et panier moyen. Graphiques et analyse des paiements",
                        features: ["Revenue Dashboard", "Orders Chart", "Payment Method Analytics", "Creator Earnings", "IFU Calculator"]
                    },
                    {
                        name: "Livraison & Wilayas",
                        description: "Comparaison des transporteurs, carte thermique des wilayas, revenus par région et indicateurs de livraison",
                        features: ["Carrier Comparison", "Wilaya Heatmap", "Regional Revenue", "Delivery Performance"]
                    },
                    {
                        name: "Finance & Rentabilité",
                        description: "Calculateurs financiers avancés, analyse ROAS par plateforme, répartition des coûts et collecte COD",
                        features: ["Profit Calculator", "ROAS Analyzer", "Cost Breakdown", "Cash Collector", "Currency Tracker"]
                    },
                    {
                        name: "Rapports & Outils",
                        description: "Génération de rapports personnalisés, intégrations GA4/Meta/TikTok, automatisation des exports et tutoriels",
                        features: ["Report Builder", "Data Integrations", "Scheduled Reports", "Platform Guides"]
                    }
                ],
                features: ["Revenue Dashboard", "Wilaya Heatmap", "Carrier Comparison", "IFU Calculator", "Cash Collector", "Payment Analytics", "Report Builder"]
            },
            {
                name: "Découverte Produits",
                href: "/command/sourcing",
                description: "Sourcing produits, import et validation marché",
                image: "/assets/features/product-research_wide.svg",
                problemSolution: {
                    problem: "Finding local suppliers (El Hamiz/El Eulma) is hard",
                    solution: "Curated Algerian supplier database + competitor ad & price tracker"
                },
                subTabs: [
                    {
                        name: "Recherche & Tendances",
                        description: "Moteur de découverte produits multi-sources, score IA du potentiel gagnant, et suivi actif des produits d'intérêt",
                        features: ["Product Search", "AI Winning Score", "Tracker Dashboard", "Bestseller Trends"]
                    },
                    {
                        name: "Marché Algérien",
                        description: "Analyse des tendances spécifiques au marché algérien, publicités qui marchent localement, et niches en croissance",
                        features: ["Algeria Trends", "Trending Ads DZ", "Niche Topics", "Local Demand"]
                    },
                    {
                        name: "Fournisseurs & Coûts",
                        description: "Base de fournisseurs vérifiés et calculateur de coût total (produit + shipping + douane) pour décision d'achat",
                        features: ["Supplier Database", "Cost Calculator", "Landing Cost Analysis"]
                    },
                    {
                        name: "Social & Validation",
                        description: "Suivi des concurrents, signaux sociaux (likes, partages, commentaires) et validation du potentiel marché",
                        features: ["Competitor Tracker", "Social Signals", "Engagement Analysis"]
                    }
                ],
                features: ["Product Search", "AI Winning Score", "Algeria Trends", "Supplier Database", "Competitor Tracker"]
            },
        ]
    },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a random page from a category
 */
export function getRandomPage(category: HubCategory): { name: string; href: string } {
    const randomIndex = Math.floor(Math.random() * category.pages.length);
    return category.pages[randomIndex];
}

/**
 * Get random pages for all categories (used on hub page load)
 */
export function getRandomPagesForAllCategories(): Map<string, { name: string; href: string }> {
    const result = new Map<string, { name: string; href: string }>();
    HUB_CATEGORIES.forEach(category => {
        result.set(category.id, getRandomPage(category));
    });
    return result;
}
