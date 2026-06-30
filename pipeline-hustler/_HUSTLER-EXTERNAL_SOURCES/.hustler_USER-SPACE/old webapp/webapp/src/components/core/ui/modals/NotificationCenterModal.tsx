"use client";

import React, { useState } from "react";
import { X, Bell, Check, AlertTriangle, Info, CheckCircle2, Trash2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/core/ui/dialog";
import { Button } from "@/components/core/ui/button";
import { ScrollArea } from "@/components/core/ui/scroll-area";
import { Badge } from "@/components/core/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: "urgent" | "info" | "success";
    source: string; // Team or System source
    timestamp: Date;
    read: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
}

// Mock Data
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "1",
        title: "Low Stock Alert",
        message: "iPhone 15 Pro Max stock is below threshold (5 remaining).",
        type: "urgent",
        source: "Stock Team",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        read: false,
        action: { label: "Restock", onClick: () => console.log("Restock") }
    },
    {
        id: "2",
        title: "Ad Account Balance",
        message: "Your prepaid balance is running low (< $50).",
        type: "urgent",
        source: "Media Buying",
        timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
        read: false
    },
    {
        id: "3",
        title: "New Campaign Approved",
        message: "Summer Sale 2026 campaign is now active.",
        type: "success",
        source: "Marketing",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        read: true
    },
    {
        id: "4",
        title: "System Update",
        message: "Maintenance scheduled for tonight at 03:00 AM.",
        type: "info",
        source: "System",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true
    }
];

interface NotificationCenterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NotificationCenterModal({ open, onOpenChange }: NotificationCenterModalProps) {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [filter, setFilter] = useState<"all" | "unread" | "urgent">("all");

    const filteredNotifications = notifications.filter(n => {
        if (filter === "unread") return !n.read;
        if (filter === "urgent") return n.type === "urgent";
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "urgent": return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case "success": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case "info": return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 gap-0 bg-background/95 backdrop-blur-xl border-border shadow-2xl overflow-hidden sm:rounded-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Bell className="w-4 h-4 text-foreground/70" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </div>
                        <h2 className="text-sm font-semibold">Notifications</h2>
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 ml-1">
                            {unreadCount} New
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={markAllAsRead}
                            title="Mark all as read"
                        >
                            <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={clearAll}
                            title="Clear all"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="px-4 py-2 flex gap-2 border-b border-border/50 bg-background">
                    {(["all", "unread", "urgent"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "text-[11px] px-2.5 py-1 rounded-full border transition-all capitalize",
                                filter === f
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* List */}
                <ScrollArea className="h-[400px]">
                    <div className="p-2 space-y-1">
                        <AnimatePresence>
                            {filteredNotifications.length > 0 ? (
                                filteredNotifications.map((notification) => (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={cn(
                                            "relative group p-3 rounded-lg border transition-all hover:bg-muted/40",
                                            notification.read ? "bg-transparent border-transparent opacity-60" : "bg-card border-border/50 shadow-sm"
                                        )}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-0.5 shrink-0">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                                    <span className="text-xs font-medium truncate">{notification.source}</span>
                                                    <span className="text-[10px] text-muted-foreground shrink-0">
                                                        {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <h3 className={cn("text-xs font-semibold mb-1", notification.read && "font-normal")}>
                                                    {notification.title}
                                                </h3>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                                                    {notification.message}
                                                </p>

                                                {notification.action && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="mt-2 h-6 text-[10px] px-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            notification.action!.onClick();
                                                        }}
                                                    >
                                                        {notification.action.label}
                                                    </Button>
                                                )}
                                            </div>
                                            {!notification.read && (
                                                <div className="shrink-0 self-center">
                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Bell className="w-8 h-8 mb-3 opacity-20" />
                                    <p className="text-sm">No notifications</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
