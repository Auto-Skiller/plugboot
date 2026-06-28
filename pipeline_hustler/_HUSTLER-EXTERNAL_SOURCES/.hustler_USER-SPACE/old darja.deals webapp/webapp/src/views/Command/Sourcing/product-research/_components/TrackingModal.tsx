"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/core/ui/dialog";
import { Button } from "@/components/core/ui/button";
import { Checkbox } from "@/components/core/ui/checkbox";
import { Label } from "@/components/core/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/core/ui/radio-group";
import { Bell, Mail, TrendingUp, DollarSign, MessageCircle, AlertCircle } from "lucide-react";
import { trackItem } from "@/lib/tracking";

interface TrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        id: number;
        type: 'ad' | 'topic' | 'product' | 'report';
        title: string;
    };
    onSave?: () => void;
}

const TRIGGER_OPTIONS = {
    ad: [
        { id: 'engagement', label: 'Engagement spikes', icon: TrendingUp },
        { id: 'conversion', label: 'Conversion rate changes', icon: DollarSign },
        { id: 'newAds', label: 'New similar ads', icon: AlertCircle }
    ],
    topic: [
        { id: 'mentions', label: 'New mentions', icon: MessageCircle },
        { id: 'engagement', label: 'Engagement spikes', icon: TrendingUp },
        { id: 'sentiment', label: 'Sentiment changes', icon: AlertCircle }
    ],
    product: [
        { id: 'price', label: 'Price changes', icon: DollarSign },
        { id: 'reviews', label: 'New reviews', icon: MessageCircle },
        { id: 'availability', label: 'Availability changes', icon: AlertCircle }
    ],
    report: [
        { id: 'updates', label: 'Report updates', icon: AlertCircle },
        { id: 'newData', label: 'New data available', icon: TrendingUp }
    ]
};

export default function TrackingModal({ isOpen, onClose, item, onSave }: TrackingModalProps) {
    const [browserNotifications, setBrowserNotifications] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(false);
    const [frequency, setFrequency] = useState<'instant' | 'daily' | 'weekly'>('daily');
    const [selectedTriggers, setSelectedTriggers] = useState<string[]>(['engagement']);

    const triggers = TRIGGER_OPTIONS[item.type] || [];

    const handleTriggerToggle = (triggerId: string) => {
        setSelectedTriggers(prev =>
            prev.includes(triggerId)
                ? prev.filter(id => id !== triggerId)
                : [...prev, triggerId]
        );
    };

    const handleSave = () => {
        // Save tracking settings
        trackItem({
            type: item.type,
            itemId: item.id,
            title: item.title,
            notificationMethods: {
                browser: browserNotifications,
                email: emailAlerts
            },
            frequency,
            triggers: selectedTriggers
        });

        onSave?.();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-orange-500" />
                        Track: {item.title}
                    </DialogTitle>
                    <DialogDescription>
                        Configure how you want to be notified about updates
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Notification Methods */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Notification Methods</Label>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="browser"
                                checked={browserNotifications}
                                onCheckedChange={(checked) => setBrowserNotifications(checked as boolean)}
                            />
                            <label
                                htmlFor="browser"
                                className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                <Bell className="h-4 w-4" />
                                Browser Notifications
                            </label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="email"
                                checked={emailAlerts}
                                onCheckedChange={(checked) => setEmailAlerts(checked as boolean)}
                            />
                            <label
                                htmlFor="email"
                                className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                <Mail className="h-4 w-4" />
                                Email Alerts
                            </label>
                        </div>
                    </div>

                    {/* Update Frequency */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Update Frequency</Label>
                        <RadioGroup value={frequency} onValueChange={(value: any) => setFrequency(value)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="instant" id="instant" />
                                <Label htmlFor="instant" className="font-normal cursor-pointer">
                                    Instant - Get notified immediately
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="daily" id="daily" />
                                <Label htmlFor="daily" className="font-normal cursor-pointer">
                                    Daily - Daily digest summary
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="weekly" id="weekly" />
                                <Label htmlFor="weekly" className="font-normal cursor-pointer">
                                    Weekly - Weekly summary report
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Tracking Triggers */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Track for:</Label>
                        {triggers.map((trigger) => (
                            <div key={trigger.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={trigger.id}
                                    checked={selectedTriggers.includes(trigger.id)}
                                    onCheckedChange={() => handleTriggerToggle(trigger.id)}
                                />
                                <label
                                    htmlFor={trigger.id}
                                    className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    <trigger.icon className="h-4 w-4" />
                                    {trigger.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={selectedTriggers.length === 0}>
                        <Bell className="h-4 w-4 mr-2" />
                        Start Tracking
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
