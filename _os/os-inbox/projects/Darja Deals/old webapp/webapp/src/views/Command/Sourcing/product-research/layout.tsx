import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Product Research - E-coma",
    description: "Find winning products and track competitors",
};

export default function ProductResearchLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
