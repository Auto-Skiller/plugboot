
// High-quality mock data for Research Studio components

// --- Types ---

export interface TrendingProductAd {
    id: number;
    title: string;
    brand: string;
    platform: 'instagram' | 'facebook' | 'tiktok';
    imageUrl: string; // Added for visual richness

    // Trending metrics
    views: string;
    engagement: string;
    days: number;

    // Conversion metrics
    ctr: string;
    conversion: string;
    roas: string;

    // Actions
    isBookmarked?: boolean;
}

export interface SocialMediaTopic {
    id: number;
    title: string;
    niche: string;
    platforms: Array<'facebook' | 'instagram' | 'tiktok'>;

    // Engagement
    mentions: number;
    totalReach: string;
    engagementRate: string;

    // Sentiment
    sentiment: {
        positive: number;
        neutral: number;
        negative: number;
    };

    // Sample opinions
    topOpinions: Array<{
        text: string;
        author: string;
        platform: string;
        likes: number;
    }>;

    // Metadata
    trendingDays: number;
    lastUpdated: string;
}

export interface RecentProduct {
    id: number;
    title: string;
    image: string;
    price: string;
    platform: string;
    searchDate: string;
    winningProbability: number; // 0-100
    metrics: {
        orders: string;
        rating: number;
        reviews: number;
    };
}

// --- Data ---

export const TRENDING_ADS: TrendingProductAd[] = [
    {
        id: 1,
        title: "Galaxy Star Projector 2.0",
        brand: "LumiSky",
        platform: "tiktok",
        imageUrl: "https://images.unsplash.com/photo-1534234828563-025a9437aa2c?w=500&q=80",
        views: "2.4M",
        engagement: "145K",
        days: 3,
        ctr: "4.2%",
        conversion: "2.8%",
        roas: "4.5x",
        isBookmarked: true
    },
    {
        id: 2,
        title: "ErgoLift Laptop Stand",
        brand: "WorkSmart",
        platform: "instagram",
        imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
        views: "850K",
        engagement: "42K",
        days: 5,
        ctr: "3.1%",
        conversion: "1.9%",
        roas: "3.2x",
        isBookmarked: false
    },
    {
        id: 3,
        title: "HydroFlask 32oz Bundle",
        brand: "AquaLife",
        platform: "facebook",
        imageUrl: "https://images.unsplash.com/photo-1602143407151-a1114130c2d3?w=500&q=80",
        views: "1.2M",
        engagement: "89K",
        days: 12,
        ctr: "2.8%",
        conversion: "3.4%",
        roas: "2.9x",
        isBookmarked: false
    },
    {
        id: 4,
        title: "Smart Pet Feeder Pro",
        brand: "PetTech",
        platform: "instagram",
        imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80",
        views: "560K",
        engagement: "38K",
        days: 2,
        ctr: "4.8%",
        conversion: "4.1%",
        roas: "5.1x",
        isBookmarked: false
    },
    {
        id: 5,
        title: "Sonic Facial Cleanser",
        brand: "GlowUp",
        platform: "tiktok",
        imageUrl: "https://images.unsplash.com/photo-1556228722-0d325705409e?w=500&q=80",
        views: "3.1M",
        engagement: "210K",
        days: 1,
        ctr: "5.5%",
        conversion: "3.8%",
        roas: "6.0x",
        isBookmarked: true
    },
    {
        id: 6,
        title: "Noise Cancelling Sleep Buds",
        brand: "DreamAudio",
        platform: "facebook",
        imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80",
        views: "920K",
        engagement: "67K",
        days: 7,
        ctr: "3.5%",
        conversion: "2.2%",
        roas: "3.8x",
        isBookmarked: false
    }
];

export const SOCIAL_TOPICS: SocialMediaTopic[] = [
    {
        id: 1,
        title: "Sustainable Kitchen Storage",
        niche: "Home & Garden",
        platforms: ['instagram', 'tiktok'],
        mentions: 45200,
        totalReach: "12.5M",
        engagementRate: "5.8%",
        sentiment: {
            positive: 75,
            neutral: 20,
            negative: 5
        },
        topOpinions: [
            {
                text: "Glass jars are so much better for meal prep! #sustainable",
                author: "@eco_life",
                platform: "instagram",
                likes: 1240
            },
            {
                text: "Love how organized my pantry looks now.",
                author: "@home_organized",
                platform: "tiktok",
                likes: 850
            }
        ],
        trendingDays: 14,
        lastUpdated: "2h ago"
    },
    {
        id: 2,
        title: "AI Productivity Tools",
        niche: "Tech & Gadgets",
        platforms: ['facebook', 'instagram', 'tiktok'],
        mentions: 89000,
        totalReach: "28.1M",
        engagementRate: "4.2%",
        sentiment: {
            positive: 60,
            neutral: 30,
            negative: 10
        },
        topOpinions: [
            {
                text: "ChatGPT integration is a game changer for workflows.",
                author: "TechDaily",
                platform: "facebook",
                likes: 3400
            },
            {
                text: "Is this actually useful or just hype? 🤔",
                author: "@skeptic_dev",
                platform: "tiktok",
                likes: 120
            }
        ],
        trendingDays: 5,
        lastUpdated: "15m ago"
    },
    {
        id: 3,
        title: "Heatless Curls",
        niche: "Beauty & Personal Care",
        platforms: ['tiktok', 'instagram'],
        mentions: 120000,
        totalReach: "45M",
        engagementRate: "8.1%",
        sentiment: {
            positive: 85,
            neutral: 10,
            negative: 5
        },
        topOpinions: [
            {
                text: "Best hack for healthy hair! No damage at all.",
                author: "@hairgoals",
                platform: "tiktok",
                likes: 15000
            },
            {
                text: "Takes some practice but results are worth it.",
                author: "@beauty_guru",
                platform: "instagram",
                likes: 4200
            }
        ],
        trendingDays: 21,
        lastUpdated: "1h ago"
    },
    {
        id: 4,
        title: "Calisthenics Home Gym",
        niche: "Fitness",
        platforms: ['instagram', 'tiktok', 'facebook'],
        mentions: 32000,
        totalReach: "8.2M",
        engagementRate: "6.5%",
        sentiment: {
            positive: 90,
            neutral: 8,
            negative: 2
        },
        topOpinions: [
            {
                text: "You don't need weights to get shredded.",
                author: "@street_workout",
                platform: "instagram",
                likes: 2100
            },
            {
                text: "Perfect setup for small apartments.",
                author: "GymRat",
                platform: "facebook",
                likes: 560
            }
        ],
        trendingDays: 4,
        lastUpdated: "45m ago"
    },
    {
        id: 5,
        title: "Smart Pet Monitoring",
        niche: "Pet Supplies",
        platforms: ['facebook', 'instagram'],
        mentions: 18500,
        totalReach: "4.5M",
        engagementRate: "3.9%",
        sentiment: {
            positive: 65,
            neutral: 25,
            negative: 10
        },
        topOpinions: [
            {
                text: "Peace of mind when I'm at work is priceless.",
                author: "DogMom",
                platform: "facebook",
                likes: 890
            },
            {
                text: "A bit pricey for a camera but the app is good.",
                author: "@cat_lover",
                platform: "instagram",
                likes: 130
            }
        ],
        trendingDays: 8,
        lastUpdated: "3h ago"
    },
    {
        id: 6,
        title: "Minimalist Desk Setup",
        niche: "Home & Garden",
        platforms: ['instagram', 'tiktok'],
        mentions: 67000,
        totalReach: "18M",
        engagementRate: "7.2%",
        sentiment: {
            positive: 95,
            neutral: 4,
            negative: 1
        },
        topOpinions: [
            {
                text: "Clean space, clean mind. ✨",
                author: "@workspace_inspo",
                platform: "instagram",
                likes: 5600
            },
            {
                text: "Where did you get that monitor riser?",
                author: "@setup_wars",
                platform: "tiktok",
                likes: 230
            }
        ],
        trendingDays: 30,
        lastUpdated: "5h ago"
    }
];

export const RECENT_SEARCHES: RecentProduct[] = [
    {
        id: 1,
        title: "Wireless Earbuds Pro",
        image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=100&q=80",
        price: "$29.99",
        platform: "AliExpress",
        searchDate: "2 hours ago",
        winningProbability: 85,
        metrics: {
            orders: "5.2K",
            rating: 4.7,
            reviews: 1240
        }
    },
    {
        id: 2,
        title: "LED Strip Lights",
        image: "https://images.unsplash.com/photo-1618219944342-824e40a13285?w=100&q=80",
        price: "$15.99",
        platform: "Amazon",
        searchDate: "5 hours ago",
        winningProbability: 92,
        metrics: {
            orders: "8.1K",
            rating: 4.9,
            reviews: 2580
        }
    },
    {
        id: 3,
        title: "Portable Blender",
        image: "https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=100&q=80",
        price: "$24.99",
        platform: "Shopify",
        searchDate: "1 day ago",
        winningProbability: 78,
        metrics: {
            orders: "3.4K",
            rating: 4.5,
            reviews: 890
        }
    },
    {
        id: 4,
        title: "Orthopedic Yoga Mat",
        image: "https://images.unsplash.com/photo-1593164842264-854604db0563?w=100&q=80",
        price: "$45.00",
        platform: "Amazon",
        searchDate: "2 days ago",
        winningProbability: 65,
        metrics: {
            orders: "1.2K",
            rating: 4.3,
            reviews: 320
        }
    },
    {
        id: 5,
        title: "Cat Laser Toy",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&q=80",
        price: "$12.50",
        platform: "AliExpress",
        searchDate: "3 days ago",
        winningProbability: 45,
        metrics: {
            orders: "890",
            rating: 4.1,
            reviews: 150
        }
    }
];

// --- Supplier Database Types & Data ---

export interface Supplier {
    id: number;
    name: string;
    wilaya: string;
    category: 'Textiles' | 'Cosmetics' | 'Plastics' | 'Electronics' | 'Food';
    products: string[];
    contact: {
        phone: string;
        email?: string;
        website?: string;
    };
    moq: number; // Minimum Order Quantity
    leadTime: string; // e.g., "7-14 days"
    verified: boolean;
    rating?: number;
    description?: string;
    isPending?: boolean; // User-submitted, pending review
}

export const SUPPLIERS: Supplier[] = [
    // Textiles - Boumerdes & Blida region
    {
        id: 1,
        name: "Textile El Baraka",
        wilaya: "Boumerdes",
        category: "Textiles",
        products: ["T-shirts", "Polos", "Hoodies", "Custom prints"],
        contact: { phone: "0551 234 567", email: "contact@elbaraka-textile.dz" },
        moq: 100,
        leadTime: "7-14 days",
        verified: true,
        rating: 4.8,
        description: "Premium quality cotton garments with custom printing"
    },
    {
        id: 2,
        name: "SARL Confection Blida",
        wilaya: "Blida",
        category: "Textiles",
        products: ["Jeans", "Pants", "Workwear", "Uniforms"],
        contact: { phone: "0661 345 678", email: "info@confection-blida.com" },
        moq: 50,
        leadTime: "10-21 days",
        verified: true,
        rating: 4.5
    },
    {
        id: 3,
        name: "Atelier Fatima",
        wilaya: "Tizi Ouzou",
        category: "Textiles",
        products: ["Traditional dresses", "Kaftans", "Wedding attire"],
        contact: { phone: "0770 456 789" },
        moq: 20,
        leadTime: "14-30 days",
        verified: false,
        rating: 4.2
    },
    // Cosmetics
    {
        id: 4,
        name: "Venus Cosmetics DZ",
        wilaya: "Algiers",
        category: "Cosmetics",
        products: ["Skincare", "Lipsticks", "Foundations", "Natural oils"],
        contact: { phone: "0552 567 890", email: "venus@cosmetics-dz.com", website: "www.venus-dz.com" },
        moq: 200,
        leadTime: "5-10 days",
        verified: true,
        rating: 4.9,
        description: "Locally made cosmetics with natural Algerian ingredients"
    },
    {
        id: 5,
        name: "Sahara Beauty Lab",
        wilaya: "Oran",
        category: "Cosmetics",
        products: ["Argan oil", "Hair masks", "Body lotions", "Perfumes"],
        contact: { phone: "0663 678 901", email: "contact@saharabeauty.dz" },
        moq: 100,
        leadTime: "7-14 days",
        verified: true,
        rating: 4.6
    },
    // Plastics
    {
        id: 6,
        name: "Plastiques Algériens SARL",
        wilaya: "Setif",
        category: "Plastics",
        products: ["Containers", "Bottles", "Packaging", "Custom molds"],
        contact: { phone: "0554 789 012", email: "plastiques.alg@gmail.com" },
        moq: 500,
        leadTime: "14-21 days",
        verified: true,
        rating: 4.4,
        description: "Industrial plastic manufacturing with custom mold capabilities"
    },
    {
        id: 7,
        name: "Emballage Pro",
        wilaya: "Constantine",
        category: "Plastics",
        products: ["Food packaging", "Bags", "Films", "Boxes"],
        contact: { phone: "0665 890 123" },
        moq: 1000,
        leadTime: "10-14 days",
        verified: true,
        rating: 4.3
    },
    // Electronics
    {
        id: 8,
        name: "Tech Assembly DZ",
        wilaya: "Algiers",
        category: "Electronics",
        products: ["Phone accessories", "Chargers", "Cables", "Screen protectors"],
        contact: { phone: "0556 901 234", email: "tech-assembly@outlook.dz" },
        moq: 200,
        leadTime: "7-14 days",
        verified: true,
        rating: 4.1
    },
    {
        id: 9,
        name: "LED Maghreb",
        wilaya: "Oran",
        category: "Electronics",
        products: ["LED strips", "Bulbs", "Smart lights", "Projectors"],
        contact: { phone: "0667 012 345", website: "www.led-maghreb.dz" },
        moq: 100,
        leadTime: "5-10 days",
        verified: false,
        rating: 3.9
    },
    // Food
    {
        id: 10,
        name: "Délices d'Algérie",
        wilaya: "Algiers",
        category: "Food",
        products: ["Dates", "Honey", "Olive oil", "Traditional sweets"],
        contact: { phone: "0558 123 456", email: "delices@algerie-food.dz" },
        moq: 50,
        leadTime: "3-7 days",
        verified: true,
        rating: 4.8,
        description: "Premium Algerian food products for local and export"
    },
    {
        id: 11,
        name: "Couscous Factory Biskra",
        wilaya: "Biskra",
        category: "Food",
        products: ["Couscous", "Dried pasta", "Semolina", "Flour"],
        contact: { phone: "0669 234 567" },
        moq: 100,
        leadTime: "5-10 days",
        verified: true,
        rating: 4.5
    },
    {
        id: 12,
        name: "Saharan Spices",
        wilaya: "Ghardaia",
        category: "Food",
        products: ["Spices", "Herbs", "Ras el hanout", "Dried peppers"],
        contact: { phone: "0771 345 678", email: "saharan.spices@gmail.com" },
        moq: 30,
        leadTime: "7-14 days",
        verified: true,
        rating: 4.7
    }
];

// --- Enhanced Competitor Tracker Types & Data ---

export interface Competitor {
    id: number;
    name: string;
    fbPageUrl: string;
    profileImage?: string;
    followers: string;
    addedDate: string;
    status: 'active' | 'paused';
}

export interface CompetitorAd {
    id: number;
    competitorId: number;
    platform: 'facebook' | 'instagram';
    adType: 'image' | 'video' | 'carousel';
    headline: string;
    spendEstimate: string;
    startDate: string;
    status: 'active' | 'inactive';
    engagement: string;
    isNew?: boolean;
}

export interface CompetitorProduct {
    id: number;
    competitorId: number;
    name: string;
    currentPrice: number;
    previousPrice?: number;
    priceHistory: { date: string; price: number }[];
    lastUpdated: string;
    isNew?: boolean;
    launchedDate?: string;
    image?: string;
}

export interface CompetitorAlert {
    id: number;
    competitorId: number;
    type: 'new_ad' | 'price_change' | 'new_product';
    message: string;
    timestamp: string;
    read: boolean;
}

export const COMPETITORS: Competitor[] = [
    {
        id: 1,
        name: "TechStore DZ",
        fbPageUrl: "https://facebook.com/techstoredz",
        followers: "125K",
        addedDate: "2024-01-15",
        status: 'active'
    },
    {
        id: 2,
        name: "BestDeal Algeria",
        fbPageUrl: "https://facebook.com/bestdealalgeria",
        followers: "89K",
        addedDate: "2024-02-01",
        status: 'active'
    },
    {
        id: 3,
        name: "Fashion House DZ",
        fbPageUrl: "https://facebook.com/fashionhousedz",
        followers: "210K",
        addedDate: "2024-02-20",
        status: 'active'
    }
];

export const COMPETITOR_ADS: CompetitorAd[] = [
    {
        id: 1,
        competitorId: 1,
        platform: 'facebook',
        adType: 'video',
        headline: "New Wireless Earbuds - 50% OFF!",
        spendEstimate: "50K-100K DA/day",
        startDate: "2024-12-20",
        status: 'active',
        engagement: "12.5K",
        isNew: true
    },
    {
        id: 2,
        competitorId: 1,
        platform: 'instagram',
        adType: 'carousel',
        headline: "Smart Watch Collection 2025",
        spendEstimate: "30K-50K DA/day",
        startDate: "2024-12-18",
        status: 'active',
        engagement: "8.2K"
    },
    {
        id: 3,
        competitorId: 2,
        platform: 'facebook',
        adType: 'image',
        headline: "Flash Sale - Electronics",
        spendEstimate: "20K-40K DA/day",
        startDate: "2024-12-22",
        status: 'active',
        engagement: "5.1K",
        isNew: true
    },
    {
        id: 4,
        competitorId: 3,
        platform: 'instagram',
        adType: 'video',
        headline: "Winter Fashion Collection",
        spendEstimate: "80K-150K DA/day",
        startDate: "2024-12-15",
        status: 'active',
        engagement: "25K"
    }
];

export const COMPETITOR_PRODUCTS: CompetitorProduct[] = [
    {
        id: 1,
        competitorId: 1,
        name: "Wireless Earbuds Pro",
        currentPrice: 11500,
        previousPrice: 12000,
        priceHistory: [
            { date: "2024-12-01", price: 13000 },
            { date: "2024-12-10", price: 12000 },
            { date: "2024-12-20", price: 11500 }
        ],
        lastUpdated: "2h ago",
        isNew: false,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&q=80"
    },
    {
        id: 2,
        competitorId: 1,
        name: "Smart Watch S5",
        currentPrice: 36000,
        previousPrice: 35000,
        priceHistory: [
            { date: "2024-12-01", price: 34000 },
            { date: "2024-12-15", price: 35000 },
            { date: "2024-12-22", price: 36000 }
        ],
        lastUpdated: "5h ago",
        isNew: true,
        launchedDate: "2024-12-22",
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&q=80"
    },
    {
        id: 3,
        competitorId: 2,
        name: "USB-C Hub 7-in-1",
        currentPrice: 5900,
        previousPrice: 6500,
        priceHistory: [
            { date: "2024-12-01", price: 7000 },
            { date: "2024-12-15", price: 6500 },
            { date: "2024-12-20", price: 5900 }
        ],
        lastUpdated: "1d ago",
        isNew: true,
        launchedDate: "2024-12-20",
        image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=200&q=80"
    }
];

export const COMPETITOR_ALERTS: CompetitorAlert[] = [
    {
        id: 1,
        competitorId: 1,
        type: 'new_ad',
        message: "TechStore DZ launched new video ad: 'Wireless Earbuds - 50% OFF'",
        timestamp: "2024-12-24T01:30:00",
        read: false
    },
    {
        id: 2,
        competitorId: 1,
        type: 'price_change',
        message: "Wireless Earbuds Pro price dropped from 12,000 DA to 11,500 DA (-4%)",
        timestamp: "2024-12-23T18:00:00",
        read: false
    },
    {
        id: 3,
        competitorId: 2,
        type: 'new_ad',
        message: "BestDeal Algeria launched new Flash Sale campaign",
        timestamp: "2024-12-22T10:00:00",
        read: true
    },
    {
        id: 4,
        competitorId: 3,
        type: 'new_product',
        message: "Fashion House DZ added 'Winter Jacket Premium' to catalog",
        timestamp: "2024-12-21T14:30:00",
        read: true
    }
];

// --- Algeria Trends Types & Data ---

export interface TrendingHashtag {
    id: number;
    tag: string;
    platform: 'facebook' | 'instagram' | 'tiktok';
    posts: string;
    velocity: 'rising' | 'stable' | 'declining';
    weeklyGrowth: string;
    relatedProducts?: string[];
}

export interface TrendingProduct {
    id: number;
    name: string;
    category: string;
    adFrequency: number; // Number of ads in last 7 days
    priceRange: string;
    demandScore: number; // 1-100
    platforms: Array<'facebook' | 'instagram' | 'tiktok'>;
}

export interface ContentFormat {
    id: number;
    name: string;
    description: string;
    platform: 'facebook' | 'instagram' | 'tiktok';
    engagementRate: string;
    examples: string[];
    isHot?: boolean;
}

export interface TrendingSound {
    id: number;
    name: string;
    artist?: string;
    platform: 'tiktok' | 'instagram';
    uses: string;
    velocity: 'rising' | 'stable' | 'declining';
    weeklyGrowth: string;
    category: 'Music' | 'Original' | 'Voiceover' | 'Remix';
    isHot?: boolean;
}

export interface AlgeriaTrendsData {
    hashtags: TrendingHashtag[];
    products: TrendingProduct[];
    formats: ContentFormat[];
    sounds: TrendingSound[];
    lastUpdated: string;
    nextRefresh: string;
}

export const ALGERIA_TRENDS: AlgeriaTrendsData = {
    lastUpdated: "2024-12-24T00:00:00",
    nextRefresh: "2024-12-31T00:00:00",
    hashtags: [
        { id: 1, tag: "#الجزائر", platform: "instagram", posts: "2.5M", velocity: "stable", weeklyGrowth: "+3%", relatedProducts: ["Traditional crafts", "Tourism"] },
        { id: 2, tag: "#dzcommerce", platform: "facebook", posts: "450K", velocity: "rising", weeklyGrowth: "+25%", relatedProducts: ["E-commerce", "Dropshipping"] },
        { id: 3, tag: "#algeriafashion", platform: "instagram", posts: "320K", velocity: "rising", weeklyGrowth: "+18%", relatedProducts: ["Clothing", "Accessories"] },
        { id: 4, tag: "#algeriantiktok", platform: "tiktok", posts: "1.8M", velocity: "rising", weeklyGrowth: "+40%", relatedProducts: ["Trending products", "Gadgets"] },
        { id: 5, tag: "#madeinalgeria", platform: "instagram", posts: "180K", velocity: "rising", weeklyGrowth: "+15%", relatedProducts: ["Local products", "Handmade"] },
        { id: 6, tag: "#dzbeauty", platform: "tiktok", posts: "520K", velocity: "stable", weeklyGrowth: "+8%", relatedProducts: ["Cosmetics", "Skincare"] },
        { id: 7, tag: "#oranlife", platform: "instagram", posts: "95K", velocity: "stable", weeklyGrowth: "+5%", relatedProducts: ["Lifestyle", "Food"] },
        { id: 8, tag: "#techdzair", platform: "facebook", posts: "78K", velocity: "rising", weeklyGrowth: "+22%", relatedProducts: ["Electronics", "Phones"] }
    ],
    products: [
        { id: 1, name: "Wireless Earbuds", category: "Electronics", adFrequency: 156, priceRange: "8,000-15,000 DA", demandScore: 92, platforms: ["facebook", "instagram", "tiktok"] },
        { id: 2, name: "Smart Watch", category: "Electronics", adFrequency: 124, priceRange: "25,000-45,000 DA", demandScore: 88, platforms: ["facebook", "instagram"] },
        { id: 3, name: "Abaya & Hijab Sets", category: "Fashion", adFrequency: 98, priceRange: "3,500-12,000 DA", demandScore: 85, platforms: ["facebook", "instagram"] },
        { id: 4, name: "Kitchen Gadgets", category: "Home", adFrequency: 87, priceRange: "1,500-8,000 DA", demandScore: 82, platforms: ["facebook", "tiktok"] },
        { id: 5, name: "LED Strip Lights", category: "Electronics", adFrequency: 76, priceRange: "2,000-5,000 DA", demandScore: 79, platforms: ["tiktok", "instagram"] },
        { id: 6, name: "Skincare Sets", category: "Beauty", adFrequency: 71, priceRange: "4,000-15,000 DA", demandScore: 86, platforms: ["instagram", "tiktok"] },
        { id: 7, name: "Phone Accessories", category: "Electronics", adFrequency: 65, priceRange: "500-3,000 DA", demandScore: 75, platforms: ["facebook", "tiktok"] },
        { id: 8, name: "Fitness Equipment", category: "Sports", adFrequency: 54, priceRange: "5,000-25,000 DA", demandScore: 68, platforms: ["instagram", "facebook"] }
    ],
    formats: [
        { id: 1, name: "Unboxing Videos", description: "Product reveal with genuine reactions", platform: "tiktok", engagementRate: "8.5%", examples: ["15-30 sec clips", "Before/after reveals"], isHot: true },
        { id: 2, name: "Customer Testimonials", description: "Real customer reviews on camera", platform: "facebook", engagementRate: "6.2%", examples: ["Video calls", "Voice messages"], isHot: true },
        { id: 3, name: "Price Comparison", description: "Showing value vs competitors", platform: "facebook", engagementRate: "5.8%", examples: ["Side-by-side photos", "Price cards"] },
        { id: 4, name: "Tutorial/How-to", description: "Demonstrating product usage", platform: "instagram", engagementRate: "7.1%", examples: ["Reels", "Carousel guides"] },
        { id: 5, name: "Trending Sound Ads", description: "Using viral TikTok sounds", platform: "tiktok", engagementRate: "9.2%", examples: ["Lip-sync ads", "Dance challenges"], isHot: true },
        { id: 6, name: "Live Shopping", description: "Real-time product demos with Q&A", platform: "facebook", engagementRate: "4.5%", examples: ["FB Live", "Interactive sales"] },
        { id: 7, name: "Before/After", description: "Transformation content", platform: "instagram", engagementRate: "7.8%", examples: ["Skincare results", "Room makeovers"] },
        { id: 8, name: "Day in Life", description: "Product integrated into lifestyle", platform: "tiktok", engagementRate: "6.9%", examples: ["Morning routines", "Outfit transitions"] }
    ],
    sounds: [
        { id: 1, name: "Ya Rayah", artist: "Rachid Taha", platform: "tiktok", uses: "1.2M", velocity: "stable", weeklyGrowth: "+5%", category: "Music", isHot: true },
        { id: 2, name: "Allo Allo", artist: "Cheb Khaled", platform: "tiktok", uses: "890K", velocity: "rising", weeklyGrowth: "+35%", category: "Music" },
        { id: 3, name: "DZ Product Review", platform: "tiktok", uses: "450K", velocity: "rising", weeklyGrowth: "+42%", category: "Voiceover", isHot: true },
        { id: 4, name: "Before/After Sound", platform: "instagram", uses: "320K", velocity: "stable", weeklyGrowth: "+8%", category: "Original" },
        { id: 5, name: "Unboxing Hype", platform: "tiktok", uses: "560K", velocity: "rising", weeklyGrowth: "+28%", category: "Original", isHot: true },
        { id: 6, name: "Rai Remix 2024", artist: "DJ Alg", platform: "tiktok", uses: "780K", velocity: "rising", weeklyGrowth: "+22%", category: "Remix" },
        { id: 7, name: "Customer Happy", platform: "tiktok", uses: "210K", velocity: "stable", weeklyGrowth: "+12%", category: "Voiceover" },
        { id: 8, name: "Flash Sale Alert", platform: "instagram", uses: "180K", velocity: "rising", weeklyGrowth: "+18%", category: "Original" }
    ]
};

// Algerian Wilayas for filters
export const ALGERIA_WILAYAS = [
    "Algiers", "Oran", "Constantine", "Annaba", "Blida", "Batna", "Djelfa", "Sétif",
    "Sidi Bel Abbès", "Biskra", "Tébessa", "El Oued", "Skikda", "Tiaret", "Béjaïa",
    "Tlemcen", "Ouargla", "Béchar", "Mostaganem", "Bordj Bou Arréridj", "Chlef",
    "Souk Ahras", "Médéa", "El Tarf", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
    "Ghardaïa", "Relizane", "Tizi Ouzou", "Boumerdes", "Khenchela", "Jijel", "Tipaza",
    "M'Sila", "Laghouat", "Oum El Bouaghi", "Bouira", "Tamanghasset", "Adrar", "Illizi"
];
