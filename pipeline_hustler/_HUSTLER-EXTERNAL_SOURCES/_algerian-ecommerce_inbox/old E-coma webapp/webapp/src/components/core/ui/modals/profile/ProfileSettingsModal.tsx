"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/core/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/core/ui/tabs";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Switch } from "@/components/core/ui/switch";
import { User, Shield, CreditCard, Mail, Lock } from "lucide-react";

interface ProfileSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialTab?: string;
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
}

export function ProfileSettingsModal({
    open,
    onOpenChange,
    initialTab = "general",
    user = { name: "User", email: "user@riglify.com" }
}: ProfileSettingsModalProps) {
    const [activeTab, setActiveTab] = useState(initialTab);

    // Sync active tab with prop if modal opens (optional, depends on UX reference)
    // For now we trust the internal state or can reset it on open.

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] bg-background/95 backdrop-blur-xl p-0 gap-0 overflow-hidden h-[500px] flex flex-row">
                {/* Sidebar Navigation */}
                <div className="w-48 bg-muted/30 border-r p-4 flex flex-col gap-1">
                    <div className="mb-4 px-2">
                        <h3 className="font-semibold text-sm">Settings</h3>
                    </div>
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        orientation="vertical"
                        className="flex-col w-full"
                    >
                        <TabsList className="flex flex-col h-auto bg-transparent items-stretch gap-1 p-0 text-muted-foreground">
                            <TabsTrigger
                                value="general"
                                className="justify-start gap-2 px-3 py-2 data-[state=active]:bg-accent data-[state=active]:text-foreground shadow-none border-none rounded-md"
                            >
                                <User className="w-4 h-4" />
                                General
                            </TabsTrigger>
                            <TabsTrigger
                                value="security"
                                className="justify-start gap-2 px-3 py-2 data-[state=active]:bg-accent data-[state=active]:text-foreground shadow-none border-none rounded-md"
                            >
                                <Shield className="w-4 h-4" />
                                Team & Security
                            </TabsTrigger>
                            <TabsTrigger
                                value="billing"
                                className="justify-start gap-2 px-3 py-2 data-[state=active]:bg-accent data-[state=active]:text-foreground shadow-none border-none rounded-md"
                            >
                                <CreditCard className="w-4 h-4" />
                                Billing
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-0 border-0 w-full">

                        {/* General Tab */}
                        <TabsContent value="general" className="m-0 space-y-6 focus-visible:ring-0">
                            <div>
                                <h2 className="text-xl font-semibold mb-1">Profile Details</h2>
                                <p className="text-sm text-muted-foreground">Manage your public profile and preferences.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--accent-orange))] to-[hsl(var(--accent-blue))] flex items-center justify-center text-3xl font-bold text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <Button variant="outline" size="sm">Change Avatar</Button>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input id="name" defaultValue={user.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" defaultValue={user.email} disabled className="bg-muted/50" />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button>Save Changes</Button>
                            </div>
                        </TabsContent>

                        {/* Security/Team Tab */}
                        <TabsContent value="security" className="m-0 space-y-6 focus-visible:ring-0">
                            <div>
                                <h2 className="text-xl font-semibold mb-1">Team & Security</h2>
                                <p className="text-sm text-muted-foreground">Manage your team members and account security.</p>
                            </div>

                            <div className="space-y-4 pt-2">
                                <h3 className="text-sm font-medium pt-2 border-b pb-2">Password</h3>
                                <div className="grid gap-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Input id="current-password" type="password" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input id="new-password" type="password" />
                                </div>

                                <h3 className="text-sm font-medium pt-4 border-b pb-2">Two-Factor Authentication</h3>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <div className="font-medium text-sm">Enable 2FA</div>
                                        <div className="text-xs text-muted-foreground">Secure your account with 2FA</div>
                                    </div>
                                    <Switch />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Billing Tab */}
                        <TabsContent value="billing" className="m-0 space-y-6 focus-visible:ring-0">
                            <div>
                                <h2 className="text-xl font-semibold mb-1">Billing & Plans</h2>
                                <p className="text-sm text-muted-foreground">Manage your subscription and billing details.</p>
                            </div>

                            <div className="rounded-lg border p-4 bg-muted/20">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-semibold text-lg">Pro Plan</div>
                                        <div className="text-sm text-muted-foreground">$29/month • Billed monthly</div>
                                    </div>
                                    <div className="px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium border border-green-500/20">
                                        Active
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Button variant="outline" size="sm">Cancel Plan</Button>
                                    <Button size="sm">Upgrade Plan</Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">Payment Method</h3>
                                <div className="flex items-center gap-3 p-3 border rounded-md">
                                    <div className="p-2 bg-muted rounded">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Visa ending in 4242</div>
                                        <div className="text-xs text-muted-foreground">Expires 12/28</div>
                                    </div>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </div>
                            </div>
                        </TabsContent>

                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
