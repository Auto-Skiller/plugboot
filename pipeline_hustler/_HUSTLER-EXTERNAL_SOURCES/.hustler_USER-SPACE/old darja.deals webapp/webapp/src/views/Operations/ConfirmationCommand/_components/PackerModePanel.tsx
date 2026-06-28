"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Input } from "@/components/core/ui/input";
import {
    Package, Check, Camera, Scale, Ruler, Barcode,
    Printer, ChevronRight, Box, CheckCircle2, XCircle
} from "lucide-react";

interface PackerOrder {
    id: string;
    customer: string;
    wilaya: string;
    deliveryCompany: string;
    products: ProductItem[];
    totalWeight?: number;
    status: "pending" | "packing" | "packed";
}

interface ProductItem {
    name: string;
    quantity: number;
    sku: string;
    packed: boolean;
}

const MOCK_ORDERS: PackerOrder[] = [
    {
        id: "ORD-045",
        customer: "Ahmed K.",
        wilaya: "Algiers",
        deliveryCompany: "Yalidine",
        products: [
            { name: "Wireless Earbuds Pro", quantity: 1, sku: "WE-001", packed: false },
            { name: "Phone Case Black", quantity: 2, sku: "PC-BLK", packed: false }
        ],
        status: "pending"
    },
    {
        id: "ORD-046",
        customer: "Sara M.",
        wilaya: "Oran",
        deliveryCompany: "ZR Express",
        products: [
            { name: "Smart Watch", quantity: 1, sku: "SW-002", packed: false }
        ],
        status: "pending"
    },
    {
        id: "ORD-047",
        customer: "Mohamed H.",
        wilaya: "Constantine",
        deliveryCompany: "Maystro",
        products: [
            { name: "Laptop Stand", quantity: 1, sku: "LS-ALU", packed: true },
            { name: "USB Hub", quantity: 1, sku: "HUB-007", packed: true }
        ],
        totalWeight: 1.2,
        status: "packed"
    }
];

const DELIVERY_COMPANY_COLORS: Record<string, string> = {
    "Yalidine": "bg-[hsl(var(--accent-orange))]/10 text-[hsl(var(--accent-orange))]",
    "ZR Express": "bg-[hsl(var(--accent-blue))]/10 text-[hsl(var(--accent-blue))]",
    "Maystro": "bg-[hsl(var(--accent-green))]/10 text-[hsl(var(--accent-green))]",
    "Guepex": "bg-primary/10 text-primary",
    "Nord Ouest": "bg-destructive/10 text-destructive",
};

export default function PackerModePanel() {
    const [activeOrder, setActiveOrder] = useState<PackerOrder | null>(null);
    const [packerMode, setPackerMode] = useState(false);
    const [weight, setWeight] = useState("");
    const [dimensions, setDimensions] = useState({ l: "", w: "", h: "" });
    const [barcodeInput, setBarcodeInput] = useState("");

    const pendingOrders = MOCK_ORDERS.filter(o => o.status !== "packed");
    const packedOrders = MOCK_ORDERS.filter(o => o.status === "packed");

    const handleSelectOrder = (order: PackerOrder) => {
        setActiveOrder(order);
        setWeight(order.totalWeight?.toString() || "");
    };

    const handleMarkPacked = () => {
        // In production, this would update the order status
        setActiveOrder(null);
        setWeight("");
        setDimensions({ l: "", w: "", h: "" });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders Queue */}
            <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Package className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                            Ready to Pack
                        </CardTitle>
                        <Badge>{pendingOrders.length}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {pendingOrders.map((order) => (
                        <div
                            key={order.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${activeOrder?.id === order.id
                                ? 'bg-[hsl(var(--accent-blue))]/5 border-[hsl(var(--accent-blue))]/30'
                                : 'bg-white hover:border-[hsl(var(--accent-blue))]/30'
                                }`}
                            onClick={() => handleSelectOrder(order)}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{order.id}</span>
                                <Badge className={DELIVERY_COMPANY_COLORS[order.deliveryCompany] || "bg-gray-100"}>
                                    {order.deliveryCompany}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{order.customer}</span>
                                <span>{order.wilaya}</span>
                            </div>
                            <div className="mt-2 text-xs">
                                {order.products.length} item{order.products.length > 1 ? 's' : ''}
                            </div>
                        </div>
                    ))}

                    {pendingOrders.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No orders to pack</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Packing Station */}
            <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Box className="h-5 w-5 text-[hsl(var(--accent-green))]" />
                                Packing Station
                            </CardTitle>
                            <CardDescription>
                                {activeOrder ? `Order ${activeOrder.id} - ${activeOrder.customer}` : 'Select an order to start packing'}
                            </CardDescription>
                        </div>
                        <Button
                            variant={packerMode ? "default" : "outline"}
                            onClick={() => setPackerMode(!packerMode)}
                            className="gap-2"
                        >
                            <Barcode className="h-4 w-4" />
                            {packerMode ? "Packer Mode ON" : "Packer Mode OFF"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {activeOrder ? (
                        <div className="space-y-4">
                            {/* Barcode Scanner Input */}
                            {packerMode && (
                                <div className="p-3 rounded-lg bg-[hsl(var(--accent-green))]/5 border border-[hsl(var(--accent-green))]/20">
                                    <div className="flex items-center gap-2">
                                        <Barcode className="h-5 w-5 text-[hsl(var(--accent-green))]" />
                                        <Input
                                            placeholder="Scan product barcode..."
                                            value={barcodeInput}
                                            onChange={(e) => setBarcodeInput(e.target.value)}
                                            className="flex-1"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Product Checklist */}
                            <div>
                                <h4 className="text-sm font-medium mb-2">Product Checklist</h4>
                                <div className="space-y-2">
                                    {activeOrder.products.map((product, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-3 rounded-lg border flex items-center justify-between ${product.packed
                                                ? 'bg-[hsl(var(--accent-green))]/5 border-[hsl(var(--accent-green))]/20'
                                                : 'bg-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1 rounded ${product.packed ? 'bg-[hsl(var(--accent-green))]' : 'bg-muted'}`}>
                                                    {product.packed ? (
                                                        <Check className="h-4 w-4 text-white" />
                                                    ) : (
                                                        <Box className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{product.name}</p>
                                                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">x{product.quantity}</Badge>
                                                <Button variant="ghost" size="sm">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Weight & Dimensions */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium flex items-center gap-1 mb-1">
                                        <Scale className="h-4 w-4" /> Weight (kg)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium flex items-center gap-1 mb-1">
                                        <Ruler className="h-4 w-4" /> Dimensions (cm)
                                    </label>
                                    <div className="flex gap-1">
                                        <Input
                                            placeholder="L"
                                            value={dimensions.l}
                                            onChange={(e) => setDimensions({ ...dimensions, l: e.target.value })}
                                        />
                                        <Input
                                            placeholder="W"
                                            value={dimensions.w}
                                            onChange={(e) => setDimensions({ ...dimensions, w: e.target.value })}
                                        />
                                        <Input
                                            placeholder="H"
                                            value={dimensions.h}
                                            onChange={(e) => setDimensions({ ...dimensions, h: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Package Photo */}
                            <div className="p-4 rounded-lg border border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors">
                                <Camera className="h-8 w-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Take package photo (optional)</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button className="flex-1 bg-[hsl(var(--accent-green))] hover:bg-[hsl(var(--accent-green))]/90" onClick={handleMarkPacked}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Mark as Packed
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    <Printer className="h-4 w-4" />
                                    Print Label
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Package className="h-16 w-16 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">Select an order from the queue to start packing</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
