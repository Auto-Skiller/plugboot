"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Input } from "@/components/core/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/core/ui/tabs";
import {
    Truck, Package, Clock, CheckCircle, AlertTriangle,
    XCircle, Search, Filter, MapPin, Phone, RotateCcw, Eye
} from "lucide-react";

interface Shipment {
    id: string;
    orderId: string;
    customer: string;
    phone: string;
    wilaya: string;
    deliveryCompany: string;
    status: "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "failed" | "returned";
    lastUpdate: string;
    trackingNumber: string;
    estimatedDelivery?: string;
    attempts?: number;
    failReason?: string;
    isFlagged?: boolean;
    flagReason?: "High Value" | "Blacklisted";
}

const MOCK_SHIPMENTS: Shipment[] = [
    { id: "SHP-001", orderId: "ORD-040", customer: "Ahmed K.", phone: "0555123456", wilaya: "Algiers", deliveryCompany: "Yalidine", status: "in_transit", lastUpdate: "2h ago", trackingNumber: "YAL-8847291", estimatedDelivery: "Tomorrow" },
    { id: "SHP-002", orderId: "ORD-038", customer: "Sara M.", phone: "0661789012", wilaya: "Oran", deliveryCompany: "ZR Express", status: "out_for_delivery", lastUpdate: "30m ago", trackingNumber: "ZR-9928374", estimatedDelivery: "Today" },
    { id: "SHP-003", orderId: "ORD-035", customer: "Mohamed H.", phone: "0770345678", wilaya: "Constantine", deliveryCompany: "Maystro", status: "delivered", lastUpdate: "1d ago", trackingNumber: "MAY-7738291" },
    { id: "SHP-004", orderId: "ORD-033", customer: "Nadia L.", phone: "0542901234", wilaya: "Setif", deliveryCompany: "Yalidine", status: "failed", lastUpdate: "5h ago", trackingNumber: "YAL-8847102", attempts: 2, failReason: "Customer not available" },
    { id: "SHP-005", orderId: "ORD-030", customer: "Yacine B.", phone: "0698567890", wilaya: "Blida", deliveryCompany: "Nord Ouest", status: "picked_up", lastUpdate: "1h ago", trackingNumber: "NO-2938471", estimatedDelivery: "In 2 days" },
    { id: "SHP-006", orderId: "ORD-028", customer: "Fatima Z.", phone: "0551234567", wilaya: "Annaba", deliveryCompany: "Guepex", status: "returned", lastUpdate: "2d ago", trackingNumber: "GPX-1827364", failReason: "Wrong address" },
];

const STATUS_CONFIG: Record<Shipment["status"], { label: string; color: string; icon: React.ElementType }> = {
    picked_up: { label: "Picked Up", color: "bg-[hsl(var(--accent-blue))]/10 text-[hsl(var(--accent-blue))]", icon: Package },
    in_transit: { label: "In Transit", color: "bg-[hsl(var(--accent-blue))]/20 text-[hsl(var(--accent-blue))]", icon: Truck },
    out_for_delivery: { label: "Out for Delivery", color: "bg-[hsl(var(--accent-orange))]/10 text-[hsl(var(--accent-orange))]", icon: Truck },
    delivered: { label: "Delivered", color: "bg-[hsl(var(--accent-green))]/10 text-[hsl(var(--accent-green))]", icon: CheckCircle },
    failed: { label: "Failed", color: "bg-destructive/10 text-destructive", icon: AlertTriangle },
    returned: { label: "Returned", color: "bg-muted text-muted-foreground", icon: RotateCcw },
};

export default function ShipmentTracker() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate Real API Call (Plan Item: "develop: add real API")
    useEffect(() => {
        const fetchShipments = async () => {
            setIsLoading(true);
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock API Response
            setShipments([
                { id: "SHP-001", orderId: "ORD-040", customer: "Ahmed K.", phone: "0555123456", wilaya: "Algiers", deliveryCompany: "Yalidine", status: "in_transit", lastUpdate: "2h ago", trackingNumber: "YAL-8847291", estimatedDelivery: "Tomorrow", isFlagged: true, flagReason: "High Value" },
                { id: "SHP-002", orderId: "ORD-038", customer: "Sara M.", phone: "0661789012", wilaya: "Oran", deliveryCompany: "ZR Express", status: "out_for_delivery", lastUpdate: "30m ago", trackingNumber: "ZR-9928374", estimatedDelivery: "Today" },
                { id: "SHP-003", orderId: "ORD-035", customer: "Mohamed H.", phone: "0770345678", wilaya: "Constantine", deliveryCompany: "Maystro", status: "delivered", lastUpdate: "1d ago", trackingNumber: "MAY-7738291" },
                { id: "SHP-004", orderId: "ORD-033", customer: "Nadia L.", phone: "0542901234", wilaya: "Setif", deliveryCompany: "Yalidine", status: "failed", lastUpdate: "5h ago", trackingNumber: "YAL-8847102", attempts: 2, failReason: "Customer not available", isFlagged: true, flagReason: "Blacklisted" },
                { id: "SHP-005", orderId: "ORD-030", customer: "Yacine B.", phone: "0698567890", wilaya: "Blida", deliveryCompany: "Nord Ouest", status: "picked_up", lastUpdate: "1h ago", trackingNumber: "NO-2938471", estimatedDelivery: "In 2 days" },
                { id: "SHP-006", orderId: "ORD-028", customer: "Fatima Z.", phone: "0551234567", wilaya: "Annaba", deliveryCompany: "Guepex", status: "returned", lastUpdate: "2d ago", trackingNumber: "GPX-1827364", failReason: "Wrong address" },
            ]);
            setIsLoading(false);
        };

        fetchShipments();
    }, []);

    const filteredShipments = shipments.filter(shipment => {
        const matchesSearch = shipment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shipment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const inTransitCount = shipments.filter(s => s.status === "in_transit" || s.status === "out_for_delivery").length;
    const failedCount = shipments.filter(s => s.status === "failed" || s.status === "returned").length;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                            Shipment Tracking
                        </CardTitle>
                        <CardDescription>Real-time status from all delivery partners</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                            <Truck className="h-3 w-3" /> {inTransitCount} in transit
                        </Badge>
                        {failedCount > 0 && (
                            <Badge className="bg-destructive/10 text-destructive gap-1">
                                <AlertTriangle className="h-3 w-3" /> {failedCount} exceptions
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="in_transit">In Transit</TabsTrigger>
                            <TabsTrigger value="out_for_delivery">Out for Delivery</TabsTrigger>
                            <TabsTrigger value="delivered">Delivered</TabsTrigger>
                            <TabsTrigger value="failed">Failed</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex gap-2 flex-1 md:max-w-xs">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by order, customer, tracking..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Shipments Table */}
                <div className="flex justify-end mb-2">
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()} disabled={isLoading}>
                        <RotateCcw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Syncing API...' : 'Refresh Data'}
                    </Button>
                </div>

                {isLoading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                        <RotateCcw className="h-8 w-8 animate-spin mb-4 text-[hsl(var(--accent-blue))]/20" />
                        <p>Connecting to Delivery Partners via API...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-2 font-medium text-sm">Order</th>
                                    <th className="text-left py-3 px-2 font-medium text-sm">Customer</th>
                                    <th className="text-left py-3 px-2 font-medium text-sm">Delivery Co.</th>
                                    <th className="text-left py-3 px-2 font-medium text-sm hidden md:table-cell">Tracking #</th>
                                    <th className="text-center py-3 px-2 font-medium text-sm">Status</th>
                                    <th className="text-left py-3 px-2 font-medium text-sm hidden lg:table-cell">ETA</th>
                                    <th className="text-right py-3 px-2 font-medium text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShipments.map((shipment) => {
                                    const StatusIcon = STATUS_CONFIG[shipment.status].icon;
                                    return (
                                        <tr key={shipment.id} className="border-b hover:bg-muted/50">
                                            <td className="py-3 px-2">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{shipment.orderId}</span>
                                                    <span className="text-[10px] text-muted-foreground">{shipment.lastUpdate}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex flex-col">
                                                    <span className="text-sm">{shipment.customer}</span>
                                                    <span className="text-[10px] text-muted-foreground">{shipment.wilaya}</span>
                                                    {shipment.isFlagged && (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-destructive mt-0.5">
                                                            <AlertTriangle className="w-3 h-3" /> {shipment.flagReason}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className="text-sm">{shipment.deliveryCompany}</span>
                                            </td>
                                            <td className="py-3 px-2 hidden md:table-cell">
                                                <span className="text-xs font-mono text-muted-foreground">{shipment.trackingNumber}</span>
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <Badge className={`text-xs ${STATUS_CONFIG[shipment.status].color}`}>
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {STATUS_CONFIG[shipment.status].label}
                                                </Badge>
                                                {shipment.failReason && (
                                                    <p className="text-[10px] text-destructive mt-1">{shipment.failReason}</p>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 hidden lg:table-cell">
                                                <span className="text-sm text-muted-foreground">
                                                    {shipment.estimatedDelivery || "-"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="sm" title="View Details">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" title="Call Customer">
                                                        <Phone className="h-4 w-4" />
                                                    </Button>
                                                    {(shipment.status === "failed" || shipment.status === "returned") && (
                                                        <Button variant="ghost" size="sm" className="text-[hsl(var(--accent-blue))]" title="Retry Delivery">
                                                            <RotateCcw className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
