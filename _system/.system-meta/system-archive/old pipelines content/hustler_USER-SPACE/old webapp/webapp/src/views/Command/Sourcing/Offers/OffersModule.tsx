"use client";

import { useState } from "react";
import { ScrollReveal, AnimatedKPI } from "@/components/core/ui/advanced-motion";
import { KPIGrid } from "@/components/core/ui/kpi-card";
import { Tag, Zap, ShoppingCart, Percent } from "lucide-react";
import { OffersSplitView } from "./OffersSplitView";
import { MOCK_OFFERS, Offer } from "./offers-data";

interface OffersModuleProps {
    products: { id: string; name: string }[];
}

export function OffersModule({ products }: OffersModuleProps) {
    const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);

    const toggleOffer = (id: string) => {
        setOffers(prev =>
            prev.map(offer =>
                offer.id === id ? { ...offer, isActive: !offer.isActive } : offer
            )
        );
    };

    const deleteOffer = (id: string) => {
        setOffers(prev => prev.filter(offer => offer.id !== id));
    };

    const activeOffers = offers.filter(o => o.isActive).length;
    const totalRevenue = offers.reduce((acc, o) => acc + o.revenue, 0);
    const totalUsage = offers.reduce((acc, o) => acc + o.usageCount, 0);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <ScrollReveal direction="down">
                <KPIGrid columns={4}>
                    <AnimatedKPI
                        title="Total Offres"
                        value={offers.length}
                        icon={<Tag className="h-5 w-5" />}
                        trend="neutral"
                        index={0}
                    />
                    <AnimatedKPI
                        title="Offres Actives"
                        value={activeOffers}
                        icon={<Zap className="h-5 w-5" />}
                        trend="up"
                        className={activeOffers > 0 ? "border-green-200 bg-green-50 dark:bg-green-900/10" : ""}
                        index={1}
                    />
                    <AnimatedKPI
                        title="Utilisations"
                        value={totalUsage}
                        icon={<ShoppingCart className="h-5 w-5" />}
                        trend="up"
                        index={2}
                    />
                    <AnimatedKPI
                        title="Revenu Généré"
                        value={totalRevenue}
                        suffix=" DA"
                        icon={<Percent className="h-5 w-5" />}
                        trend="up"
                        index={3}
                    />
                </KPIGrid>
            </ScrollReveal>

            {/* Split View */}
            <OffersSplitView
                offers={offers}
                products={products}
                onToggleActive={toggleOffer}
                onDelete={deleteOffer}
            />
        </div>
    );
}
