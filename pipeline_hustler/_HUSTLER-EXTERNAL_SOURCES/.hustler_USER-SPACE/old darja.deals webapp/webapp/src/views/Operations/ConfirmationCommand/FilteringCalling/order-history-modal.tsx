"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/core/ui/dialog";
import { Button } from "@/components/core/ui/button";
import { ScrollArea } from "@/components/core/ui/scroll-area";
import { History, CheckCircle2, Truck, Package, XCircle, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderEvent {
    id: string;
    status: string;
    description: string;
    timestamp: string;
    user?: string;
    icon?: React.ReactNode;
}

interface OrderHistoryModalProps {
    orderId: string;
    events: OrderEvent[];
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
    created: <Package className="h-4 w-4" />,
    confirmed: <CheckCircle2 className="h-4 w-4" />,
    shipped: <Truck className="h-4 w-4" />,
    delivered: <CheckCircle2 className="h-4 w-4" />,
    cancelled: <XCircle className="h-4 w-4" />,
    issue: <AlertCircle className="h-4 w-4" />,
    pending: <Clock className="h-4 w-4" />,
};

const STATUS_COLORS: Record<string, string> = {
    created: "bg-blue-100 text-blue-600",
    confirmed: "bg-green-100 text-green-600",
    shipped: "bg-indigo-100 text-indigo-600",
    delivered: "bg-purple-100 text-purple-600",
    cancelled: "bg-red-100 text-red-600",
    issue: "bg-orange-100 text-orange-600",
    pending: "bg-yellow-100 text-yellow-600",
};

export function OrderHistoryModal({
    orderId,
    events,
    open,
    onOpenChange,
    trigger
}: OrderHistoryModalProps) {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="gap-2">
                        <History className="h-4 w-4" />
                        History
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-muted-foreground" />
                        Order History
                    </DialogTitle>
                    <DialogDescription>
                        Timeline of events for order #{orderId}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="relative pl-6 border-l-2 border-muted space-y-8 my-4 ml-2">
                        {events.map((event, index) => {
                            const icon = STATUS_ICONS[event.status] || <CheckCircle2 className="h-4 w-4" />;
                            const colorClass = STATUS_COLORS[event.status] || "bg-gray-100 text-gray-600";

                            return (
                                <div key={event.id} className="relative">
                                    {/* Timeline Dot */}
                                    <div className={cn(
                                        "absolute -left-[33px] top-0 h-8 w-8 rounded-full flex items-center justify-center border-4 border-background",
                                        colorClass
                                    )}>
                                        {icon}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-sm capitalize">
                                                {event.status.replace("_", " ")}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDate(event.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {event.description}
                                        </p>
                                        {event.user && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                by <span className="font-medium text-foreground">{event.user}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

// Mock Data
export const mockOrderHistory: OrderEvent[] = [
    {
        id: "evt-1",
        status: "created",
        description: "Order placed by customer",
        timestamp: "2024-12-05T09:00:00",
        user: "System"
    },
    {
        id: "evt-2",
        status: "pending",
        description: "Payment verification pending",
        timestamp: "2024-12-05T09:05:00",
        user: "System"
    },
    {
        id: "evt-3",
        status: "confirmed",
        description: "Order confirmed by call center",
        timestamp: "2024-12-05T10:30:00",
        user: "Sarah (Agent)"
    }
];
