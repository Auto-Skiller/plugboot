"use client";

import { useState } from "react";
import { FeatureCollapsible } from "@/components/core/ui/feature-collapsible";
import { Button } from "@/components/core/ui/button";
import { Card, CardContent } from "@/components/core/ui/card";
import { ArrowRight, BarChart3, Box, LineChart, Megaphone, Palette, Search, ShoppingBag, Truck, CreditCard, LayoutGrid, Sparkles } from "lucide-react";
import Link from "next/link";

// Modals
import { QuickViewModal } from "@/components/core/ui/modals/QuickViewModal";
import { VisualBoardModal, BoardColumn } from "@/components/core/ui/modals/VisualBoardModal";
import { WizardModal } from "@/components/core/ui/modals/WizardModal";
import { PipelineModal, PipelineStage } from "@/components/core/ui/modals/PipelineModal";
import { SplitViewModal } from "@/components/core/ui/modals/SplitViewModal";
import { GridMenuModal, GridItem } from "@/components/core/ui/modals/GridMenuModal";

export default function FeaturesDemoPage() {
    // Modal States
    const [salesOpen, setSalesOpen] = useState(false);
    const [stockOpen, setStockOpen] = useState(false);
    const [creativesOpen, setCreativesOpen] = useState(false);
    const [adsOpen, setAdsOpen] = useState(false);
    const [analyticsOpen, setAnalyticsOpen] = useState(false); // Using ExportBuilder or just placeholder? Let's use GridMenu for "Reports"
    const [marketingOpen, setMarketingOpen] = useState(false);
    const [researchOpen, setResearchOpen] = useState(false);

    // Dummy Data
    const creativeBoardData: BoardColumn[] = [
        {
            id: "drafts",
            title: "Drafts",
            color: "bg-zinc-500",
            items: [
                { id: "1", title: "Summer Campaign Banner", subtitle: "Version 1", tags: ["Design", "Summer"] },
                { id: "2", title: "Instagram Story Frame", subtitle: "For flash sale", tags: ["Social"] }
            ]
        },
        {
            id: "review",
            title: "In Review",
            color: "bg-yellow-500",
            items: [
                { id: "3", title: "Product Showcase Video", subtitle: "Waiting for approval", status: "warning" }
            ]
        },
        {
            id: "done",
            title: "Approved",
            color: "bg-green-500",
            items: [
                { id: "4", title: "Logo Refresh", subtitle: "Final vector files", status: "success" }
            ]
        }
    ];

    const pipelineData: PipelineStage[] = [
        {
            id: "1",
            title: "Discovery",
            status: "completed",
            items: [
                <div key="1">
                    <p className="font-semibold">Initial Contact</p>
                    <p className="text-xs text-muted-foreground">Email sent via automated bot</p>
                </div>
            ]
        },
        {
            id: "2",
            title: "Negotiation",
            status: "current",
            items: [
                <div key="2">
                    <p className="font-semibold">Rate Card Proposed</p>
                    <p className="text-xs text-muted-foreground">Waiting for response</p>
                </div>
            ]
        },
        {
            id: "3",
            title: "Contract",
            status: "pending",
            meta: "Est. 2 days"
        }
    ];

    const reportsData: GridItem[] = [
        { id: "1", name: "Sales Report", icon: <BarChart3 className="w-6 h-6" />, href: "#", category: "Financial" },
        { id: "2", name: "Traffic Analysis", icon: <LineChart className="w-6 h-6" />, href: "#", category: "Web" },
        { id: "3", name: "Customer Insights", icon: <Search className="w-6 h-6" />, href: "#", category: "People" },
    ];

    const wizardSteps = [
        {
            id: "step1",
            title: "Select Category",
            description: "What type of product are you looking for?",
            component: (
                <div className="grid grid-cols-2 gap-4">
                    {["Electronics", "Fashion", "Home", "Beauty"].map(cat => (
                        <div key={cat} className="p-4 border rounded-lg hover:bg-accent cursor-pointer flex items-center justify-center font-medium">
                            {cat}
                        </div>
                    ))}
                </div>
            )
        },
        {
            id: "step2",
            title: "Filters",
            description: "Set your criteria",
            component: (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Price Range</label>
                        <div className="h-2 bg-secondary rounded-full w-full" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Minimum Profit Margin</label>
                        <div className="h-2 bg-secondary rounded-full w-3/4" />
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="container mx-auto max-w-4xl py-12 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Feature Stack Demo</h1>
                <p className="text-xl text-muted-foreground">
                    Demonstrating the new SVG assets with the FeatureCollapsible component.
                </p>
            </div>

            <div className="space-y-4">
                {/* Operations: Confirmation */}
                <FeatureCollapsible
                    feature="confirmation"
                    title="Confirmation Center"
                    description="Order processing, risk scoring, and confirmation workflows"
                    defaultOpen={true}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-primary" />
                                Key Metrics
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                45 Pending orders. Risk Score: Low.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                            <Button variant="outline" onClick={() => setSalesOpen(true)}>
                                Quick View
                            </Button>
                            <Button asChild>
                                <Link href="/operations/confirmation">Go to Confirmation <ArrowRight className="ml-2 w-4 h-4" /></Link>
                            </Button>
                        </div>
                    </div>
                </FeatureCollapsible>

                {/* Operations: Warehouse */}
                {/* Operations: Warehouse */}
                <FeatureCollapsible
                    feature="warehouse"
                    title="Entrepôt (Warehouse)"
                    description="Track stock levels and multi-site inventory"
                >
                    <div className="p-4 bg-background/80 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Box className="w-8 h-8 text-[hsl(var(--accent-green))]" />
                                <div>
                                    <p className="font-medium">Main Warehouse</p>
                                    <p className="text-xs text-muted-foreground">4,230 items in stock</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setStockOpen(true)}>
                                    Compare Locations
                                </Button>
                                <Button variant="secondary" size="sm" asChild>
                                    <Link href="/operations/warehouse">Manage Warehouse</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </FeatureCollapsible>

                {/* Operations: Logistics & Recovery */}
                {/* Operations: Logistics & Recovery */}
                <FeatureCollapsible
                    feature="logistics-recovery"
                    title="Logistique & Retour (Logistics & Recovery)"
                    description="Shipment tracking and returns management (Rotour)"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Pending Returns: <strong>12</strong></span>
                        <Button size="sm" asChild>
                            <Link href="/operations/logistics-recovery">Manage Returns</Link>
                        </Button>
                    </div>
                </FeatureCollapsible>

                {/* Growth: Creative Studio */}
                <FeatureCollapsible
                    feature="creatives"
                    title="Creative Studio"
                    description="AI-powered content generation and design tools"
                >
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-video bg-muted rounded-md flex items-center justify-center">
                                <Palette className="w-6 h-6 text-muted-foreground/50" />
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button variant="outline" onClick={() => setCreativesOpen(true)}>
                            Open Board
                        </Button>
                        <Button variant="secondary" asChild>
                            <Link href="/growth/creative-studio">Open Studio</Link>
                        </Button>
                    </div>
                </FeatureCollapsible>

                {/* Growth: Ads Manager */}
                <FeatureCollapsible
                    feature="ads"
                    title="Ads Manager"
                    description="Manage Meta and TikTok campaigns"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Active Campaigns: <strong>3</strong></span>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setAdsOpen(true)}>
                                Campaign Tools
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/growth/ads-manager">View Campaigns</Link>
                            </Button>
                        </div>
                    </div>
                </FeatureCollapsible>

                {/* Command: Finance */}
                <FeatureCollapsible
                    feature="finance"
                    title="Finance & Insights"
                    description="Deep dive into your business data"
                >
                    <div className="h-32 flex items-center justify-center bg-muted/20 rounded-lg border border-dashed">
                        <BarChart3 className="w-8 h-8 text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Chart Placeholder</span>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button variant="ghost" onClick={() => setAnalyticsOpen(true)}>
                            Report Menu
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/command/finance">View Reports</Link>
                        </Button>
                    </div>
                </FeatureCollapsible>

                {/* Growth: Marketing Hub */}
                <FeatureCollapsible
                    feature="marketing"
                    title="Marketing Hub"
                    description="Influencer connections and automation bots"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Megaphone className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="font-medium">Active Influencers</p>
                            <p className="text-xs text-muted-foreground">12 active contracts</p>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button variant="outline" onClick={() => setMarketingOpen(true)}>
                            View Pipeline
                        </Button>
                        <Button asChild>
                            <Link href="/growth/marketing">Go to Hub</Link>
                        </Button>
                    </div>
                </FeatureCollapsible>

                {/* Command: Sourcing */}
                <FeatureCollapsible
                    feature="sourcing"
                    title="Sourcing"
                    description="Discover winning products and suppliers"
                >
                    <div className="space-y-2">
                        <p className="text-sm">Latest Trend: <strong>Summer Essentials</strong></p>
                        <Button className="w-full mb-2" variant="default" onClick={() => setResearchOpen(true)}>
                            Start Wizard
                        </Button>
                        <Button className="w-full" variant="secondary" asChild>
                            <Link href="/command/sourcing">Go to Sourcing</Link>
                        </Button>
                    </div>
                </FeatureCollapsible>

            </div>


            {/* --- Modals Integration --- */}

            <QuickViewModal
                open={salesOpen}
                onOpenChange={setSalesOpen}
                data={{ title: "Recent Order #9921" }}
                type="order"
            />

            <SplitViewModal
                open={stockOpen}
                onOpenChange={setStockOpen}
                title="Inventory Comparison"
                leftTitle="Main Warehouse"
                rightTitle="Downtown Store"
                leftContent={
                    <div className="space-y-4">
                        <div className="p-3 border rounded bg-muted/20">
                            <h4 className="font-semibold">Smart Watches</h4>
                            <p className="text-2xl font-bold mt-1">450 <span className="text-xs font-normal text-muted-foreground">units</span></p>
                        </div>
                        <div className="p-3 border rounded bg-muted/20">
                            <h4 className="font-semibold">Headphones</h4>
                            <p className="text-2xl font-bold mt-1">1,200 <span className="text-xs font-normal text-muted-foreground">units</span></p>
                        </div>
                    </div>
                }
                rightContent={
                    <div className="space-y-4">
                        <div className="p-3 border rounded bg-muted/20">
                            <h4 className="font-semibold">Smart Watches</h4>
                            <p className="text-2xl font-bold mt-1 text-orange-500">12 <span className="text-xs font-normal text-muted-foreground">units</span></p>
                            <span className="text-[10px] text-orange-500 bg-orange-500/10 px-1 rounded">Low Stock</span>
                        </div>
                        <div className="p-3 border rounded bg-muted/20">
                            <h4 className="font-semibold">Headphones</h4>
                            <p className="text-2xl font-bold mt-1">85 <span className="text-xs font-normal text-muted-foreground">units</span></p>
                        </div>
                    </div>
                }
            />

            <VisualBoardModal
                open={creativesOpen}
                onOpenChange={setCreativesOpen}
                title="Creative Studio Board"
                columns={creativeBoardData}
            />

            <GridMenuModal
                open={adsOpen}
                onOpenChange={setAdsOpen}
                title="Ad Campaign Tools"
                items={[
                    { id: "1", name: "Create Campaign", icon: <Megaphone className="w-6 h-6" />, href: "#", category: "Creation" },
                    { id: "2", name: "Ad Manager", icon: <LayoutGrid className="w-6 h-6" />, href: "#", category: "Management" },
                    { id: "3", name: "Magic Ads", icon: <Sparkles className="w-6 h-6" />, href: "#", category: "AI Tools", color: "bg-purple-500" },
                ]}
            />

            <GridMenuModal
                open={analyticsOpen}
                onOpenChange={setAnalyticsOpen}
                title="Available Reports"
                items={reportsData}
            />

            <PipelineModal
                open={marketingOpen}
                onOpenChange={setMarketingOpen}
                title="Influencer Outreach"
                stages={pipelineData}
            />

            <WizardModal
                open={researchOpen}
                onOpenChange={setResearchOpen}
                title="Product Research Wizard"
                steps={wizardSteps}
                onComplete={() => setResearchOpen(false)}
            />

        </div>
    );
}
