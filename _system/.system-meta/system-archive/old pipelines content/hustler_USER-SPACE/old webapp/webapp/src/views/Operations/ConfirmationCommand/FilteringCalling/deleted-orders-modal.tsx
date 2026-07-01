"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/core/ui/dialog";
import { Trash2, RotateCcw, X, Clock, User, MapPin, DollarSign } from "lucide-react";
import { OrderStatusBadge } from "@/components/core/ui/order-status-filter";

interface DeletedOrder {
    id: string;
    customer: string;
    phone: string;
    wilaya: string;
    amount: number;
    deletedAt: string;
    deletedBy?: string;
    originalStatus: "pending" | "confirmed" | "cancelled" | "callback" | "shipped" | "delivered" | "returned";
}

interface DeletedOrdersModalProps {
    orders: DeletedOrder[];
    onRestore?: (id: string) => void;
    onPermanentDelete?: (id: string) => void;
    trigger?: React.ReactNode;
    className?: string;
}

export function DeletedOrdersModal({
    orders,
    onRestore,
    onPermanentDelete,
    trigger,
    className,
}: DeletedOrdersModalProps) {
    const [open, setOpen] = React.useState(false);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="icon" className="h-8 w-8 relative">
                        <Trash2 className="h-4 w-4" />
                        {orders.length > 0 && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                                {orders.length > 9 ? "9+" : orders.length}
                            </span>
                        )}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className={cn("max-w-2xl max-h-[80vh] overflow-hidden flex flex-col", className)}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-500" />
                        Commandes supprimées
                    </DialogTitle>
                    <DialogDescription>
                        {orders.length} commande{orders.length !== 1 ? "s" : ""} supprimée{orders.length !== 1 ? "s" : ""}.
                        Vous pouvez les restaurer ou les supprimer définitivement.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-3 py-4">
                    {orders.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>Aucune commande supprimée</p>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-start justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                            >
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-sm">{order.id}</span>
                                        <OrderStatusBadge status={order.originalStatus} size="sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {order.customer}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {order.wilaya}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            {order.amount.toLocaleString()} DA
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatDate(order.deletedAt)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onRestore?.(order.id)}
                                        className="gap-1 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                        Restaurer
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onPermanentDelete?.(order.id)}
                                        className="gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Mock data for demonstration
export const mockDeletedOrders: DeletedOrder[] = [
    {
        id: "ORD-DEL-001",
        customer: "Ahmed K.",
        phone: "0550111222",
        wilaya: "Oran",
        amount: 3500,
        deletedAt: "2024-12-04T14:30:00",
        deletedBy: "admin",
        originalStatus: "cancelled",
    },
    {
        id: "ORD-DEL-002",
        customer: "Sara M.",
        phone: "0661333444",
        wilaya: "Alger",
        amount: 7200,
        deletedAt: "2024-12-03T09:15:00",
        originalStatus: "returned",
    },
];
