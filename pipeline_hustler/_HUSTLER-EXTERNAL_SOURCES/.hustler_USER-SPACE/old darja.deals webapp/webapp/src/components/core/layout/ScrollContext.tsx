"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ScrollContextType {
    isScrolled: boolean;
    scrollY: number;
    threshold: number; // Expose effective threshold
}

const ScrollContext = createContext<ScrollContextType>({ isScrolled: false, scrollY: 0, threshold: 100 });

export function useScroll() {
    return useContext(ScrollContext);
}

interface ScrollProviderProps {
    children: ReactNode;
    threshold?: number;
    useResponsiveThreshold?: boolean; // NEW: Calculate threshold based on viewport
}

/**
 * ScrollProvider - Provides scroll state context with responsive threshold support
 * Phase 7 Enhancement: Responsive threshold adapts to viewport height
 */
export function ScrollProvider({
    children,
    threshold = 100,
    useResponsiveThreshold = true
}: ScrollProviderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [effectiveThreshold, setEffectiveThreshold] = useState(threshold);

    // Calculate responsive threshold based on viewport
    useEffect(() => {
        if (useResponsiveThreshold && typeof window !== 'undefined') {
            const calculateThreshold = () => {
                // 12% of viewport height, clamped between 80-150px
                const viewportBased = window.innerHeight * 0.12;
                const calculated = Math.max(80, Math.min(150, viewportBased));
                setEffectiveThreshold(calculated);
            };
            calculateThreshold();
            window.addEventListener('resize', calculateThreshold, { passive: true });
            return () => window.removeEventListener('resize', calculateThreshold);
        }
    }, [useResponsiveThreshold]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrollY(currentScrollY);
            setIsScrolled(currentScrollY > effectiveThreshold);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [effectiveThreshold]);

    return (
        <ScrollContext.Provider value={{ isScrolled, scrollY, threshold: effectiveThreshold }}>
            {children}
        </ScrollContext.Provider>
    );
}
