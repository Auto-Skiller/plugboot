
import { LucideIcon, Rocket, MessageSquare, Video, Languages, Shield, Sparkles } from "lucide-react";

export interface TourStep {
    targetId: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right" | "center";
}

export const TOUR_CONFIG: Record<string, TourStep[]> = {
    // Creatives Page Tour
    "/creatives": [
        {
            targetId: "dashboard",
            title: "Welcome to Creatives! 👋",
            content: "This is your content creation hub. Let's take a quick tour.",
            placement: "center"
        },
        {
            targetId: "wizard-trigger",
            title: "Start Creating ✨",
            content: "Use the wizard to generate high-converting scripts and visuals in seconds.",
            placement: "bottom"
        },
        {
            targetId: "hook-generator",
            title: "Viral Hooks 🎣",
            content: "Generate attention-grabbing hooks tailored for Algerian audiences.",
            placement: "bottom"
        },
        {
            targetId: "media-editor",
            title: "AI Editor 🎬",
            content: "Edit videos, add captions, and enhance quality automatically.",
            placement: "bottom"
        },
        {
            targetId: "darja",
            title: "Darja Mode 🇩🇿",
            content: "Translate and optimize content for local Algerian dialects.",
            placement: "top"
        }
    ],

    // Placeholders for other pages
    "/analytics": [
        {
            targetId: "dashboard",
            title: "Analytics Overview",
            content: "Track your business performance here.",
            placement: "center"
        }
    ],
    "/sales-dashboard": [
        {
            targetId: "dashboard",
            title: "Sales Dashboard",
            content: "Manage your orders and sales performance.",
            placement: "center"
        }
    ],
    "/stock": [
        {
            targetId: "dashboard",
            title: "Inventory Management",
            content: "Track stock levels and manage products.",
            placement: "center"
        }
    ],
    "/ads": [
        {
            targetId: "dashboard",
            title: "Ads Manager",
            content: "Create and monitor your ad campaigns.",
            placement: "center"
        }
    ],
    "/marketing": [
        {
            targetId: "dashboard",
            title: "Marketing Hub",
            content: "Manage affiliate programs and marketing strategies.",
            placement: "center"
        }
    ],
    "/product-research": [
        {
            targetId: "dashboard",
            title: "Product Research",
            content: "Find winning products and analyze competitors.",
            placement: "center"
        }
    ]
};
