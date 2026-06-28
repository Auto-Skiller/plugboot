"use client";

import { useState } from "react";
import { Input } from "@/components/core/ui/input";
import { Button } from "@/components/core/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import { Search, Plus, Package, ArrowUpDown, MoreVertical } from "lucide-react";
import { Product } from "./ProductCard";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/core/ui/badge";

interface ProductListProps {
    products: Product[];
    selectedProductId: string | null;
    onSelectProduct: (product: Product) => void;
    onAddProduct: () => void;
}

export function ProductList({ products, selectedProductId, onSelectProduct, onAddProduct }: ProductListProps) {
    const [sortBy, setSortBy] = useState<"default" | "top" | "low-stock">("default");
    const [searchQuery, setSearchQuery] = useState("");

    // Filter and Sort
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === "top") {
            return (b.sales || 0) - (a.sales || 0);
        }
        if (sortBy === "low-stock") {
            return a.stock - b.stock;
        }
        return 0;
    });

    return (
        <div className="flex flex-col h-full border-r border-border/50 bg-card/50">
            {/* Header */}
            <div className="p-4 space-y-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Products</h3>
                    <Button size="sm" onClick={onAddProduct} className="h-8 gap-2">
                        <Plus className="h-3.5 w-3.5" />
                        Add
                    </Button>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="pl-8 h-8 text-xs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                        <SelectTrigger className="w-[32px] h-8 px-0 flex items-center justify-center">
                            <ArrowUpDown className="h-3.5 w-3.5" />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="top">Top Sales</SelectItem>
                            <SelectItem value="low-stock">Low Stock</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sortedProducts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No products found</p>
                    </div>
                ) : (
                    sortedProducts.map(product => (
                        <div
                            key={product.id}
                            onClick={() => onSelectProduct(product)}
                            className={cn(
                                "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border border-transparent",
                                selectedProductId === product.id
                                    ? "bg-accent border-border/50 shadow-sm"
                                    : "hover:bg-muted/50"
                            )}
                        >
                            <div className="h-10 w-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-medium truncate pr-2">{product.name}</h4>
                                    <span className="text-xs font-semibold whitespace-nowrap">
                                        {product.price.toLocaleString()} DA
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-muted-foreground truncate">{product.sku}</span>
                                    <Badge variant={product.stock < 10 ? "destructive" : "secondary"} className="text-[10px] h-4 px-1">
                                        {product.stock} in stock
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
