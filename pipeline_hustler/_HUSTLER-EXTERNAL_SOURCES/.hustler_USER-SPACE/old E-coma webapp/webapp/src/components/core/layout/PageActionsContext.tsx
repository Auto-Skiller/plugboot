"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

import { AISuggestion } from "@/types/ai-tips";

interface PageAction {
    id: string;
    label: string;
    icon?: ReactNode;
    variant?: "default" | "outline" | "ghost";
    onClick: () => void;
}

interface PageActionsContextType {
    actions: PageAction[];
    setActions: (actions: PageAction[]) => void;
    clearActions: () => void;
    suggestions: AISuggestion[];
    setSuggestions: (suggestions: AISuggestion[]) => void;
}

const PageActionsContext = createContext<PageActionsContextType | null>(null);

export function PageActionsProvider({ children }: { children: ReactNode }) {
    const [actions, setActionsState] = useState<PageAction[]>([]);
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

    const setActions = useCallback((newActions: PageAction[]) => {
        setActionsState(newActions);
    }, []);

    const clearActions = useCallback(() => {
        setActionsState([]);
        setSuggestions([]); // Optionally clear suggestions too? Maybe generic clear
    }, []);

    return (
        <PageActionsContext.Provider value={{ actions, setActions, clearActions, suggestions, setSuggestions }}>
            {children}
        </PageActionsContext.Provider>
    );
}

export function usePageActions() {
    const context = useContext(PageActionsContext);
    if (!context) {
        throw new Error("usePageActions must be used within a PageActionsProvider");
    }
    return context;
}

// Hook to register page actions - use in page components
export function useRegisterPageActions(actions: PageAction[], deps: React.DependencyList = []) {
    const { setActions, clearActions } = usePageActions();
    // This hook usage pattern is simplified here, real usage might need useEffect
    return { setActions, clearActions };
}

export function useAISuggestions() {
    const { suggestions, setSuggestions } = usePageActions();
    return { suggestions, setSuggestions };
}
