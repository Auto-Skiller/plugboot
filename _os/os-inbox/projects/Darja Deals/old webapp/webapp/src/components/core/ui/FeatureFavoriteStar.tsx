"use client";

import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toggleFeatureFavorite, isFeatureFavorited } from "@/config/feature-favorites-config";

interface FeatureFavoriteStarProps {
    featureId: string;
    className?: string;
    size?: "sm" | "md" | "lg";
    showTooltip?: boolean;
}

const SIZES = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
};

export function FeatureFavoriteStar({
    featureId,
    className,
    size = "md",
    showTooltip = true,
}: FeatureFavoriteStarProps) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Load favorite state on mount
    useEffect(() => {
        setIsFavorited(isFeatureFavorited(featureId));
    }, [featureId]);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Trigger animation
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);

        // Toggle favorite
        const newState = toggleFeatureFavorite(featureId);
        setIsFavorited(newState);

        // Dispatch custom event for dashboard to listen
        window.dispatchEvent(new CustomEvent("feature-favorite-changed", {
            detail: { featureId, isFavorited: newState }
        }));
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                "relative group transition-all duration-200",
                "hover:scale-110 active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-yellow-500/50 rounded",
                className
            )}
            title={showTooltip ? (isFavorited ? "Remove from favorites" : "Add to favorites") : undefined}
        >
            <Star
                className={cn(
                    SIZES[size],
                    "transition-all duration-200",
                    isAnimating && "animate-pulse scale-125",
                    isFavorited
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                        : "text-white/40 hover:text-yellow-400/70"
                )}
            />

            {/* Glow effect on hover when not favorited */}
            {!isFavorited && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Star className={cn(SIZES[size], "text-yellow-400/30 blur-sm")} />
                </div>
            )}
        </button>
    );
}

export default FeatureFavoriteStar;
