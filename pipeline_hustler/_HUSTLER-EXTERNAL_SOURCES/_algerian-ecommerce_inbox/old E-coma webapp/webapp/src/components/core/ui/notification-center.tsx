"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/ui/button";
import {
    Bell,
    X,
    Check,
    ShoppingBag,
    AlertTriangle,
    TrendingUp,
    Package,
    MessageCircle,

    Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ============================================================================
// TYPES
// ============================================================================

type NotificationType = "order" | "alert" | "success" | "info" | "message";

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    description?: string;
    time: string;
    read: boolean;
    href?: string;
}

interface NotificationCenterProps {
    notifications?: Notification[];
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onClear?: (id: string) => void;
    className?: string;
}

// ============================================================================
// MOCK NOTIFICATIONS (for demo)
// ============================================================================

const mockNotifications: Notification[] = [
    {
        id: "1",
        type: "order",
        title: "New Order #1234",
        description: "Amine M. from Oran placed an order for 4,500 DZD",
        time: "2 min ago",
        read: false,
        href: "/ecommerce/orders",
    },
    {
        id: "2",
        type: "alert",
        title: "Low Stock Alert",
        description: "Product 'Wireless Headphones' has only 5 units left",
        time: "15 min ago",
        read: false,
        href: "/ecom/inventory",
    },
    {
        id: "3",
        type: "success",
        title: "Campaign Completed",
        description: "Your Facebook campaign reached 10,000 impressions",
        time: "1 hour ago",
        read: true,
        href: "/marketing/ad-accounts",
    },
    {
        id: "4",
        type: "message",
        title: "New Message",
        description: "You have a new message from support",
        time: "2 hours ago",
        read: true,
    },
];

// ============================================================================
// NOTIFICATION ICON
// ============================================================================

const notificationIcons: Record<NotificationType, React.ReactNode> = {
    order: <ShoppingBag className="h-4 w-4" />,
    alert: <AlertTriangle className="h-4 w-4" />,
    success: <TrendingUp className="h-4 w-4" />,
    info: <Package className="h-4 w-4" />,
    message: <MessageCircle className="h-4 w-4" />,
};

const notificationColors: Record<NotificationType, string> = {
    order: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    alert: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    success: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    info: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    message: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
};

// ============================================================================
// NOTIFICATION CENTER
// ============================================================================

// ============================================================================

// ... existing imports ...

export function NotificationCenter({
    notifications = mockNotifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onClear,
    className,
}: NotificationCenterProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [localNotifications, setLocalNotifications] = React.useState(notifications);
    const router = useRouter();

    const unreadCount = localNotifications.filter((n) => !n.read).length;

    const handleMarkAsRead = (id: string) => {
        setLocalNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        onMarkAsRead?.(id);
    };

    const handleMarkAllAsRead = () => {
        setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        onMarkAllAsRead?.();
    };

    const handleClear = (id: string) => {
        setLocalNotifications((prev) => prev.filter((n) => n.id !== id));
        onClear?.(id);
    };

    return (
        <div className={cn("relative", className)}>
            {/* Trigger Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative h-9 w-9 rounded-full text-foreground"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </Button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border rounded-xl shadow-xl z-50 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 flex-row-reverse">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold">Notifications</h3>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        router.push("/settings/notifications");
                                    }}
                                    className="p-1 rounded-md text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                                    title="Notification Settings"
                                >
                                    <Settings className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-primary hover:underline"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {localNotifications.length === 0 ? (
                                <div className="py-12 text-center text-muted-foreground">
                                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                    <p className="text-sm">No notifications</p>
                                </div>
                            ) : (
                                localNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "flex gap-3 px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition-colors",
                                            !notification.read && "bg-primary/5"
                                        )}
                                    >
                                        {/* Icon */}
                                        <div
                                            className={cn(
                                                "shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                                                notificationColors[notification.type]
                                            )}
                                        >
                                            {notificationIcons[notification.type]}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p
                                                    className={cn(
                                                        "text-sm font-medium truncate",
                                                        !notification.read && "text-foreground"
                                                    )}
                                                >
                                                    {notification.title}
                                                </p>
                                                <button
                                                    onClick={() => handleClear(notification.id)}
                                                    className="shrink-0 p-0.5 hover:bg-muted rounded opacity-0 group-hover:opacity-100 hover:opacity-100"
                                                >
                                                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                                                </button>
                                            </div>
                                            {notification.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                    {notification.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-muted-foreground">
                                                    {notification.time}
                                                </span>
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="text-xs text-primary hover:underline"
                                                    >
                                                        Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 border-t bg-muted/30">
                            <button className="w-full text-sm text-center text-primary hover:underline py-1">
                                View all notifications
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
