"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface UserProfile {
    name: string;
    email: string;
    avatar?: string;
    role: "admin" | "team";
    businessName?: string;
    industry?: string;
    plan?: string;
}

interface AuthContextType {
    user: UserProfile | null;
    isLoading: boolean;
    login: (profile: UserProfile) => void;
    logout: () => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Hydrate from localStorage on mount
        const storedUser = localStorage.getItem("ecoma-user-profile");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user profile", e);
                localStorage.removeItem("ecoma-user-profile");
            }
        }
        setIsLoading(false);
    }, []);

    const login = (profile: UserProfile) => {
        setUser(profile);
        localStorage.setItem("ecoma-user-profile", JSON.stringify(profile));
        // Also set the legacy cookies/storage for compatibility with existing code if needed
        document.cookie = "mock-session=true; path=/";
        localStorage.setItem("system-mode", profile.role === "admin" ? "ADMIN" : "TEAM");

        toast.success(`Welcome back, ${profile.name}!`);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("ecoma-user-profile");
        document.cookie = "mock-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        localStorage.removeItem("system-mode");
        router.push("/auth/login");
        toast.info("Signed out successfully");
    };

    const updateProfile = (updates: Partial<UserProfile>) => {
        setUser((prev) => {
            if (!prev) return null;
            const newUser = { ...prev, ...updates };
            localStorage.setItem("ecoma-user-profile", JSON.stringify(newUser));
            return newUser;
        });
        toast.success("Profile updated successfully");
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            logout,
            updateProfile,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
