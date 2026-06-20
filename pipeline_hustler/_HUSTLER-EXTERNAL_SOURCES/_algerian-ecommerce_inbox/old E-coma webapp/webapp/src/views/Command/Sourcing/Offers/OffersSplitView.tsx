"use client";

import { useState } from "react";
import { Offer } from "./offers-data";
import { OffersList } from "./OffersList";
import { OfferFormContent } from "./OfferForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Edit, Trash2, Copy, X, Tag, Calendar, Package, ShoppingCart, Percent, Plus } from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Switch } from "@/components/core/ui/switch";
import { getOfferTypeColor, getOfferTypeIcon, getOfferTypeLabel } from "./offers-data";

interface OffersSplitViewProps {
    offers: Offer[];
    products: { id: string; name: string }[];
    onToggleActive: (id: string) => void;
    onDelete: (id: string) => void;
}

export function OffersSplitView({ offers, products, onToggleActive, onDelete }: OffersSplitViewProps) {
    const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const selectedOffer = offers.find(o => o.id === selectedOfferId);

    const handleSelectOffer = (offer: Offer) => {
        setSelectedOfferId(offer.id);
        setIsCreating(false);
        setIsEditing(false);
    };

    const handleAddOffer = () => {
        setSelectedOfferId(null);
        setIsCreating(true);
        setIsEditing(false);
    };

    const handleEditOffer = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (isCreating) {
            setIsCreating(false);
            if (offers.length > 0) setSelectedOfferId(offers[0].id);
        } else {
            setIsEditing(false);
        }
    };

    const Icon = selectedOffer ? getOfferTypeIcon(selectedOffer.type) : Tag;

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[600px] border rounded-xl overflow-hidden bg-card shadow-sm">
            {/* Left Pane: Offers List */}
            <div className="md:col-span-4 lg:col-span-3 h-full overflow-hidden">
                <OffersList
                    offers={offers}
                    selectedOfferId={selectedOfferId || (isCreating ? null : selectedOffer?.id || null)}
                    onSelectOffer={handleSelectOffer}
                    onAddOffer={handleAddOffer}
                />
            </div>

            {/* Right Pane: Details / Form */}
            <div className="md:col-span-8 lg:col-span-9 h-full overflow-y-auto bg-background/50 p-6">
                {isCreating ? (
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">New Offer</h2>
                                <p className="text-muted-foreground">Create a new promotional campaign</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleCancel}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Card>
                            <CardContent>
                                <OfferFormContent products={products} onCancel={handleCancel} onSave={handleCancel} />
                            </CardContent>
                        </Card>
                    </div>
                ) : selectedOffer ? (
                    isEditing ? (
                        <div className="max-w-2xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">Edit Offer</h2>
                                    <p className="text-muted-foreground">Update campaign details</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleCancel}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <Card>
                                <CardContent>
                                    <OfferFormContent
                                        products={products}
                                        initialData={selectedOffer}
                                        onCancel={handleCancel}
                                        onSave={handleCancel}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className={`h-20 w-20 rounded-xl flex items-center justify-center ${getOfferTypeColor(selectedOffer.type)}`}>
                                        <Icon className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-2xl font-bold">{selectedOffer.name}</h2>
                                            <Badge variant={selectedOffer.isActive ? "default" : "secondary"} className={selectedOffer.isActive ? "bg-green-500" : ""}>
                                                {selectedOffer.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Badge variant="outline">{getOfferTypeLabel(selectedOffer.type)}</Badge>
                                            <span>•</span>
                                            <span className="font-bold text-primary">-{selectedOffer.discount}%</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            {selectedOffer.startDate} — {selectedOffer.endDate}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-2 mr-4">
                                        <span className="text-sm font-medium">Status</span>
                                        <Switch
                                            checked={selectedOffer.isActive}
                                            onCheckedChange={() => onToggleActive(selectedOffer.id)}
                                        />
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleEditOffer}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(selectedOffer.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Metrics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{selectedOffer.revenue.toLocaleString()} DA</div>
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <Percent className="h-3 w-3" /> Generated sales
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Usage Count</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{selectedOffer.usageCount}</div>
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <ShoppingCart className="h-3 w-3" /> Times applied
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{selectedOffer.products.length}</div>
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <Package className="h-3 w-3" /> Included items
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Products List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Included Products</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {selectedOffer.products.map((productName, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <span className="font-medium">{productName}</span>
                                                </div>
                                                <Button variant="ghost" size="sm">View</Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                        <Tag className="h-16 w-16 mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold">Select an offer</h3>
                        <p>Choose an offer from the list to view details or edit</p>
                        <Button variant="outline" className="mt-4" onClick={handleAddOffer}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Offer
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
