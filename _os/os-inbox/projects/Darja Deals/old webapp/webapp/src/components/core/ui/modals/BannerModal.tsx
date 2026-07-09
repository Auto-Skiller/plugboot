"use client";

import React from "react";
import Image from "next/image";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/core/ui/dialog";
import { Button } from "@/components/core/ui/button";
import { cn } from "@/lib/utils";

interface BannerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    imageSrc?: string;
    ctaLabel?: string;
    onCtaClick?: () => void;
    secondaryCtaLabel?: string;
    onSecondaryCtaClick?: () => void;
    theme?: "dark" | "light" | "colorful";
}

export function BannerModal({
    open,
    onOpenChange,
    title,
    description,
    imageSrc,
    ctaLabel = "Get Started",
    onCtaClick,
    secondaryCtaLabel,
    onSecondaryCtaClick,
    theme = "colorful"
}: BannerModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 overflow-hidden max-w-4xl border-0 shadow-2xl sm:rounded-2xl">
                <div className="relative flex flex-col md:flex-row h-full md:h-[500px]">

                    {/* Visual Side */}
                    <div className={cn(
                        "relative w-full md:w-1/2 h-64 md:h-full overflow-hidden",
                        theme === "colorful" ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" :
                            theme === "dark" ? "bg-zinc-900" : "bg-zinc-100"
                    )}>
                        {imageSrc ? (
                            <Image
                                src={imageSrc}
                                alt={title}
                                fill
                                className="object-cover mix-blend-overlay opacity-90"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-32 h-32 text-white/20 animate-pulse" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/10" />

                        {/* Decorative Circles */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
                        <div className="absolute bottom-10 right-10 w-60 h-60 bg-yellow-500/20 rounded-full blur-3xl" />
                    </div>

                    {/* Content Side */}
                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-background relative">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-50"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>

                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase w-fit">
                                <Sparkles className="w-3 h-3" />
                                <span>New Feature</span>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                    {title}
                                </h2>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    {description}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <Button size="lg" onClick={onCtaClick} className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                                    {ctaLabel} <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                                {secondaryCtaLabel && (
                                    <Button variant="outline" size="lg" onClick={onSecondaryCtaClick} className="rounded-full">
                                        {secondaryCtaLabel}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
