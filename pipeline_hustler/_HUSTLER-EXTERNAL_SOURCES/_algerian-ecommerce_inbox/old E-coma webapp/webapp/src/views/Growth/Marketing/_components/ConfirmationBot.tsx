"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Textarea } from "@/components/core/ui/textarea";
import { Label } from "@/components/core/ui/label";
import { Badge } from "@/components/core/ui/badge";
import { Switch } from "@/components/core/ui/switch";
import { MessageSquare, Send, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const TEMPLATE_MESSAGES = {
    initial: "السلام عليكم! شكرا على طلبك. للتأكيد، الرجاء الرد ب YES. \n\nBonjour! Merci pour votre commande. Pour confirmer, répondez YES.",
    reminder: "تذكير: طلبك في انتظار التأكيد. الرجاء الرد ب YES لتأكيد.\n\nRappel: Votre commande attend confirmation. Répondez YES pour confirmer.",
    final: "آخر تذكير! سيتم إلغاء طلبك إذا لم تؤكد خلال 24 ساعة. رد ب YES.\n\nDernier rappel! Votre commande sera annulée dans 24h. Répondez YES."
};

export function ConfirmationBot() {
    const [enabled, setEnabled] = useState(true);
    const [initialMsg, setInitialMsg] = useState(TEMPLATE_MESSAGES.initial);
    const [reminderMsg, setReminderMsg] = useState(TEMPLATE_MESSAGES.reminder);
    const [finalMsg, setFinalMsg] = useState(TEMPLATE_MESSAGES.final);
    const [reminderDelay, setReminderDelay] = useState("24");

    const handleSave = () => {
        toast.success("Confirmation bot settings saved!");
    };

    const handleTest = () => {
        toast.info("Test message sent to your WhatsApp! (Mock)");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    Order Confirmation Bot
                </h2>
                <p className="text-sm text-muted-foreground">
                    Automatically send confirmation messages to customers via SMS/WhatsApp. Reduce manual work and improve confirmation rates.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Bot Configuration</CardTitle>
                                <CardDescription>Message templates in Darja & French</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="bot-enabled" className="text-sm">Enabled</Label>
                                <Switch id="bot-enabled" checked={enabled} onCheckedChange={setEnabled} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="initial">Initial Confirmation Message</Label>
                                <Badge variant="secondary" className="text-xs">Sent: Immediately</Badge>
                            </div>
                            <Textarea
                                id="initial"
                                rows={3}
                                value={initialMsg}
                                onChange={(e) => setInitialMsg(e.target.value)}
                                className="font-mono text-xs"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="reminder">Reminder Message</Label>
                                <Badge variant="secondary" className="text-xs">Sent: After 24h</Badge>
                            </div>
                            <Textarea
                                id="reminder"
                                rows={3}
                                value={reminderMsg}
                                onChange={(e) => setReminderMsg(e.target.value)}
                                className="font-mono text-xs"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="final">Final Reminder</Label>
                                <Badge variant="secondary" className="text-xs">Sent: After 48h</Badge>
                            </div>
                            <Textarea
                                id="final"
                                rows={3}
                                value={finalMsg}
                                onChange={(e) => setFinalMsg(e.target.value)}
                                className="font-mono text-xs"
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button onClick={handleSave} className="flex-1 gap-2">
                                <CheckCircle className="h-4 w-4" /> Save Settings
                            </Button>
                            <Button onClick={handleTest} variant="outline" className="gap-2">
                                <Send className="h-4 w-4" /> Test
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Info & Stats */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
                        <CardHeader>
                            <CardTitle className="text-lg">How It Works</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">1</div>
                                <div>
                                    <p className="font-medium text-sm">New Order Placed</p>
                                    <p className="text-xs text-muted-foreground">Customer completes checkout</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">2</div>
                                <div>
                                    <p className="font-medium text-sm">Auto-Message Sent</p>
                                    <p className="text-xs text-muted-foreground">Initial confirmation request via WhatsApp/SMS</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">3</div>
                                <div>
                                    <p className="font-medium text-sm">Customer Replies</p>
                                    <p className="text-xs text-muted-foreground">Responds with &quot;YES&quot; to confirm</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">4</div>
                                <div>
                                    <p className="font-medium text-sm">Status Updated</p>
                                    <p className="text-xs text-muted-foreground">Order marked as confirmed automatically</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Performance Stats</CardTitle>
                            <CardDescription>Last 30 days (Mock data)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/30 p-3 rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">Messages Sent</p>
                                    <p className="text-2xl font-bold">1,247</p>
                                </div>
                                <div className="bg-muted/30 p-3 rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">Response Rate</p>
                                    <p className="text-2xl font-bold text-green-600">82%</p>
                                </div>
                                <div className="bg-muted/30 p-3 rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">Avg Response Time</p>
                                    <p className="text-2xl font-bold">4.2h</p>
                                </div>
                                <div className="bg-muted/30 p-3 rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">Auto-Confirmed</p>
                                    <p className="text-2xl font-bold">1,023</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-500/30 bg-yellow-500/5">
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">
                                <strong className="text-foreground">Integration:</strong> WhatsApp Business API required. Contact support to set up your account.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
