import { LucideIcon, Rocket, MessageSquare, Gift, Megaphone, Users } from "lucide-react";

export interface ContentTemplate {
    id: string;
    name: string;
    description: string;
    category: "product" | "engagement" | "announcement" | "giveaway" | "community";
    icon: LucideIcon;
    hook: string;
    structure: string[];
    platforms: string[];
    brandVoice: "exciting" | "casual" | "professional" | "friendly";
    hashtags: string[];
}

export const CONTENT_TEMPLATES: ContentTemplate[] = [
    {
        id: "product-launch",
        name: "Product Launch",
        description: "Announce a new product with excitement and urgency",
        category: "product",
        icon: Rocket,
        hook: "🚀 Introducing [PRODUCT] - The game-changer you've been waiting for!",
        structure: ["Hook", "Problem Statement", "Solution (Your Product)", "Key Benefits", "CTA"],
        platforms: ["Instagram", "Facebook", "TikTok"],
        brandVoice: "exciting",
        hashtags: ["#NewProduct", "#Launch", "#MustHave"]
    },
    {
        id: "engagement-question",
        name: "Engagement Post",
        description: "Boost engagement with questions and polls",
        category: "engagement",
        icon: MessageSquare,
        hook: "Quick question for my [AUDIENCE] 👇",
        structure: ["Question", "Context", "Options/Poll", "Engage CTA"],
        platforms: ["Instagram", "TikTok", "Twitter"],
        brandVoice: "casual",
        hashtags: ["#Question", "#YourOpinion", "#LetsTalk"]
    },
    {
        id: "giveaway",
        name: "Giveaway Contest",
        description: "Run a giveaway to boost followers and engagement",
        category: "giveaway",
        icon: Gift,
        hook: "🎁 GIVEAWAY TIME! Win [PRIZE] worth [VALUE]!",
        structure: ["Prize Reveal", "Rules (Follow, Like, Tag)", "Deadline", "Winner Announcement"],
        platforms: ["Instagram", "Facebook", "TikTok"],
        brandVoice: "exciting",
        hashtags: ["#Giveaway", "#Contest", "#Win", "#Free"]
    },
    {
        id: "announcement",
        name: "Big Announcement",
        description: "Share important news or updates",
        category: "announcement",
        icon: Megaphone,
        hook: "📢 BIG NEWS: [ANNOUNCEMENT]",
        structure: ["Teaser", "Announcement", "Details", "What This Means", "CTA"],
        platforms: ["Instagram", "Facebook", "LinkedIn"],
        brandVoice: "professional",
        hashtags: ["#Announcement", "#News", "#Update"]
    },
    {
        id: "community-spotlight",
        name: "Community Spotlight",
        description: "Feature customers or community members",
        category: "community",
        icon: Users,
        hook: "✨ Shoutout to @[USERNAME] for this amazing [CONTENT]!",
        structure: ["Feature/Compliment", "Their Story", "Why It Matters", "Community CTA"],
        platforms: ["Instagram", "Facebook", "TikTok"],
        brandVoice: "friendly",
        hashtags: ["#Community", "#Spotlight", "#CustomerLove"]
    },
    {
        id: "behind-the-scenes",
        name: "Behind The Scenes",
        description: "Show the human side of your brand",
        category: "community",
        icon: Users,
        hook: "Ever wondered what goes on behind the scenes? 👀",
        structure: ["Teaser", "The Process", "Fun Facts", "Personal Touch", "Engage CTA"],
        platforms: ["Instagram", "TikTok", "YouTube"],
        brandVoice: "casual",
        hashtags: ["#BTS", "#BehindTheScenes", "#DayInTheLife"]
    },
    {
        id: "flash-sale",
        name: "Flash Sale",
        description: "Create urgency with limited-time offers",
        category: "product",
        icon: Rocket,
        hook: "⚡ FLASH SALE - [DISCOUNT]% OFF for the next [TIME] hours only!",
        structure: ["Urgency Hook", "Discount Details", "Products Featured", "Deadline", "Shop Now CTA"],
        platforms: ["Instagram", "Facebook", "WhatsApp"],
        brandVoice: "exciting",
        hashtags: ["#FlashSale", "#Sale", "#LimitedTime", "#Discount"]
    },
    {
        id: "tips-and-tricks",
        name: "Tips & Tricks",
        description: "Share valuable how-to content",
        category: "engagement",
        icon: MessageSquare,
        hook: "3 [TOPIC] tips that changed everything for me 💡",
        structure: ["Hook", "Tip 1", "Tip 2", "Tip 3", "Save for Later CTA"],
        platforms: ["Instagram", "TikTok", "LinkedIn"],
        brandVoice: "friendly",
        hashtags: ["#Tips", "#Tricks", "#HowTo", "#Learn"]
    }
];

export const TEMPLATE_CATEGORIES = [
    { id: "all", name: "All Templates" },
    { id: "product", name: "Product & Sales" },
    { id: "engagement", name: "Engagement" },
    { id: "announcement", name: "Announcements" },
    { id: "giveaway", name: "Giveaways" },
    { id: "community", name: "Community" },
] as const;
