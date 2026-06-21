import { Percent, Package, Gift, Zap, Tag } from "lucide-react";

export interface Offer {
    id: string;
    name: string;
    type: "discount" | "bundle" | "bogo" | "flash";
    discount: number;
    products: string[];
    startDate: string;
    endDate: string;
    isActive: boolean;
    usageCount: number;
    revenue: number;
}

export const MOCK_OFFERS: Offer[] = [
    {
        id: "1",
        name: "Summer Sale 20%",
        type: "discount",
        discount: 20,
        products: ["Wireless Earbuds Pro", "Smart Watch Series 5"],
        startDate: "2025-12-01",
        endDate: "2025-12-31",
        isActive: true,
        usageCount: 145,
        revenue: 1250000,
    },
    {
        id: "2",
        name: "Bundle Tech Starter",
        type: "bundle",
        discount: 15,
        products: ["Wireless Earbuds Pro", "Laptop Stand Aluminum", "USB-C Hub 7-in-1"],
        startDate: "2025-11-15",
        endDate: "2025-12-15",
        isActive: true,
        usageCount: 67,
        revenue: 890000,
    },
    {
        id: "3",
        name: "Buy 1 Get 1 Free",
        type: "bogo",
        discount: 50,
        products: ["USB-C Hub 7-in-1"],
        startDate: "2025-12-05",
        endDate: "2025-12-10",
        isActive: false,
        usageCount: 23,
        revenue: 149500,
    },
    {
        id: "4",
        name: "Flash Sale Keyboard",
        type: "flash",
        discount: 30,
        products: ["Mechanical Keyboard"],
        startDate: "2025-12-06",
        endDate: "2025-12-06",
        isActive: true,
        usageCount: 12,
        revenue: 151200,
    },
];

export function getOfferTypeIcon(type: string) {
    switch (type) {
        case "discount": return Percent;
        case "bundle": return Package;
        case "bogo": return Gift;
        case "flash": return Zap;
        default: return Tag;
    }
}

export function getOfferTypeColor(type: string) {
    switch (type) {
        case "discount": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
        case "bundle": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        case "bogo": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
        case "flash": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
        default: return "bg-gray-100 text-gray-700";
    }
}

export function getOfferTypeLabel(type: string) {
    switch (type) {
        case "discount": return "Réduction";
        case "bundle": return "Bundle";
        case "bogo": return "1 Acheté = 1 Offert";
        case "flash": return "Vente Flash";
        default: return type;
    }
}
