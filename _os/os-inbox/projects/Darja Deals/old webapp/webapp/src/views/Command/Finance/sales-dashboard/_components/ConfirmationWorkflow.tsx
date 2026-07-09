import React, { useState } from 'react';
import { CheckCircle2, Package, Truck, FolderClock, ShieldAlert, Ban, PlayCircle, X, Check } from 'lucide-react';
import { useToast } from "@/components/core/ui/toast";
import { CallCenterScripts } from './CallCenterScripts';
import { LocationCollector } from './LocationCollector';
import PackerModePanel from '@/views/Operations/ConfirmationCommand/_components/PackerModePanel';
import { Sheet, SheetContent } from "@/components/core/ui/sheet";

// Integrated Action Panel Wrapper
const ActionPanelWrapper = ({
    title,
    children,
    onSave,
    onCancel,
    saveLabel = "Save",
    cancelLabel = "Cancel"
}: {
    title: string,
    children: React.ReactNode,
    onSave: () => void,
    onCancel: () => void,
    saveLabel?: string,
    cancelLabel?: string
}) => (
    <div className="flex flex-col h-full">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border sticky top-0 bg-background z-10 pt-1">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                {title}
            </h3>
            <div className="flex items-center gap-2">
                <button
                    onClick={onCancel}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title={cancelLabel}
                >
                    <X className="w-5 h-5" />
                </button>
                <button
                    onClick={onSave}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 text-sm font-medium transition-all shadow-sm active:scale-95"
                >
                    <Check className="w-4 h-4" />
                    <span>{saveLabel}</span>
                </button>
            </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {children}
        </div>
    </div>
);

type OrderStatus = 'pre-order' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'returned';
type ActionType = 'confirm' | 'pack' | 'ship' | null;

interface Order {
    id: string;
    customer: string;
    phone: string;
    status: OrderStatus;
    value: number;
}

/**
 * ConfirmationWorkflow - Order confirmation workflow with action panels
 * Migrated to standardized Sheet component - all functionality preserved
 */
export const ConfirmationWorkflow = () => {
    // Mock Data
    // Mock Blacklist (Synced with CustomerBlacklist component ideally)
    const blacklistedNumbers = ['0555123456', '0666987654'];

    const [orders, setOrders] = useState<Order[]>([
        { id: 'ORD-101', customer: 'Ahmed Benali', phone: '0555123456', status: 'pre-order', value: 3500 }, // Blacklisted
        { id: 'ORD-102', customer: 'Sarah K.', phone: '0770998877', status: 'pre-order', value: 8200 },
        { id: 'ORD-098', customer: 'Karim M.', phone: '0661223344', status: 'confirmed', value: 4500 },
        { id: 'ORD-095', customer: 'Fatim Z.', phone: '0555667788', status: 'packed', value: 12000 },
    ]);

    // Local Sheet state (migrated from useRightPanel)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [activeAction, setActiveAction] = useState<ActionType>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { warning } = useToast();

    const closeSheet = () => {
        setIsSheetOpen(false);
        setActiveAction(null);
        setSelectedOrder(null);
    };

    const moveStatus = (id: string, newStatus: OrderStatus) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        closeSheet();
    };

    const openActionPanel = (action: ActionType, order: Order) => {
        // Checks if panel is already open and blocks interaction
        if (isSheetOpen) {
            warning("Action Blocked", "Please save or cancel the current panel before switching.");
            return;
        }

        setSelectedOrder(order);
        setActiveAction(action);
        setIsSheetOpen(true);
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'pre-order': return 'bg-[hsl(var(--accent-orange))]/10 text-[hsl(var(--accent-orange))] border-[hsl(var(--accent-orange))]/20';
            case 'confirmed': return 'bg-[hsl(var(--accent-blue))]/10 text-[hsl(var(--accent-blue))] border-[hsl(var(--accent-blue))]/20';
            case 'packed': return 'bg-secondary text-secondary-foreground border-secondary/50';
            case 'shipped': return 'bg-primary/5 text-primary border-primary/10';
            case 'delivered': return 'bg-[hsl(var(--accent-green))]/10 text-[hsl(var(--accent-green))] border-[hsl(var(--accent-green))]/20';
            case 'returned': return 'bg-destructive/10 text-destructive border-destructive/20';
            default: return 'bg-muted text-foreground';
        }
    };

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case 'pre-order': return <FolderClock className="w-4 h-4" />;
            case 'confirmed': return <CheckCircle2 className="w-4 h-4" />;
            case 'packed': return <Package className="w-4 h-4" />;
            case 'shipped': return <Truck className="w-4 h-4" />;
            default: return <PlayCircle className="w-4 h-4" />;
        }
    };

    // Hints Component
    const OrderHints = ({ order }: { order: Order }) => (
        <div className="flex gap-2 mb-4">
            {order.value > 8000 && (
                <div className="bg-[hsl(var(--accent-orange))]/10 text-[hsl(var(--accent-orange))] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> High Value Order
                </div>
            )}
            {blacklistedNumbers.includes(order.phone) && (
                <div className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Ban className="w-3 h-3" /> BLACKLISTED CUSTOMER
                </div>
            )}
        </div>
    );

    // Get panel content based on action type
    const getPanelContent = () => {
        if (!selectedOrder || !activeAction) return null;

        switch (activeAction) {
            case 'confirm':
                return (
                    <ActionPanelWrapper
                        title="Confirm Order"
                        onSave={() => moveStatus(selectedOrder.id, 'confirmed')}
                        onCancel={closeSheet}
                        saveLabel="Confirm & Save"
                    >
                        <OrderHints order={selectedOrder} />
                        <CallCenterScripts />
                    </ActionPanelWrapper>
                );
            case 'pack':
                return (
                    <ActionPanelWrapper
                        title="Packer Mode"
                        onSave={() => moveStatus(selectedOrder.id, 'packed')}
                        onCancel={closeSheet}
                        saveLabel="Mark as Packed"
                    >
                        <OrderHints order={selectedOrder} />
                        <PackerModePanel />
                    </ActionPanelWrapper>
                );
            case 'ship':
                return (
                    <ActionPanelWrapper
                        title="Shipping Details"
                        onSave={() => moveStatus(selectedOrder.id, 'shipped')}
                        onCancel={closeSheet}
                        saveLabel="Mark as Shipped"
                    >
                        <OrderHints order={selectedOrder} />
                        <LocationCollector />
                    </ActionPanelWrapper>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-foreground">
                <CheckCircle2 className="w-6 h-6 text-[hsl(var(--accent-green))]" />
                Order Confirmation Workflow
            </h3>

            {/* Action Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    {getPanelContent()}
                </SheetContent>
            </Sheet>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4 rounded-tl-lg">Order ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Value</th>
                            <th className="p-4">Current Status</th>
                            <th className="p-4 text-right rounded-tr-lg">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                                <td className="p-4 font-mono text-sm font-medium text-foreground">
                                    {order.id}
                                    {/* Risk Badging */}
                                    {order.value > 8000 && (
                                        <span className="block mt-1 text-[10px] text-[hsl(var(--accent-orange))] flex items-center gap-1">
                                            <ShieldAlert className="w-3 h-3" /> High Value
                                        </span>
                                    )}
                                    {blacklistedNumbers.includes(order.phone) && (
                                        <span className="block mt-1 text-[10px] text-destructive font-bold flex items-center gap-1">
                                            <ShieldAlert className="w-3 h-3" /> BLACKLISTED
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-foreground">
                                    <div className="font-medium">{order.customer}</div>
                                    <div className="text-xs text-muted-foreground">{order.phone}</div>
                                </td>
                                <td className="p-4 text-sm font-semibold">{order.value.toLocaleString()} DA</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 w-fit border ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {order.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {order.status === 'pre-order' && (
                                        <button
                                            onClick={() => openActionPanel('confirm', order)}
                                            className="bg-[hsl(var(--accent-blue))] text-white px-4 py-1.5 rounded-md text-xs hover:bg-[hsl(var(--accent-blue))]/90 transition"
                                        >
                                            Confirm Order
                                        </button>
                                    )}
                                    {order.status === 'confirmed' && (
                                        <button
                                            onClick={() => openActionPanel('pack', order)}
                                            className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-md text-xs hover:bg-secondary/80 transition"
                                        >
                                            Mark Packed
                                        </button>
                                    )}
                                    {order.status === 'packed' && (
                                        <button
                                            onClick={() => openActionPanel('ship', order)}
                                            className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-xs hover:bg-primary/90 transition"
                                        >
                                            Mark Shipped
                                        </button>
                                    )}
                                    {order.status === 'shipped' && (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => moveStatus(order.id, 'delivered')}
                                                className="bg-[hsl(var(--accent-green))] text-white px-3 py-1.5 rounded-md text-xs hover:bg-[hsl(var(--accent-green))]/90 transition"
                                            >
                                                Delivered
                                            </button>
                                            <button
                                                onClick={() => moveStatus(order.id, 'returned')}
                                                className="bg-destructive text-white px-3 py-1.5 rounded-md text-xs hover:bg-destructive/90 transition"
                                            >
                                                Returned
                                            </button>
                                        </div>
                                    )}
                                    {(order.status === 'delivered' || order.status === 'returned') && (
                                        <span className="text-xs text-muted-foreground italic">Order Closed</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

