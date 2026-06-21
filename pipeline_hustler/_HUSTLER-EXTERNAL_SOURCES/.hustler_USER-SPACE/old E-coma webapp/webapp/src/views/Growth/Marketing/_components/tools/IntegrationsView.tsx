"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Switch } from "@/components/core/ui/switch";
import {
    Link2, CheckCircle, XCircle, Settings, RefreshCw,
    Instagram, Facebook, Video, MessageCircle, Phone
} from "lucide-react";
import { toast } from "sonner";

// Mock integrations
const INTEGRATIONS = [
    {
        id: "instagram",
        name: "Instagram Business",
        icon: Instagram,
        color: "text-pink-500",
        bg: "bg-pink-50 dark:bg-pink-950/20",
        connected: true,
        account: "@store_dz",
        features: ["Auto-reply comments", "Story mentions", "DM automation"]
    },
    {
        id: "facebook",
        name: "Facebook Page",
        icon: Facebook,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-950/20",
        connected: true,
        account: "Store DZ Official",
        features: ["Page messaging", "Comment moderation", "Ad management"]
    },
    {
        id: "tiktok",
        name: "TikTok Business",
        icon: Video,
        color: "text-black dark:text-white",
        bg: "bg-gray-50 dark:bg-gray-950/20",
        connected: false,
        account: null,
        features: ["Analytics access", "Comment replies", "Trend tracking"]
    },
    {
        id: "whatsapp",
        name: "WhatsApp Business",
        icon: MessageCircle,
        color: "text-green-500",
        bg: "bg-green-50 dark:bg-green-950/20",
        connected: true,
        account: "+213 555 123 456",
        features: ["Order confirmations", "Shipping updates", "Customer support"]
    },
    {
        id: "sms",
        name: "SMS Gateway",
        icon: Phone,
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-950/20",
        connected: false,
        account: null,
        features: ["Bulk SMS", "Order notifications", "Marketing campaigns"]
    },
];

export default function IntegrationsView() {
    const [integrations, setIntegrations] = useState(INTEGRATIONS);

    const handleConnect = (id: string) => {
        toast.info(`Connecting to ${id}... (Mock - would open OAuth flow)`);

        // Simulate connection
        setTimeout(() => {
            setIntegrations(prev => prev.map(int =>
                int.id === id
                    ? { ...int, connected: true, account: "Connected Account" }
                    : int
            ));
            toast.success(`${id} connected successfully!`);
        }, 1500);
    };

    const handleDisconnect = (id: string) => {
        setIntegrations(prev => prev.map(int =>
            int.id === id
                ? { ...int, connected: false, account: null }
                : int
        ));
        toast.success(`${id} disconnected`);
    };

    const connectedCount = integrations.filter(i => i.connected).length;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Link2 className="h-5 w-5 text-indigo-500" />
                            Platform Integrations
                        </CardTitle>
                        <CardDescription>
                            Connect your social media and messaging platforms
                        </CardDescription>
                    </div>
                    <Badge variant={connectedCount >= 3 ? "default" : "secondary"}>
                        {connectedCount}/{integrations.length} Connected
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {integrations.map((integration) => {
                    const Icon = integration.icon;
                    return (
                        <div
                            key={integration.id}
                            className={`p-4 rounded-xl border transition-all ${integration.connected ? integration.bg : "bg-muted/30"}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${integration.connected ? "bg-white dark:bg-background" : "bg-muted"}`}>
                                        <Icon className={`h-6 w-6 ${integration.color}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold">{integration.name}</p>
                                            {integration.connected ? (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        {integration.connected && integration.account && (
                                            <p className="text-sm text-muted-foreground">{integration.account}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {integration.connected ? (
                                        <>
                                            <Button variant="ghost" size="icon">
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDisconnect(integration.id)}
                                            >
                                                Disconnect
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() => handleConnect(integration.id)}
                                            className="gap-2"
                                        >
                                            <Link2 className="h-4 w-4" /> Connect
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Features */}
                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                                {integration.features.map((feature, i) => (
                                    <Badge
                                        key={i}
                                        variant="outline"
                                        className={`text-xs ${integration.connected ? "" : "opacity-50"}`}
                                    >
                                        {feature}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Sync Button */}
                <div className="pt-4 flex justify-center">
                    <Button variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Sync All Connections
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
