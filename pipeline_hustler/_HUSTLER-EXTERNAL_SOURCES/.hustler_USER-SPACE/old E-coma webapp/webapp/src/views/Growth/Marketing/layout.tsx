import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Marketing & ADs - E-coma",
    description: "Multi-Platform Advertising - Instagram, Facebook & TikTok",
};

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 space-y-4 p-8 pt-6">
                {children}
            </div>
        </div>
    );
}
