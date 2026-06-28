"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Textarea } from "@/components/core/ui/textarea";
import {
    Phone, PhoneCall, PhoneOff, CheckCircle, XCircle,
    User, Clock, MessageSquare, FileText, ChevronRight,
    Headphones, Mic, MicOff, Volume2
} from "lucide-react";

interface QueuedOrder {
    id: string;
    customer: string;
    phone: string;
    wilaya: string;
    products: string;
    amount: number;
    waitTime: string;
    attempts: number;
    lastNote?: string;
}

const MOCK_QUEUE: QueuedOrder[] = [
    { id: "PRE-001", customer: "Ahmed K.", phone: "0555123456", wilaya: "Algiers", products: "2x T-Shirt", amount: 3500, waitTime: "5 min", attempts: 0 },
    { id: "PRE-004", customer: "Nadia L.", phone: "0542901234", wilaya: "Setif", products: "1x Watch, 1x Bag", amount: 15500, waitTime: "12 min", attempts: 1, lastNote: "Customer asked to call back in 10 min" },
    { id: "PRE-002", customer: "Sara M.", phone: "0661789012", wilaya: "Oran", products: "1x Sneakers", amount: 8500, waitTime: "20 min", attempts: 0 },
];

const CALL_SCRIPTS = [
    "Bonjour [Customer], je vous appelle de [Store] concernant votre commande [OrderID]...",
    "Salam [Customer], c'est [AgentName] de [Store]. Je confirme votre commande...",
    "Bonjour, vous avez passé une commande de [Products]. Je vérifie votre adresse..."
];

export default function SalesAgentPanel() {
    const [activeCall, setActiveCall] = useState<QueuedOrder | null>(null);
    const [callNotes, setCallNotes] = useState("");
    const [isMuted, setIsMuted] = useState(false);

    const handleStartCall = (order: QueuedOrder) => {
        setActiveCall(order);
        setCallNotes(order.lastNote || "");
    };

    const handleEndCall = (outcome: "confirmed" | "cancelled" | "callback") => {
        // In production, this would update the order status
        setActiveCall(null);
        setCallNotes("");
    };

    return (
        <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200/60 dark:border-blue-800/30">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-500">
                            <Headphones className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            Sales Agent Panel
                        </CardTitle>
                        <CardDescription>Call queue for order confirmation</CardDescription>
                    </div>
                    <Badge className="bg-blue-600 hover:bg-blue-700">
                        {MOCK_QUEUE.length} in queue
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Queue List */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Call Queue</h4>
                        {MOCK_QUEUE.map((order) => (
                            <div
                                key={order.id}
                                className={`p-3 rounded-lg border transition-all cursor-pointer ${activeCall?.id === order.id
                                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                                        : 'bg-white/60 dark:bg-white/5 border-blue-100/50 dark:border-blue-800/30 hover:border-blue-300'
                                    }`}
                                onClick={() => handleStartCall(order)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-blue-500" />
                                        <span className="font-medium text-sm">{order.customer}</span>
                                        <Badge variant="outline" className="text-[10px]">{order.id}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">{order.waitTime}</span>
                                        {order.attempts > 0 && (
                                            <Badge className="bg-yellow-100 text-yellow-700 text-[10px]">
                                                {order.attempts} attempt{order.attempts > 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-muted-foreground">{order.products}</span>
                                    <span className="font-bold text-sm">{order.amount.toLocaleString()} DA</span>
                                </div>
                                {order.lastNote && (
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 italic">
                                        📝 {order.lastNote}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Active Call / Call Panel */}
                    <div className="space-y-3">
                        {activeCall ? (
                            <>
                                {/* Active Call Info */}
                                <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <PhoneCall className="h-5 w-5 text-green-600 animate-pulse" />
                                            </div>
                                            <span className="text-sm font-medium text-green-800 dark:text-green-400">
                                                Calling {activeCall.customer}
                                            </span>
                                        </div>
                                        <span className="text-lg font-mono font-bold text-green-700 dark:text-green-500">
                                            {activeCall.phone}
                                        </span>
                                    </div>

                                    {/* Call Controls */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={isMuted ? "bg-red-100 border-red-300" : ""}
                                            onClick={() => setIsMuted(!isMuted)}
                                        >
                                            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Volume2 className="h-4 w-4" />
                                        </Button>
                                        <div className="flex-1" />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleEndCall("callback")}
                                        >
                                            <PhoneOff className="h-4 w-4 mr-1" /> End
                                        </Button>
                                    </div>

                                    {/* Order Details */}
                                    <div className="p-2 rounded bg-white/50 dark:bg-black/20 text-xs">
                                        <p><strong>Wilaya:</strong> {activeCall.wilaya}</p>
                                        <p><strong>Products:</strong> {activeCall.products}</p>
                                        <p><strong>Total:</strong> {activeCall.amount.toLocaleString()} DA</p>
                                    </div>
                                </div>

                                {/* Call Notes */}
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Call Notes</label>
                                    <Textarea
                                        placeholder="Add notes about the call..."
                                        className="mt-1 text-sm"
                                        rows={3}
                                        value={callNotes}
                                        onChange={(e) => setCallNotes(e.target.value)}
                                    />
                                </div>

                                {/* Quick Scripts */}
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground">Quick Scripts</label>
                                    <div className="mt-1 space-y-1">
                                        {CALL_SCRIPTS.map((script, i) => (
                                            <div key={i} className="p-2 rounded bg-muted/50 text-xs cursor-pointer hover:bg-muted flex items-center gap-2">
                                                <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                                <span className="truncate">{script}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Outcome Buttons */}
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => handleEndCall("confirmed")}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1" /> Confirm
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => handleEndCall("callback")}
                                    >
                                        <Clock className="h-4 w-4 mr-1" /> Callback
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleEndCall("cancelled")}
                                    >
                                        <XCircle className="h-4 w-4 mr-1" /> Cancel
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <Headphones className="h-12 w-12 text-muted-foreground/30 mb-3" />
                                <p className="text-sm text-muted-foreground">Select an order from the queue to start a call</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {MOCK_QUEUE.length} orders waiting for confirmation
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
