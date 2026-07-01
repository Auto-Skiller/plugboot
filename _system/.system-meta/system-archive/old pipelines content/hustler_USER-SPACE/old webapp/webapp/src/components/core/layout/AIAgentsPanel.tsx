"use client";

import { useState } from "react";
import {
    Bot, Link2, Settings, Instagram, Facebook, Zap,
    MessageCircle, CheckCircle, XCircle, Play, Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/ui/button";
import { Switch } from "@/components/core/ui/switch";
import { Badge } from "@/components/core/ui/badge";
import Link from "next/link";

// TikTok icon
function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
    );
}

interface AIAgentsPanelProps {
    activeTab: number;
}

export function AIAgentsPanel({ activeTab }: AIAgentsPanelProps) {
    const [accounts, setAccounts] = useState({
        instagram: { connected: true, enabled: true },
        facebook: { connected: true, enabled: false },
        tiktok: { connected: false, enabled: false }
    });

    const [testMessage, setTestMessage] = useState("");
    const [testResponse, setTestResponse] = useState("");

    const toggleAccount = (platform: 'instagram' | 'facebook' | 'tiktok') => {
        if (!accounts[platform].connected) return;
        setAccounts(prev => ({
            ...prev,
            [platform]: { ...prev[platform], enabled: !prev[platform].enabled }
        }));
    };

    const handleTest = () => {
        if (!testMessage.trim()) return;
        setTestResponse("Salam! Yes, we have that product in stock. Would you like to place an order? Delivery is available to all 58 wilayas! 🚚");
    };

    // Tab 0: General - Connected Accounts Overview
    if (activeTab === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Instagram */}
                <div className={cn(
                    "p-4 rounded-xl border transition-all",
                    accounts.instagram.connected
                        ? "border-pink-500/30 bg-pink-500/5"
                        : "border-border bg-muted/30"
                )}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Instagram className="h-5 w-5 text-pink-500" />
                            <span className="font-medium">Instagram</span>
                        </div>
                        {accounts.instagram.connected ? (
                            <Badge variant="outline" className="text-green-500 border-green-500/30">Connected</Badge>
                        ) : (
                            <Badge variant="outline">Not Connected</Badge>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">AI Agent Active</span>
                        <Switch
                            checked={accounts.instagram.enabled}
                            onCheckedChange={() => toggleAccount('instagram')}
                            disabled={!accounts.instagram.connected}
                        />
                    </div>
                </div>

                {/* Facebook */}
                <div className={cn(
                    "p-4 rounded-xl border transition-all",
                    accounts.facebook.connected
                        ? "border-blue-500/30 bg-blue-500/5"
                        : "border-border bg-muted/30"
                )}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Facebook className="h-5 w-5 text-blue-500" />
                            <span className="font-medium">Facebook</span>
                        </div>
                        {accounts.facebook.connected ? (
                            <Badge variant="outline" className="text-green-500 border-green-500/30">Connected</Badge>
                        ) : (
                            <Badge variant="outline">Not Connected</Badge>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">AI Agent Active</span>
                        <Switch
                            checked={accounts.facebook.enabled}
                            onCheckedChange={() => toggleAccount('facebook')}
                            disabled={!accounts.facebook.connected}
                        />
                    </div>
                </div>

                {/* TikTok */}
                <div className={cn(
                    "p-4 rounded-xl border transition-all",
                    accounts.tiktok.connected
                        ? "border-foreground/30 bg-foreground/5"
                        : "border-border bg-muted/30"
                )}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <TikTokIcon className="h-5 w-5" />
                            <span className="font-medium">TikTok</span>
                        </div>
                        <Button size="sm" variant="outline">Connect</Button>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">AI Agent Active</span>
                        <Switch
                            checked={accounts.tiktok.enabled}
                            onCheckedChange={() => toggleAccount('tiktok')}
                            disabled={!accounts.tiktok.connected}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Tab 1: Configuration - AI Settings
    if (activeTab === 1) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Bot className="h-4 w-4 text-primary" />
                        AI Persona
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                            <span className="text-sm">Agent Name</span>
                            <span className="text-sm font-medium">Sarah</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                            <span className="text-sm">Tone</span>
                            <span className="text-sm font-medium">Friendly & Professional</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                            <span className="text-sm">Language</span>
                            <span className="text-sm font-medium">Darija (Algerian)</span>
                        </div>
                    </div>
                    <Link href="/operations/ai-sales-agent?tab=trainer">
                        <Button variant="outline" className="w-full gap-2">
                            <Settings className="h-4 w-4" />
                            Configure AI Trainer
                        </Button>
                    </Link>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        Quick Test
                    </h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Test a customer message..."
                            className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm"
                            value={testMessage}
                            onChange={(e) => setTestMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTest()}
                        />
                        <Button size="sm" onClick={handleTest}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    {testResponse && (
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                            <div className="flex items-center gap-2 mb-1">
                                <Bot className="h-3 w-3 text-primary" />
                                <span className="text-xs font-medium text-primary">AI Response</span>
                            </div>
                            <p className="text-sm">{testResponse}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Tab 2: Logs - Recent Activity
    if (activeTab === 2) {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Recent AI Conversations</h3>
                    <Link href="/operations/ai-sales-agent">
                        <Button size="sm" variant="outline">View All</Button>
                    </Link>
                </div>
                <div className="space-y-2">
                    {[
                        { platform: "instagram", customer: "Ahmed M.", message: "Order confirmed for 2 items", time: "2 min ago" },
                        { platform: "facebook", customer: "Fatima K.", message: "Answered pricing question", time: "15 min ago" },
                        { platform: "instagram", customer: "Youcef B.", message: "Sent tracking info", time: "1 hour ago" },
                    ].map((log, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                            {log.platform === 'instagram' && <Instagram className="h-4 w-4 text-pink-500" />}
                            {log.platform === 'facebook' && <Facebook className="h-4 w-4 text-blue-500" />}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{log.customer}</p>
                                <p className="text-xs text-muted-foreground truncate">{log.message}</p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">{log.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return null;
}
