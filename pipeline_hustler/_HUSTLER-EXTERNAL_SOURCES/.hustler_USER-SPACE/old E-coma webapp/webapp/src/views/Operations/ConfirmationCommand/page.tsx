"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/core/ui/tabs";
import {
    Phone,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Send,
    PhoneCall,
    Truck,
    BarChart3,
    ShieldAlert,
    Bot,
    ClipboardList
} from "lucide-react";

// Import components
import ReturnRiskCalculator from "@/views/Operations/ConfirmationCommand/FilteringCalling/ReturnRiskCalculator";
import { CallCenterScripts } from "@/views/Operations/ConfirmationCommand/FilteringCalling/CallCenterScripts";
import ShipmentTracker from "@/views/Operations/LogisticsRecovery/Shipping/ShipmentTracker";
import { CustomerBlacklist } from "@/views/Command/Finance/sales-dashboard/_components/CustomerBlacklist";
import { OrdersChart } from "@/views/Operations/ConfirmationCommand/_components/OrdersChart";
import { ConfirmationBot } from "@/views/Growth/Marketing/_components/ConfirmationBot";
import { CommsAutomatisationsTab } from "@/views/Command/Finance/sales-dashboard/_components/tabs/CommsAutomatisationsTab";
import { NewOrderButton } from "@/views/Operations/ConfirmationCommand/_components/new-order-button";
import { SavedFilters } from "@/components/core/ui/saved-filters";

// Mock order data
const MOCK_ORDERS = [
    { id: "ORD-001", customer: "Ahmed B.", phone: "0555123456", amount: 4500, risk: "low", status: "pending", wilaya: "Alger" },
    { id: "ORD-002", customer: "Fatima Z.", phone: "0661234567", amount: 12000, risk: "medium", status: "pending", wilaya: "Oran" },
    { id: "ORD-003", customer: "Karim M.", phone: "0770123456", amount: 25000, risk: "high", status: "pending", wilaya: "Constantine" },
    { id: "ORD-004", customer: "Samira L.", phone: "0550987654", amount: 3200, risk: "low", status: "confirmed", wilaya: "Blida" },
];

const getRiskBadge = (risk: string) => {
    switch (risk) {
        case "low": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
        case "medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
        case "high": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
        default: return "";
    }
};

export default function ConfirmationCommandPage() {
    const [selectedOrder, setSelectedOrder] = useState(MOCK_ORDERS[0]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <Phone className="h-6 w-6 text-red-500" />
                        </div>
                        مركز التأكيد (Confirmation Center)
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Orders Kanban, Risk Analysis, and Confirmation Workflow
                    </p>
                </div>
                <NewOrderButton />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN: Orders Kanban */}
                <div className="col-span-3">
                    <Card className="h-[calc(100vh-180px)] overflow-hidden">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base flex items-center justify-between">
                                <span>📦 Orders Queue</span>
                                <Badge variant="secondary">{MOCK_ORDERS.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-y-auto h-full">
                            <div className="p-2 border-b bg-muted/20">
                                <SavedFilters
                                    currentFilters={{
                                        riskScore: [],
                                        wilayas: [],
                                        minAmount: 0,
                                        maxAmount: 100000,
                                        paymentStatus: []
                                    }}
                                    onLoadFilter={(filters) => console.log("Load filters", filters)}
                                />
                            </div>
                            <div className="divide-y">
                                {MOCK_ORDERS.map((order) => (
                                    <button
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${selectedOrder.id === order.id ? "bg-primary/5 border-l-4 border-primary" : ""
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
                                            <Badge className={getRiskBadge(order.risk)}>
                                                {order.risk === "high" && <AlertTriangle className="h-3 w-3 mr-1" />}
                                                {order.risk}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{order.customer}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{order.wilaya}</span>
                                            <span className="font-bold text-primary">{order.amount.toLocaleString()} DA</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* CENTER COLUMN: Workspace */}
                <div className="col-span-6 space-y-6">
                    <Tabs defaultValue="orders-kanban" className="w-full">
                        <TabsList className="w-full grid grid-cols-5 mb-4">
                            <TabsTrigger value="orders-kanban" className="gap-2"><ClipboardList className="h-3 w-3" /> Orders Kanban</TabsTrigger>
                            <TabsTrigger value="call-workflow" className="gap-2"><Phone className="h-3 w-3" /> Call Workflow</TabsTrigger>
                            <TabsTrigger value="risk-alerts" className="gap-2"><ShieldAlert className="h-3 w-3" /> Risk & Alerts</TabsTrigger>
                            <TabsTrigger value="automation" className="gap-2"><Bot className="h-3 w-3" /> Automation Bots</TabsTrigger>
                            <TabsTrigger value="communications" className="gap-2"><MessageSquare className="h-3 w-3" /> Communications</TabsTrigger>
                        </TabsList>

                        {/* ORDERS KANBAN TAB */}
                        <TabsContent value="orders-kanban" className="space-y-6">
                            <Card>
                                <CardHeader><CardTitle>Orders Volume</CardTitle></CardHeader>
                                <CardContent>
                                    <OrdersChart />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* CALL WORKFLOW TAB */}
                        <TabsContent value="call-workflow" className="space-y-6">
                            <Card className="bg-gradient-to-r from-red-500 to-orange-600 text-white">
                                <CardContent className="py-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-2xl font-bold">{selectedOrder.customer}</h2>
                                            <div className="flex items-center gap-2 mt-1 opacity-90">
                                                <Phone className="h-4 w-4" /> {selectedOrder.phone}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 opacity-90">
                                                <Truck className="h-4 w-4" /> {selectedOrder.wilaya}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold">{selectedOrder.amount.toLocaleString()} DA</div>
                                            <Badge className="bg-white/20 hover:bg-white/30 text-white mt-1">
                                                Risk: {selectedOrder.risk.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <Button className="flex-1 bg-white text-red-600 hover:bg-red-50">
                                            <PhoneCall className="mr-2 h-4 w-4" /> Call Customer
                                        </Button>
                                        <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-0">
                                            <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Order
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                            <CallCenterScripts />
                        </TabsContent>

                        {/* RISK & ALERTS TAB */}
                        <TabsContent value="risk-alerts" className="space-y-6">
                            <ReturnRiskCalculator orderId={selectedOrder.id} />
                            {selectedOrder.risk === "high" && (
                                <Card className="border-red-500 bg-red-50 dark:bg-red-900/10">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5" />
                                            High Risk Warning
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-red-600 dark:text-red-300">
                                            This customer has a high return probability. Recommend requesting upfront payment.
                                        </p>
                                        <Button size="sm" variant="outline" className="mt-2 border-red-200 text-red-700 hover:bg-red-100">
                                            Request Upfront Payment
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                            <CustomerBlacklist />
                        </TabsContent>

                        {/* AUTOMATION BOTS TAB */}
                        <TabsContent value="automation" className="space-y-6">
                            <ConfirmationBot />
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">GPS Request Bot</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Auto-request GPS location via WhatsApp</span>
                                        <Button variant="outline" size="sm">Configure</Button>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">SMS Templates</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" size="sm">Confirmation SMS</Button>
                                        <Button variant="outline" size="sm">Shipped SMS</Button>
                                        <Button variant="outline" size="sm">Delivered SMS</Button>
                                        <Button variant="outline" size="sm">Return Warning SMS</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* COMMUNICATIONS TAB */}
                        <TabsContent value="communications" className="space-y-6">
                            <CommsAutomatisationsTab />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* RIGHT COLUMN: Action Tools */}
                <div className="col-span-3 space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-green-500" />
                                WhatsApp Tools
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-between text-xs h-9">
                                <span>📍 Request GPS</span>
                                <Send className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" className="w-full justify-between text-xs h-9">
                                <span>📸 Send Product Photo</span>
                                <Send className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" className="w-full justify-between text-xs h-9">
                                <span>💳 CCP Info</span>
                                <Send className="h-3 w-3" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-500" />
                                To-Do
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                <span>Call 5 High Risk orders</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                <span>Review 12 pending shipments</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
