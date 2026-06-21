"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Sparkles, Search } from "lucide-react";

// Feature configuration based on provided assets
import { HUB_CATEGORIES, PageInfo } from "@/config/hub-config";
import { BannerModal } from "@/components/core/ui/modals/BannerModal";
import { CommandHubModal } from "@/components/core/ui/modals/CommandHubModal";

// Flatten all pages from categories for the grid view
const ALL_PAGES = HUB_CATEGORIES.flatMap(category =>
    category.pages.map(page => ({
        ...page,
        categoryId: category.id,
        categoryColor: category.textColor // Use category color theme if needed
    }))
);

export default function HubPage() {
    const [showPromo, setShowPromo] = useState(false);
    const [showCommandModal, setShowCommandModal] = useState(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setShowCommandModal((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);
    return (
        <div className="h-screen w-full bg-background text-foreground font-body p-6 md:p-10 transition-colors duration-300 overflow-y-auto scrollbar-thin">
            <div className="max-w-7xl mx-auto space-y-12 pb-20">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium border border-secondary/20">
                                <Sparkles className="w-4 h-4" />
                                <span>Control Center</span>
                            </div>
                            <button
                                onClick={() => setShowPromo(true)}
                                className="text-xs font-semibold text-primary hover:underline"
                            >
                                What's New?
                            </button>
                            <div className="h-4 w-px bg-border/50 mx-1" />
                            <button
                                onClick={() => setShowCommandModal(true)}
                                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border border-border/50 text-xs text-muted-foreground hover:bg-background/80 hover:border-primary/20 hover:text-primary transition-all group"
                            >
                                <Search className="w-3 h-3 group-hover:text-primary transition-colors" />
                                <span>Search...</span>
                                <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                    <span className="text-[10px]">⌘K</span>
                                </kbd>
                            </button>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-primary">
                            Welcome Back
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl font-light">
                            Manage your entire operation from one central hub. Access analytics, marketing, and inventory tools instantly.
                        </p>
                    </div>
                </header>

                <BannerModal
                    open={showPromo}
                    onOpenChange={setShowPromo}
                    title="Unlock Advanced Analytics"
                    description="Get deeper insights into your business with our new AI-powered analytics suite. Track customer behavior, forecast trends, and optimize your marketing budget."
                    ctaLabel="Start Free Trial"
                    secondaryCtaLabel="Learn More"
                    theme="colorful"
                />

                <CommandHubModal open={showCommandModal} onOpenChange={setShowCommandModal} />

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ALL_PAGES.map((page, idx) => (
                        <Link
                            key={page.href}
                            href={page.href}
                            className={cn(
                                "group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300",
                                "hover:shadow-lg hover:scale-[1.01] hover:border-primary/50",
                                page.name === "Business Analytics" && "md:col-span-2 lg:col-span-2", // Highlight Business Analytics
                                "animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards"
                            )}
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Image Container */}
                            <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
                                {page.image ? (
                                    <Image
                                        src={page.image}
                                        alt={page.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                                        <Sparkles className="w-12 h-12 text-muted-foreground/50" />
                                    </div>
                                )}
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <h3 className="text-2xl font-heading font-bold mb-1 drop-shadow-md">
                                        {page.name}
                                    </h3>
                                    {/* Key Features Display */}
                                    {page.features && page.features.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {page.features.slice(0, 5).map((feature, i) => (
                                                <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white/90 border border-white/10">
                                                    {typeof feature === 'string' ? feature : feature.name}
                                                </span>
                                            ))}
                                            {page.features.length > 5 && (
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                                                    +{page.features.length - 5}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                                <div className="space-y-3">
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {page.description}
                                    </p>

                                    {/* Problem → Solution Display */}
                                    {page.problemSolution && (
                                        <div className="space-y-2 pt-2 border-t border-border/50">
                                            <div className="flex items-start gap-2">
                                                <span className="text-red-500/80 text-xs font-bold shrink-0">⚡</span>
                                                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                                                    {page.problemSolution.problem}
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-green-500/80 text-xs font-bold shrink-0">✓</span>
                                                <p className="text-xs text-primary/80 leading-relaxed font-medium">
                                                    {page.problemSolution.solution}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    <span className={cn(
                                        "text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary/5 border border-secondary/10 uppercase tracking-wider",
                                        "text-foreground/70"
                                    )}>
                                        Launch App
                                    </span>
                                    <div className={cn(
                                        "p-2 rounded-full transition-all duration-300",
                                        "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                                    )}>
                                        <ArrowUpRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Footer / Additional Info */}
                <div className="pt-10 border-t border-border mt-10 text-center">
                    <p className="text-muted-foreground text-sm">
                        Need assistance? <Link href="/admin/help" className="text-primary font-medium hover:underline">Visit the Help Center</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
