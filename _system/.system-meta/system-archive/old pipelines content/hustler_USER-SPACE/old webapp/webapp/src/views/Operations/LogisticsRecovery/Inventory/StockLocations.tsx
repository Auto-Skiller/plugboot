"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import {
    MapPin, Package, Plus, ArrowRightLeft, Warehouse,
    Truck, Building2, AlertTriangle, CheckCircle
} from "lucide-react";

interface StockLocation {
    id: string;
    name: string;
    type: "warehouse" | "delivery_company" | "store";
    address?: string;
    totalProducts: number;
    totalUnits: number;
    lowStockCount: number;
    icon: string;
}

const MOCK_LOCATIONS: StockLocation[] = [
    { id: "main", name: "Main Warehouse", type: "warehouse", address: "Zone Industrielle, Alger", totalProducts: 45, totalUnits: 1250, lowStockCount: 3, icon: "🏭" },
    { id: "yalidine", name: "Yalidine Depot", type: "delivery_company", address: "Alger", totalProducts: 12, totalUnits: 85, lowStockCount: 1, icon: "🟠" },
    { id: "zr", name: "ZR Express Hub", type: "delivery_company", address: "Oran", totalProducts: 8, totalUnits: 42, lowStockCount: 0, icon: "🔵" },
    { id: "maystro", name: "Maystro Center", type: "delivery_company", address: "Constantine", totalProducts: 6, totalUnits: 35, lowStockCount: 2, icon: "🟢" },
    { id: "store1", name: "Boutique Alger", type: "store", address: "Didouche Mourad, Alger", totalProducts: 20, totalUnits: 180, lowStockCount: 0, icon: "🏪" },
];

const TYPE_LABELS: Record<StockLocation["type"], { label: string; color: string }> = {
    warehouse: { label: "Warehouse", color: "bg-blue-100 text-blue-700" },
    delivery_company: { label: "Delivery Partner", color: "bg-purple-100 text-purple-700" },
    store: { label: "Store", color: "bg-green-100 text-green-700" },
};

const TYPE_ICONS: Record<StockLocation["type"], React.ElementType> = {
    warehouse: Warehouse,
    delivery_company: Truck,
    store: Building2,
};

export default function StockLocations() {
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

    const totalUnits = MOCK_LOCATIONS.reduce((sum, loc) => sum + loc.totalUnits, 0);
    const totalLowStock = MOCK_LOCATIONS.reduce((sum, loc) => sum + loc.lowStockCount, 0);

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-green-500" />
                            Stock Locations
                        </CardTitle>
                        <CardDescription>Manage stock across multiple locations</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                            <Package className="h-3 w-3" /> {totalUnits.toLocaleString()} total units
                        </Badge>
                        {totalLowStock > 0 && (
                            <Badge className="bg-yellow-100 text-yellow-700 gap-1">
                                <AlertTriangle className="h-3 w-3" /> {totalLowStock} low stock alerts
                            </Badge>
                        )}
                        <Button variant="outline" size="sm" className="gap-1">
                            <Plus className="h-4 w-4" /> Add Location
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MOCK_LOCATIONS.map((location) => {
                        const TypeIcon = TYPE_ICONS[location.type];
                        const typeConfig = TYPE_LABELS[location.type];

                        return (
                            <div
                                key={location.id}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedLocation === location.id
                                        ? 'bg-primary/5 border-primary'
                                        : 'bg-white dark:bg-white/5 hover:border-primary/50'
                                    }`}
                                onClick={() => setSelectedLocation(location.id === selectedLocation ? null : location.id)}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{location.icon}</span>
                                        <div>
                                            <h4 className="font-medium text-sm">{location.name}</h4>
                                            {location.address && (
                                                <p className="text-xs text-muted-foreground">{location.address}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge className={`text-[10px] ${typeConfig.color}`}>
                                        <TypeIcon className="h-3 w-3 mr-1" />
                                        {typeConfig.label}
                                    </Badge>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    <div className="text-center p-2 rounded bg-muted/50">
                                        <p className="text-lg font-bold">{location.totalProducts}</p>
                                        <p className="text-[10px] text-muted-foreground">Products</p>
                                    </div>
                                    <div className="text-center p-2 rounded bg-muted/50">
                                        <p className="text-lg font-bold">{location.totalUnits}</p>
                                        <p className="text-[10px] text-muted-foreground">Units</p>
                                    </div>
                                    <div className={`text-center p-2 rounded ${location.lowStockCount > 0 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                                        <p className={`text-lg font-bold ${location.lowStockCount > 0 ? 'text-yellow-700 dark:text-yellow-400' : 'text-green-700 dark:text-green-400'}`}>
                                            {location.lowStockCount}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">Low Stock</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                                        <Package className="h-3 w-3 mr-1" /> View Stock
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                                        <ArrowRightLeft className="h-3 w-3 mr-1" /> Transfer
                                    </Button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add Location Card */}
                    <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors min-h-[180px]">
                        <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Add New Location</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
