/**
 * Zone 1: Operations - Logistics Route
 * Route: /operations/logistics
 * Imports from: @/views/Operations/LogisticsRecovery
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/core/ui/tabs";
import { Badge } from "@/components/core/ui/badge";
import { Truck, Package, AlertTriangle, RotateCcw } from "lucide-react";

// Import relocated components
import ShipmentTracker from "@/views/Operations/LogisticsRecovery/Shipping/ShipmentTracker";
import { CarrierComparison } from "@/views/Operations/LogisticsRecovery/Shipping/CarrierComparison";
import { StockOverview } from "@/views/Operations/LogisticsRecovery/Inventory/StockOverview";
import { LowStockAlerts } from "@/views/Operations/LogisticsRecovery/Inventory/LowStockAlerts";
import { CarrierStockSync } from "@/views/Operations/LogisticsRecovery/Inventory/CarrierStockSync";

export default function LogisticsRecoveryPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Truck className="h-6 w-6 text-blue-500" />
                    </div>
                    اللوجيستيك والروتور (Logistics & Recovery)
                </h1>
                <p className="text-muted-foreground mt-1">
                    Track shipments, manage returns (Rotour), and sync inventory
                </p>
            </div>

            {/* Tabs: Shipping | Returns | Inventory */}
            <Tabs defaultValue="shipping" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="shipping" className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Shipping
                    </TabsTrigger>
                    <TabsTrigger value="returns" className="flex items-center gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Rotour
                        <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                            12
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Stock
                    </TabsTrigger>
                </TabsList>

                {/* Shipping Tab */}
                <TabsContent value="shipping" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ShipmentTracker />
                        <CarrierComparison />
                    </div>
                </TabsContent>

                {/* Returns (Rotour) Tab - HIGH PRIORITY */}
                <TabsContent value="returns" className="space-y-6">
                    <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                <AlertTriangle className="h-5 w-5" />
                                ⚠️ Rotour Alert - Daily Emergency
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-red-600 dark:text-red-400 mb-4">
                                The Rotour rate in Algeria is 30-40%. Every return is lost money unless you act fast!
                            </p>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-xl text-center">
                                    <p className="text-3xl font-bold text-red-700 dark:text-red-400">12</p>
                                    <p className="text-sm text-red-600">Pending Returns</p>
                                </div>
                                <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-center">
                                    <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">5</p>
                                    <p className="text-sm text-orange-600">At Carrier Hub</p>
                                </div>
                                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl text-center">
                                    <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">3</p>
                                    <p className="text-sm text-yellow-600">Ready to Reintegrate</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Returns Tracking Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Pending Returns</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {[
                                    { id: "RET-001", order: "ORD-1245", customer: "Ahmed B.", reason: "Non conforme", status: "At Carrier", days: 3 },
                                    { id: "RET-002", order: "ORD-1198", customer: "Fatima Z.", reason: "Client absent", status: "Pending Pickup", days: 5 },
                                    { id: "RET-003", order: "ORD-1156", customer: "Karim M.", reason: "Refusé", status: "Ready to Reintegrate", days: 2 },
                                ].map((ret) => (
                                    <div key={ret.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                                        <div>
                                            <p className="font-medium">{ret.customer}</p>
                                            <p className="text-xs text-muted-foreground">{ret.order} • {ret.reason}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={ret.status === "Ready to Reintegrate" ? "default" : "secondary"}>
                                                {ret.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">{ret.days}d ago</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <StockOverview />
                        <LowStockAlerts />
                    </div>
                    <CarrierStockSync />
                </TabsContent>
            </Tabs>
        </div>
    );
}
