"use client";

/**
 * ZoneLayoutWrapper - Layout wrapper for Zone pages
 * Includes the ZoneSidebar for Operations, Growth, and Command routes
 */

import { ReactNode } from "react";
import { ZoneSidebar } from "@/components/core/layout/ZoneSidebar";

interface ZoneLayoutWrapperProps {
    children: ReactNode;
}

export function ZoneLayoutWrapper({ children }: ZoneLayoutWrapperProps) {
    return (
        <div className="flex min-h-screen">
            {/* Zone Sidebar */}
            <ZoneSidebar />

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    );
}
