"use client";

import { useState } from "react";
import { Input } from "@/components/core/ui/input";
import { Button } from "@/components/core/ui/button";
import { Search, Plus, Tag, Calendar } from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { cn } from "@/lib/utils";
import { Offer, getOfferTypeColor, getOfferTypeIcon, getOfferTypeLabel } from "./offers-data";

interface OffersListProps {
    offers: Offer[];
    selectedOfferId: string | null;
    onSelectOffer: (offer: Offer) => void;
    onAddOffer: () => void;
}

export function OffersList({ offers, selectedOfferId, onSelectOffer, onAddOffer }: OffersListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredOffers = offers.filter(offer =>
        offer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full border-r border-border/50 bg-card/50">
            {/* Header */}
            <div className="p-4 space-y-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Offers</h3>
                    <Button size="sm" onClick={onAddOffer} className="h-8 gap-2">
                        <Plus className="h-3.5 w-3.5" />
                        Add
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search offers..."
                        className="pl-8 h-8 text-xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredOffers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No offers found</p>
                    </div>
                ) : (
                    filteredOffers.map(offer => {
                        const Icon = getOfferTypeIcon(offer.type);
                        return (
                            <div
                                key={offer.id}
                                onClick={() => onSelectOffer(offer)}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border border-transparent",
                                    selectedOfferId === offer.id
                                        ? "bg-accent border-border/50 shadow-sm"
                                        : "hover:bg-muted/50",
                                    !offer.isActive && "opacity-60"
                                )}
                            >
                                <div className={cn("h-10 w-10 rounded-md flex items-center justify-center flex-shrink-0", getOfferTypeColor(offer.type))}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-medium truncate pr-2">{offer.name}</h4>
                                        <span className="text-xs font-bold whitespace-nowrap text-primary">
                                            -{offer.discount}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            <span className="truncate max-w-[80px]">{offer.endDate}</span>
                                        </div>
                                        {offer.isActive ? (
                                            <Badge variant="outline" className="text-[10px] h-4 px-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50">
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] h-4 px-1">
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
