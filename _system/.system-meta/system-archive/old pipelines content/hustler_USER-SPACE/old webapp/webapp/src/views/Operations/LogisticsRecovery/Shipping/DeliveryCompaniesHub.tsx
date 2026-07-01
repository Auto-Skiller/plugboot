"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import {
    Truck, CheckCircle, XCircle, Clock, Package,
    Plus, Settings, RefreshCw, ExternalLink, Zap
} from "lucide-react";

interface DeliveryCompany {
    id: string;
    name: string;
    logo: string;
    color: string;
    status: "connected" | "disconnected" | "pending";
    ordersToday: number;
    pendingPickup: number;
    successRate: number;
    avgDeliveryTime: string;
}

// Top 10 Algerian Delivery Companies
const DELIVERY_COMPANIES: DeliveryCompany[] = [
    { id: "yalidine", name: "Yalidine", logo: "🟠", color: "orange", status: "connected", ordersToday: 45, pendingPickup: 12, successRate: 94, avgDeliveryTime: "2.1 days" },
    { id: "zr-express", name: "ZR Express", logo: "🔵", color: "blue", status: "connected", ordersToday: 32, pendingPickup: 8, successRate: 91, avgDeliveryTime: "1.8 days" },
    { id: "maystro", name: "Maystro Delivery", logo: "🟢", color: "green", status: "connected", ordersToday: 28, pendingPickup: 5, successRate: 89, avgDeliveryTime: "2.3 days" },
    { id: "guepex", name: "Guepex", logo: "🟣", color: "purple", status: "pending", ordersToday: 0, pendingPickup: 0, successRate: 87, avgDeliveryTime: "2.5 days" },
    { id: "nord-ouest", name: "Nord Ouest", logo: "🔴", color: "red", status: "connected", ordersToday: 18, pendingPickup: 3, successRate: 92, avgDeliveryTime: "1.5 days" },
    { id: "ems", name: "EMS Algeria", logo: "🟡", color: "yellow", status: "connected", ordersToday: 15, pendingPickup: 4, successRate: 88, avgDeliveryTime: "3.0 days" },
    { id: "yassir", name: "Yassir Express", logo: "🟠", color: "orange", status: "disconnected", ordersToday: 0, pendingPickup: 0, successRate: 90, avgDeliveryTime: "1.2 days" },
    { id: "dhd", name: "DHD Express", logo: "🔵", color: "blue", status: "pending", ordersToday: 0, pendingPickup: 0, successRate: 86, avgDeliveryTime: "2.8 days" },
    { id: "ecotrack", name: "Ecotrack", logo: "🟢", color: "green", status: "connected", ordersToday: 22, pendingPickup: 6, successRate: 93, avgDeliveryTime: "2.0 days" },
    { id: "procolis", name: "Procolis", logo: "🟤", color: "amber", status: "connected", ordersToday: 12, pendingPickup: 2, successRate: 85, avgDeliveryTime: "2.7 days" },
];

const STATUS_CONFIG = {
    connected: { label: "Connected", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
    disconnected: { label: "Disconnected", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
    pending: { label: "Pending Setup", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
};

export default function DeliveryCompaniesHub() {
    const [companies] = useState(DELIVERY_COMPANIES);

    const connectedCount = companies.filter(c => c.status === "connected").length;
    const totalOrdersToday = companies.reduce((sum, c) => sum + c.ordersToday, 0);
    const totalPendingPickup = companies.reduce((sum, c) => sum + c.pendingPickup, 0);

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-blue-500" />
                            Delivery Companies
                        </CardTitle>
                        <CardDescription>
                            {connectedCount} of {companies.length} companies connected
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                            <Package className="h-3 w-3" /> {totalOrdersToday} orders today
                        </Badge>
                        <Badge className="bg-yellow-100 text-yellow-700 gap-1">
                            <Clock className="h-3 w-3" /> {totalPendingPickup} pending pickup
                        </Badge>
                        <Button variant="outline" size="sm" className="gap-1">
                            <Plus className="h-4 w-4" /> Add Company
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {companies.map((company) => {
                        const StatusIcon = STATUS_CONFIG[company.status].icon;
                        return (
                            <div
                                key={company.id}
                                className={`p-4 rounded-lg border transition-all hover:shadow-md ${company.status === "connected"
                                        ? 'bg-white dark:bg-white/5'
                                        : 'bg-muted/30 opacity-75'
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{company.logo}</span>
                                        <span className="font-medium text-sm">{company.name}</span>
                                    </div>
                                    <Badge className={`text-[10px] ${STATUS_CONFIG[company.status].color}`}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {STATUS_CONFIG[company.status].label}
                                    </Badge>
                                </div>

                                {/* Stats */}
                                {company.status === "connected" ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Orders Today</span>
                                            <span className="font-medium">{company.ordersToday}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Pending Pickup</span>
                                            <span className="font-medium text-yellow-600">{company.pendingPickup}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Success Rate</span>
                                            <span className={`font-medium ${company.successRate >= 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {company.successRate}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Avg Delivery</span>
                                            <span className="font-medium">{company.avgDeliveryTime}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-1 mt-3 pt-2 border-t">
                                            <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs">
                                                <RefreshCw className="h-3 w-3 mr-1" /> Sync
                                            </Button>
                                            <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs">
                                                <Settings className="h-3 w-3 mr-1" /> Config
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-xs text-muted-foreground mb-2">
                                            {company.status === "pending" ? "Setup in progress" : "Not connected"}
                                        </p>
                                        <Button variant="outline" size="sm" className="gap-1">
                                            <Zap className="h-3 w-3" />
                                            {company.status === "pending" ? "Complete Setup" : "Connect"}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
