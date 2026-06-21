"use client";

import React from "react";
import { X, CheckCircle, AlertTriangle, XCircle, RefreshCw, Server, Wifi, Database, Globe } from "lucide-react";
import { Dialog, DialogContent } from "@/components/core/ui/dialog";
import { Button } from "@/components/core/ui/button";
import { cn } from "@/lib/utils";

interface SystemStatusModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface ServiceStatus {
    name: string;
    status: "operational" | "degraded" | "down";
    latency: string;
    icon: React.ElementType;
}

const SERVICES: ServiceStatus[] = [
    { name: "API Gateway", status: "operational", latency: "24ms", icon: Globe },
    { name: "Database (Supabase)", status: "operational", latency: "45ms", icon: Database },
    { name: "Storage", status: "operational", latency: "120ms", icon: Server },
    { name: "Realtime Events", status: "operational", latency: "15ms", icon: Wifi },
    { name: "Third Party: Yalidine", status: "degraded", latency: "800ms", icon: RefreshCw },
    { name: "Third Party: Meta Ads", status: "operational", latency: "60ms", icon: RefreshCw },
];

export function SystemStatusModal({ open, onOpenChange }: SystemStatusModalProps) {
    const getStatusColor = (status: ServiceStatus["status"]) => {
        switch (status) {
            case "operational": return "text-green-500 bg-green-500/10 border-green-500/20";
            case "degraded": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
            case "down": return "text-red-500 bg-red-500/10 border-red-500/20";
        }
    };

    const getStatusIcon = (status: ServiceStatus["status"]) => {
        switch (status) {
            case "operational": return <CheckCircle className="w-4 h-4" />;
            case "degraded": return <AlertTriangle className="w-4 h-4" />;
            case "down": return <XCircle className="w-4 h-4" />;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm p-0 gap-0 bg-card border-border shadow-2xl overflow-hidden sm:rounded-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        System Status
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="p-4 space-y-3">
                    {SERVICES.map((service) => (
                        <div
                            key={service.name}
                            className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-md", getStatusColor(service.status))}>
                                    <service.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-medium">{service.name}</div>
                                    <div className="text-[10px] text-muted-foreground font-mono">
                                        latency: {service.latency}
                                    </div>
                                </div>
                            </div>
                            <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border", getStatusColor(service.status))}>
                                {getStatusIcon(service.status)}
                                <span className="capitalize">{service.status}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-3 bg-muted/20 text-[10px] text-center text-muted-foreground border-t border-border">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </DialogContent>
        </Dialog>
    );
}
