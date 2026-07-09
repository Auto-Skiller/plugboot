/**
 * Zone 1: Operations Layout
 * Wraps all /operations/* routes with ZoneSidebar
 */

import { ReactNode } from "react";
import { ZoneLayoutWrapper } from "@/components/core/layout/ZoneLayoutWrapper";

export default function OperationsLayout({ children }: { children: ReactNode }) {
    return (
        <ZoneLayoutWrapper>
            {children}
        </ZoneLayoutWrapper>
    );
}

export const metadata = {
    title: {
        template: "%s | Operations | E-Coma",
        default: "Operations | E-Coma"
    },
    description: "Zone 1: Operations - Confirmation, Logistics, and Recovery"
};
