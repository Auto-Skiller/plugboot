"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useScroll } from "./ScrollContext";

interface WindowLayoutContextType {
    // Visibility States
    isRightPanelOpen: boolean;
    isDetailPanelOpen: boolean;
    isBottomPanelOpen: boolean;

    // Setters
    setRightPanelOpen: (isOpen: boolean) => void;
    setDetailPanelOpen: (isOpen: boolean) => void;
    setBottomPanelOpen: (isOpen: boolean) => void;
    toggleRightPanel: () => void;

    // Computed Layout Styles
    // Returns CSSProperties or simple objects for positioning
    detailPanelStyle: { right: string; transition: string };
    bottomPanelStyle: { right: string; transition: string };
    rightPanelStyle: { top: string; bottom: string; transition: string };
    // Top Nav State
    isTopNavCollapsed: boolean;
    toggleTopNav: () => void;

    // Ecosystem Bar State
    isEcosystemBarCollapsed: boolean;
    toggleEcosystemBar: () => void;

    // Sticky Actions
    stickyActions: ReactNode;
    setStickyActions: (actions: ReactNode) => void;
}

const WindowLayoutContext = createContext<WindowLayoutContextType | null>(null);

const STORAGE_KEY_RIGHT = "riglify-right-panel-visible";
const STORAGE_KEY_TOP_NAV = "riglify-top-nav-collapsed";
const STORAGE_KEY_ECOSYSTEM_BAR = "riglify-ecosystem-bar-collapsed";

// Constants for Layout
const RIGHT_PANEL_WIDTH = 320;
const RIGHT_PANEL_GAP = 24;
const RIGHT_PANEL_TOTAL_OFFSET = RIGHT_PANEL_WIDTH + RIGHT_PANEL_GAP + 12; // 356px

export function WindowLayoutProvider({ children }: { children: ReactNode }) {
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
    const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
    const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(false);
    const [isTopNavCollapsed, setIsTopNavCollapsed] = useState(false);
    const [isEcosystemBarCollapsed, setIsEcosystemBarCollapsed] = useState(false);
    const [stickyActions, setStickyActions] = useState<ReactNode>(null);
    const { isScrolled } = useScroll();

    // Load preferences
    useEffect(() => {
        const storedRight = localStorage.getItem(STORAGE_KEY_RIGHT);
        if (storedRight !== null) setIsRightPanelOpen(storedRight === "true");

        const storedTopNav = localStorage.getItem(STORAGE_KEY_TOP_NAV);
        if (storedTopNav !== null) setIsTopNavCollapsed(storedTopNav === "true");

        const storedEcosystemBar = localStorage.getItem(STORAGE_KEY_ECOSYSTEM_BAR);
        if (storedEcosystemBar !== null) setIsEcosystemBarCollapsed(storedEcosystemBar === "true");
    }, []);

    const handleSetRightPanelOpen = (isOpen: boolean) => {
        setIsRightPanelOpen(isOpen);
        localStorage.setItem(STORAGE_KEY_RIGHT, String(isOpen));
    };

    const toggleRightPanel = () => handleSetRightPanelOpen(!isRightPanelOpen);

    const toggleTopNav = () => {
        setIsTopNavCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem(STORAGE_KEY_TOP_NAV, String(newState));
            return newState;
        });
    };

    const toggleEcosystemBar = () => {
        setIsEcosystemBarCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem(STORAGE_KEY_ECOSYSTEM_BAR, String(newState));
            return newState;
        });
    };

    // --- Computed Layout Logic ---

    // 1. Detail Panel Style
    // If Right Panel is OPEN, Detail Panel must shrink (right margin).
    // If Right Panel is CLOSED, we need enough margin to avoid covering the "Show Panel" button (approx 80px).
    const detailPanelStyle = useMemo(() => ({
        right: isRightPanelOpen ? `${RIGHT_PANEL_TOTAL_OFFSET}px` : "80px",
        transition: "right 300ms cubic-bezier(0.4, 0, 0.2, 1)"
    }), [isRightPanelOpen]);


    // 2. Bottom Panel Style
    // If Right Panel is OPEN, Bottom Panel must shrink.
    const bottomPanelStyle = useMemo(() => ({
        right: isRightPanelOpen ? `${RIGHT_PANEL_TOTAL_OFFSET}px` : "0px",
        transition: "right 300ms cubic-bezier(0.4, 0, 0.2, 1)"
    }), [isRightPanelOpen]);


    // 3. Right Panel Style
    // Updated Logic: Since Bottom Panel now shrinks horizontally (right offset) when Right Panel is open,
    // the Right Panel can stay full height (bottom: 20px) without overlapping.
    // Top adjusts based on scroll state (140px -> 84px) basically standard vs compact header
    const rightPanelStyle = useMemo(() => ({
        top: isScrolled ? "84px" : "140px",
        bottom: "20px", // Always extend to bottom, side-by-side with BottomPanel
        transition: "bottom 300ms cubic-bezier(0.4, 0, 0.2, 1), top 300ms ease"
    }), [isScrolled]);

    return (
        <WindowLayoutContext.Provider value={{
            isRightPanelOpen,
            isDetailPanelOpen,
            isBottomPanelOpen,
            setRightPanelOpen: handleSetRightPanelOpen,
            setDetailPanelOpen: setIsDetailPanelOpen,
            setBottomPanelOpen: setIsBottomPanelOpen,
            toggleRightPanel,
            isTopNavCollapsed,
            toggleTopNav,
            isEcosystemBarCollapsed,
            toggleEcosystemBar,
            detailPanelStyle,
            bottomPanelStyle,
            rightPanelStyle,
            stickyActions,
            setStickyActions
        }}>
            {children}
        </WindowLayoutContext.Provider>
    );
}

export function useWindowLayout() {
    const context = useContext(WindowLayoutContext);
    if (!context) {
        throw new Error("useWindowLayout must be used within a WindowLayoutProvider");
    }
    return context;
}
