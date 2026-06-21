import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Ads Center - E-coma",
    description: "Manage campaigns, accounts, and track performance",
};

export default function AdsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
