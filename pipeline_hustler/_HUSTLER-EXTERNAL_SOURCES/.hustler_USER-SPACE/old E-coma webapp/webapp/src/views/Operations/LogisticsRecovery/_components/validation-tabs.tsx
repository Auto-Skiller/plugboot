"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/core/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Switch } from "@/components/core/ui/switch";
import { Send, RotateCcw, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";

interface ValidationTabsProps {
    className?: string;
}

interface ValidationOrder {
    id: string;
    customer: string;
    amount: number;
    date: string;
    status: "pending" | "validated" | "rejected";
}

const mockSendValidation: ValidationOrder[] = [
    { id: "VAL-001", customer: "Amine M.", amount: 4500, date: "2024-12-05", status: "pending" },
    { id: "VAL-002", customer: "Karim S.", amount: 2200, date: "2024-12-05", status: "pending" },
    { id: "VAL-003", customer: "Nadia B.", amount: 8900, date: "2024-12-04", status: "validated" },
];

const mockReturnsValidation: ValidationOrder[] = [
    { id: "RET-001", customer: "Fatima Z.", amount: 3400, date: "2024-12-05", status: "pending" },
];

const mockPaymentsValidation: ValidationOrder[] = [
    { id: "PAY-001", customer: "Mohamed L.", amount: 5600, date: "2024-12-05", status: "pending" },
    { id: "PAY-002", customer: "Sara K.", amount: 7800, date: "2024-12-04", status: "validated" },
];

function ValidationTable({
    orders,
    onValidate,
    onReject
}: {
    orders: ValidationOrder[];
    onValidate?: (id: string) => void;
    onReject?: (id: string) => void;
}) {
    return (
        <div className="space-y-3">
            {orders.map((order) => (
                <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="font-medium">{order.customer}</p>
                            <p className="text-sm text-muted-foreground">
                                {order.id} • {order.date}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="font-bold">{order.amount.toLocaleString()} DA</span>
                        {order.status === "pending" ? (
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                    onClick={() => onValidate?.(order.id)}
                                >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Valider
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() => onReject?.(order.id)}
                                >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Rejeter
                                </Button>
                            </div>
                        ) : (
                            <Badge variant={order.status === "validated" ? "default" : "destructive"}>
                                {order.status === "validated" ? "Validé" : "Rejeté"}
                            </Badge>
                        )}
                    </div>
                </div>
            ))}
            {orders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    Aucune commande à valider
                </div>
            )}
        </div>
    );
}

export function ValidationTabs({ className }: ValidationTabsProps) {
    const [autoValidate, setAutoValidate] = React.useState(false);
    const [sendOrders, setSendOrders] = React.useState(mockSendValidation);
    const [returnsOrders, setReturnsOrders] = React.useState(mockReturnsValidation);
    const [paymentsOrders, setPaymentsOrders] = React.useState(mockPaymentsValidation);

    const pendingSendCount = sendOrders.filter(o => o.status === "pending").length;
    const pendingReturnsCount = returnsOrders.filter(o => o.status === "pending").length;
    const pendingPaymentsCount = paymentsOrders.filter(o => o.status === "pending").length;

    const handleValidate = (type: "send" | "returns" | "payments", id: string) => {
        const setOrders = type === "send" ? setSendOrders : type === "returns" ? setReturnsOrders : setPaymentsOrders;
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "validated" as const } : o));
    };

    const handleReject = (type: "send" | "returns" | "payments", id: string) => {
        const setOrders = type === "send" ? setSendOrders : type === "returns" ? setReturnsOrders : setPaymentsOrders;
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "rejected" as const } : o));
    };

    // Auto-validation simulation
    React.useEffect(() => {
        if (!autoValidate) return;

        const interval = setInterval(() => {
            const validateRandom = (setOrders: React.Dispatch<React.SetStateAction<ValidationOrder[]>>) => {
                setOrders(prev => {
                    const pending = prev.filter(o => o.status === "pending");
                    if (pending.length > 0) {
                        const toValidate = pending[0];
                        return prev.map(o => o.id === toValidate.id ? { ...o, status: "validated" as const } : o);
                    }
                    return prev;
                });
            };

            // Randomly pick a category to validate
            const rand = Math.random();
            if (rand < 0.33) validateRandom(setSendOrders);
            else if (rand < 0.66) validateRandom(setReturnsOrders);
            else validateRandom(setPaymentsOrders);

        }, 3000); // Validate one order every 3 seconds

        return () => clearInterval(interval);
    }, [autoValidate]);

    return (
        <Card className={cn("", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle>Validation des Commandes</CardTitle>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Auto-validation</span>
                        <Switch
                            checked={autoValidate}
                            onCheckedChange={setAutoValidate}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="send" className="w-full">
                    <TabsList className="w-full grid grid-cols-3 mb-4">
                        <TabsTrigger value="send" className="gap-2">
                            <Send className="h-4 w-4" />
                            <span className="hidden sm:inline">Validation d&apos;envoi</span>
                            <span className="sm:hidden">Envoi</span>
                            {pendingSendCount > 0 && (
                                <Badge variant="secondary" className="ml-1">{pendingSendCount}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="returns" className="gap-2">
                            <RotateCcw className="h-4 w-4" />
                            <span className="hidden sm:inline">Validation des Retours</span>
                            <span className="sm:hidden">Retours</span>
                            {pendingReturnsCount > 0 && (
                                <Badge variant="secondary" className="ml-1">{pendingReturnsCount}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="hidden sm:inline">Validation des Paiements</span>
                            <span className="sm:hidden">Paiements</span>
                            {pendingPaymentsCount > 0 && (
                                <Badge variant="secondary" className="ml-1">{pendingPaymentsCount}</Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="send">
                        <ValidationTable
                            orders={sendOrders}
                            onValidate={(id) => handleValidate("send", id)}
                            onReject={(id) => handleReject("send", id)}
                        />
                    </TabsContent>

                    <TabsContent value="returns">
                        <ValidationTable
                            orders={returnsOrders}
                            onValidate={(id) => handleValidate("returns", id)}
                            onReject={(id) => handleReject("returns", id)}
                        />
                    </TabsContent>

                    <TabsContent value="payments">
                        <ValidationTable
                            orders={paymentsOrders}
                            onValidate={(id) => handleValidate("payments", id)}
                            onReject={(id) => handleReject("payments", id)}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
