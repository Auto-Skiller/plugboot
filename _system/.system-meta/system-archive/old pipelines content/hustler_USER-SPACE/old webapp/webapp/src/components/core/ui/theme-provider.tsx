"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/core/ui/button";

// ============================================================================
// THEME PROVIDER
// ============================================================================

export type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
    const context = React.useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "riglify-theme",
}: ThemeProviderProps) {
    const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
    const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");
    const [mounted, setMounted] = React.useState(false);

    // Get system preference
    const getSystemTheme = React.useCallback((): "light" | "dark" => {
        if (typeof window === "undefined") return "light";
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }, []);

    // Update resolved theme with smooth transition
    const updateResolvedTheme = React.useCallback((newTheme: Theme) => {
        const resolved = newTheme === "system" ? getSystemTheme() : newTheme;
        setResolvedTheme(resolved);

        // Update document class with smooth transition
        if (typeof document !== "undefined") {
            const root = document.documentElement;

            // Add transition class for smooth theme switching
            root.classList.add("theme-transitioning");

            // Update theme classes
            root.classList.remove("light", "dark");
            root.classList.add(resolved);

            // Remove transition class after animation completes
            setTimeout(() => {
                root.classList.remove("theme-transitioning");
            }, 200);
        }
    }, [getSystemTheme]);

    // Initialize from localStorage
    React.useEffect(() => {
        const stored = localStorage.getItem(storageKey) as Theme | null;
        if (stored) {
            setThemeState(stored);
            updateResolvedTheme(stored);
        } else {
            updateResolvedTheme(defaultTheme);
        }
        setMounted(true);
    }, [storageKey, defaultTheme, updateResolvedTheme]);

    // Listen for system theme changes
    React.useEffect(() => {
        if (theme !== "system") return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => updateResolvedTheme("system");

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme, updateResolvedTheme]);

    const setTheme = React.useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(storageKey, newTheme);
        updateResolvedTheme(newTheme);
    }, [storageKey, updateResolvedTheme]);

    const toggleTheme = React.useCallback(() => {
        setTheme(resolvedTheme === "light" ? "dark" : "light");
    }, [resolvedTheme, setTheme]);

    // Prevent flash on initial load
    if (!mounted) {
        return (
            <script
                dangerouslySetInnerHTML={{
                    __html: `
            (function() {
              var stored = localStorage.getItem('${storageKey}');
              var theme = stored || '${defaultTheme}';
              if (theme === 'system') {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              document.documentElement.classList.add(theme);
            })();
          `,
                }}
            />
        );
    }

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// ============================================================================
// THEME TOGGLE BUTTON
// ============================================================================

interface ThemeToggleProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
    const { resolvedTheme, toggleTheme } = useTheme();

    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-9 w-9",
        lg: "h-10 w-10",
    };

    const iconSizes = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
                sizeClasses[size],
                "rounded-full transition-all hover:bg-muted",
                className
            )}
            aria-label="Toggle theme"
        >
            {resolvedTheme === "light" ? (
                <Moon className={cn(iconSizes[size], "transition-transform")} />
            ) : (
                <Sun className={cn(iconSizes[size], "transition-transform")} />
            )}
        </Button>
    );
}

// ============================================================================
// THEME DROPDOWN (for settings page)
// ============================================================================

interface ThemeDropdownProps {
    className?: string;
}

export function ThemeDropdown({ className }: ThemeDropdownProps) {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = React.useState(false);

    const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
        { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
        { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
        { value: "system", label: "System", icon: <span className="h-4 w-4 text-center">💻</span> },
    ];

    return (
        <div className={cn("relative", className)}>
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full justify-between"
            >
                <span className="flex items-center gap-2">
                    {options.find((o) => o.value === theme)?.icon}
                    {options.find((o) => o.value === theme)?.label}
                </span>
            </Button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 py-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    setTheme(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left",
                                    "hover:bg-muted transition-colors",
                                    theme === option.value && "bg-primary/10 text-primary"
                                )}
                            >
                                {option.icon}
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
