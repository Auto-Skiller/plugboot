"use client";

import { useState } from "react";
import { Product } from "./ProductCard";
import { ProductList } from "./ProductList";
import { ProductFormContent } from "./ProductForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Edit, Trash2, Copy, ExternalLink, X, Package, Plus, Tag, Globe, Percent } from "lucide-react";
import { Badge } from "@/components/core/ui/badge";

interface InventorySplitViewProps {
    products: Product[];
}

export function InventorySplitView({ products }: InventorySplitViewProps) {
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const selectedProduct = products.find(p => p.id === selectedProductId);

    const handleSelectProduct = (product: Product) => {
        setSelectedProductId(product.id);
        setIsCreating(false);
        setIsEditing(false);
    };

    const handleAddProduct = () => {
        setSelectedProductId(null);
        setIsCreating(true);
        setIsEditing(false);
    };

    const handleEditProduct = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        if (isCreating) {
            setIsCreating(false);
            // Select first product if available? Or just clear selection
            if (products.length > 0) setSelectedProductId(products[0].id);
        } else {
            setIsEditing(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[600px] border rounded-xl overflow-hidden bg-card shadow-sm">
            {/* Left Pane: Product List */}
            <div className="md:col-span-4 lg:col-span-3 h-full overflow-hidden">
                <ProductList
                    products={products}
                    selectedProductId={selectedProductId || (isCreating ? null : selectedProduct?.id || null)}
                    onSelectProduct={handleSelectProduct}
                    onAddProduct={handleAddProduct}
                />
            </div>

            {/* Right Pane: Details / Form */}
            <div className="md:col-span-8 lg:col-span-9 h-full overflow-y-auto bg-background/50 p-6">
                {isCreating ? (
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">New Product</h2>
                                <p className="text-muted-foreground">Add a new item to your inventory</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleCancel}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Card>
                            <CardContent>
                                <ProductFormContent onCancel={handleCancel} onSave={handleCancel} />
                            </CardContent>
                        </Card>
                    </div>
                ) : selectedProduct ? (
                    isEditing ? (
                        <div className="max-w-2xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold">Edit Product</h2>
                                    <p className="text-muted-foreground">Update product details</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleCancel}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <Card>
                                <CardContent>
                                    <ProductFormContent onCancel={handleCancel} onSave={handleCancel} />
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            {/* Product Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="h-24 w-24 rounded-lg bg-muted overflow-hidden border border-border/50">
                                        <img src={selectedProduct.image} alt={selectedProduct.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                                        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                                            <span className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{selectedProduct.sku}</span>
                                            <span>•</span>
                                            <span className="text-sm">{selectedProduct.variants.length} variants</span>
                                        </div>
                                        <div className="mt-2 text-xl font-semibold text-primary">
                                            {selectedProduct.price.toLocaleString()} DA
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleEditProduct}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button variant="outline" size="icon">
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Stock Level</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{selectedProduct.stock}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Units available</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{selectedProduct.sales || 0}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Lifetime units sold</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2.5 w-2.5 rounded-full ${selectedProduct.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                            <span className="font-medium capitalize">{selectedProduct.status}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Active Offers */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-purple-500" />
                                            Active Offers
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedProduct.activeOffers && selectedProduct.activeOffers.length > 0 ? (
                                            <div className="space-y-2">
                                                {selectedProduct.activeOffers.map(offer => (
                                                    <div key={offer.id} className="flex items-center justify-between p-2 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                                                        <div>
                                                            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">{offer.name}</p>
                                                            <p className="text-xs text-purple-700 dark:text-purple-300">Ends: {offer.endDate}</p>
                                                        </div>
                                                        <Badge className="bg-purple-600 hover:bg-purple-700">
                                                            -{offer.discount}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No active offers</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Active LPs */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-blue-500" />
                                            Active Landing Pages
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedProduct.activeLPs && selectedProduct.activeLPs.length > 0 ? (
                                            <div className="space-y-2">
                                                {selectedProduct.activeLPs.map(lp => (
                                                    <div key={lp.id} className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                                        <div className="min-w-0 flex-1 mr-2">
                                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate">{lp.name}</p>
                                                            <a href={lp.url} className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                                                View Page <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-bold text-green-600">{lp.conversionRate}</p>
                                                            <p className="text-[10px] text-muted-foreground">Conv. Rate</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No active landing pages</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Variants Table (Mock) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Variants</CardTitle>
                                    <CardDescription>Manage product variations like size or color</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {selectedProduct.variants.length > 0 ? (
                                        <div className="space-y-2">
                                            {selectedProduct.variants.map(v => (
                                                <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                                                    <span className="font-medium">{v.name}</span>
                                                    <div className="text-sm text-muted-foreground">SKU: {selectedProduct.sku}-{v.name.toUpperCase().slice(0, 3)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-muted-foreground">
                                            No variants configured
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                        <Package className="h-16 w-16 mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold">Select a product</h3>
                        <p>Choose a product from the list to view details or edit</p>
                        <Button variant="outline" className="mt-4" onClick={handleAddProduct}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Product
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
