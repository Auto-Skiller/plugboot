"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function FullscreenToggle({ className }: { className?: string }) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => {
                console.error("Fullscreen error:", e);
            });
        } else {
            document.exitFullscreen().catch(() => { });
        }
    };

    return (
        <button
            onClick={toggleFullscreen}
            className={cn("p-2 rounded-md text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50", className)}
            title={isFullscreen ? "Exit full screen" : "Enter full screen"}
        >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
    );
}
