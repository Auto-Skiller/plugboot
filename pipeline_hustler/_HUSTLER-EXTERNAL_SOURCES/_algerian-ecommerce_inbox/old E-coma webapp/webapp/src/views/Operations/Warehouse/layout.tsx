import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Stock Management - E-coma",
    description: "Inventory, carriers, sourcing & tools",
};

export default function StockLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
