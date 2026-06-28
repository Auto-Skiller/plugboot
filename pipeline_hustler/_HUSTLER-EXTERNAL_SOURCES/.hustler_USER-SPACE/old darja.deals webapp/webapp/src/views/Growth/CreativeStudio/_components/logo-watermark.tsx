"use client";

import { cn } from "@/lib/utils";

interface LogoWatermarkProps {
    className?: string;
}

/**
 * 3D Logo Watermark - Subtle background branding element
 * Creates a large, semi-transparent "R" logo with 3D effect
 */
export function LogoWatermark({ className }: LogoWatermarkProps) {
    return (
        <div
            className={cn(
                "fixed pointer-events-none select-none z-0",
                "right-10 bottom-20",
                className
            )}
            aria-hidden="true"
        >
            {/* 3D Shadow Layer */}
            <div
                className="absolute text-[20rem] font-black opacity-[0.02] text-foreground"
                style={{
                    transform: "translate(8px, 8px) rotateX(10deg) rotateY(-10deg)",
                    transformStyle: "preserve-3d",
                }}
            >
                R
            </div>

            {/* Main Logo */}
            <div
                className="text-[20rem] font-black bg-gradient-to-br from-primary/5 via-secondary/3 to-transparent bg-clip-text text-transparent"
                style={{
                    transform: "rotateX(10deg) rotateY(-10deg)",
                    transformStyle: "preserve-3d",
                    textShadow: "0 0 80px hsl(var(--primary) / 0.05)",
                }}
            >
                R
            </div>

            {/* Glow Effect */}
            <div
                className="absolute inset-0 text-[20rem] font-black opacity-[0.03] blur-3xl text-primary"
                style={{
                    transform: "rotateX(10deg) rotateY(-10deg) scale(1.1)",
                }}
            >
                R
            </div>
        </div>
    );
}
