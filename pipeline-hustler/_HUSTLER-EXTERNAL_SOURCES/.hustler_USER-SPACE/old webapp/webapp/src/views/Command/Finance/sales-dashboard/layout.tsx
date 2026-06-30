import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sales Dashboard - E-coma",
    description: "Boost sales & kill returns with AI-driven insights",
};

export default function SalesDashboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
