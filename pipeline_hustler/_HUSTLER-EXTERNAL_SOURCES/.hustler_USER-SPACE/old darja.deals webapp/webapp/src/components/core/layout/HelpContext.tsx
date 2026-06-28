"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface HelpData {
    title: string;
    description: string;
    content?: ReactNode; // For richer content
}

interface HelpContextType {
    isHelpModeEnabled: boolean;
    activeHelp: HelpData | null;
    toggleHelpMode: () => void;
    setHelpMode: (enabled: boolean) => void;
    setHelpData: (data: HelpData | null) => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export function HelpProvider({ children }: { children: ReactNode }) {
    const [isHelpModeEnabled, setIsHelpMode] = useState(false);
    const [activeHelp, setActiveHelp] = useState<HelpData | null>(null);

    const toggleHelpMode = useCallback(() => {
        setIsHelpMode(prev => {
            if (prev) {
                // If turning off, clear active help
                setActiveHelp(null);
            }
            return !prev;
        });
    }, []);

    return (
        <HelpContext.Provider
            value={{
                isHelpModeEnabled,
                activeHelp,
                toggleHelpMode,
                setHelpMode: setIsHelpMode,
                setHelpData: setActiveHelp,
            }}
        >
            {children}
        </HelpContext.Provider>
    );
}

export function useHelp() {
    const context = useContext(HelpContext);
    if (context === undefined) {
        throw new Error("useHelp must be used within a HelpProvider");
    }
    return context;
}
