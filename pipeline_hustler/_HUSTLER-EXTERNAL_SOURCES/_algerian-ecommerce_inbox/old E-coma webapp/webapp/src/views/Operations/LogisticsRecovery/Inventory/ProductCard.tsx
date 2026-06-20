"use client";

import { Card, CardContent } from "@/components/core/ui/card";
import Image from "next/image";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/core/ui/dropdown-menu";
import { MoreVertical, Package, ImageIcon, Trophy, Power } from "lucide-react";
import { Switch } from "@/components/core/ui/switch";
import { cn } from "@/lib/utils";

export interface ProductVariant {
    id: string;
    name: string;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number; // Represents TOTAL stock now
    localStock?: number; // Stock at seller's place
    carrierStock?: { [key: string]: number }; // Stock at carriers
    image?: string;
    variants: ProductVariant[];
    status?: 'active' | 'draft';
    sales?: number; // Added for Winner calculation
    activeOffers?: { id: string; name: string; discount: string; endDate: string }[];
    activeLPs?: { id: string; name: string; url: string; conversionRate: string }[];
}

export function ProductCard({ product }: { product: Product }) {
    const isWinner = (product.sales || 0) > 100; // Mock winner threshold
    const isLowStock = product.stock <= 5;

    // Calculate total if not explicit, though we expect 'stock' to be total
    const carrierTotal = product.carrierStock
        ? Object.values(product.carrierStock).reduce((a, b) => a + b, 0)
        : 0;
    const hasCarrierStock = carrierTotal > 0;

    return (
        <Card className={cn(
            "group overflow-hidden hover:shadow-md transition-shadow",
            product.status === 'draft' && "opacity-75 bg-slate-50 dark:bg-slate-900/50"
        )}>
            <div className="aspect-square relative bg-muted">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className={cn("object-cover", product.status === 'draft' && "grayscale")}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                )}

                {/* Badges Container */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {/* Winner Badge */}
                    {isWinner && (
                        <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 gap-1 shadow-sm">
                            <Trophy className="h-3 w-3" />
                            Winner
                        </Badge>
                    )}
                </div>

                {/* Top Right Actions */}
                <div className="absolute top-2 right-2 flex gap-2">
                    {/* Status Toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Modifier</DropdownMenuItem>
                            <DropdownMenuItem>Dupliquer</DropdownMenuItem>
                            <DropdownMenuItem>Gérer le stock</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        size="icon"
                        className={cn(
                            "h-8 w-8 shadow-sm transition-all",
                            product.status === 'active'
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-red-500 hover:bg-red-600 text-white"
                        )}
                    // onClick={() => toggleStatus()} 
                    >
                        <Power className="h-4 w-4" />
                    </Button>
                </div>

                {/* Bottom Row inside Image */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                    {/* Low Stock Badge */}
                    {isLowStock ? (
                        <Badge variant="destructive" className="shadow-sm">
                            Stock faible
                        </Badge>
                    ) : (hasCarrierStock ? (
                        <Badge variant="secondary" className="shadow-sm bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                            + {carrierTotal} at Carriers
                        </Badge>
                    ) : <div></div>)}
                </div>
            </div>
            <CardContent className="p-3">
                <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.sku}</p>
                <div className="flex items-center justify-between mt-2">
                    <span className="font-bold">{product.price.toLocaleString()} DA</span>
                    <div className="flex flex-col items-end">
                        <div className={cn("flex items-center gap-1 text-sm font-bold", isLowStock ? "text-amber-600" : "")}>
                            <Package className="h-3.5 w-3.5" />
                            {product.stock}
                        </div>
                        {hasCarrierStock && (
                            <span className="text-[10px] text-muted-foreground">
                                {product.localStock} Loc. / {carrierTotal} Ext.
                            </span>
                        )}
                    </div>
                </div>
                {product.variants.length > 0 && (
                    <div className="flex gap-1 mt-2">
                        {product.variants.slice(0, 3).map(v => (
                            <Badge key={v.id} variant="outline" className="text-xs">
                                {v.name}
                            </Badge>
                        ))}
                        {product.variants.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{product.variants.length - 3}
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
