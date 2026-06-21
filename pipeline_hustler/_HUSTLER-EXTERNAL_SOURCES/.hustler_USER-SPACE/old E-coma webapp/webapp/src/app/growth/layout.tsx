/**
 * Zone 2: Growth Layout
 * Wraps all /growth/* routes with ZoneSidebar
 */

import { ReactNode } from "react";
import { ZoneLayoutWrapper } from "@/components/core/layout/ZoneLayoutWrapper";

export default function GrowthLayout({ children }: { children: ReactNode }) {
    return (
        <ZoneLayoutWrapper>
            {children}
        </ZoneLayoutWrapper>
    );
}

export const metadata = {
    title: {
        template: "%s | Growth | E-Coma",
        default: "Growth | E-Coma"
    },
    description: "Zone 2: Growth - Ads Manager and Creative Studio"
};
