import { wilayas } from "@/lib/chart-utils";

export interface WilayaOrderData {
    code: string;
    orders: number;
    revenue: number;
    confirmed: number;
    delivered: number;
    returned: number;
    cancelled: number;
    shippingCost: number;
    avgDeliveryDays: number;
    status: 'enabled' | 'disabled';
}

export function generateWilayaOrderData(): WilayaOrderData[] {
    // Major cities + regional hubs tend to have more volume
    const topWilayas = ["16", "31", "25", "19", "09", "06", "15", "23", "05", "35", "30", "13", "14", "22", "28", "17"];

    return wilayas.map(wilaya => {
        const isTop = topWilayas.includes(wilaya.code);

        // Base Volume
        const baseOrders = isTop
            ? Math.floor(Math.random() * 400) + 200
            : Math.floor(Math.random() * 100) + 20;

        // Rates (Randomized slightly per wilaya)
        const confirmationRate = 0.7 + Math.random() * 0.25; // 70-95%
        const cancellationRate = 1 - confirmationRate;       // The rest are cancelled

        const deliverySuccessRate = 0.8 + Math.random() * 0.15; // Of confirmed, 80-95% delivered
        const returnRate = 1 - deliverySuccessRate;             // The rest returned

        // Calculated Absolute Numbers
        const confirmed = Math.floor(baseOrders * confirmationRate);
        const cancelled = baseOrders - confirmed;

        const delivered = Math.floor(confirmed * deliverySuccessRate);
        const returned = confirmed - delivered;

        // Financials
        const aov = 2500 + Math.random() * 2000; // Average Order Value: 2500-4500 DZD
        const revenue = delivered * aov;
        const shippingCost = baseOrders * (400 + Math.random() * 100); // Avg 450 shipping

        return {
            code: wilaya.code,
            orders: baseOrders,
            revenue,
            confirmed,
            delivered,
            returned,
            cancelled,
            shippingCost,
            avgDeliveryDays: 1.5 + Math.random() * 3, // 1.5 - 4.5 days
            status: Math.random() > 0.1 ? 'enabled' : 'disabled', // 90% enabled
        };
    });
}
