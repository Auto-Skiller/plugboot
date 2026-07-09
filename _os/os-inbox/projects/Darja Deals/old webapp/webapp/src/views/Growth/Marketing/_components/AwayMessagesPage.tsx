"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Switch } from "@/components/core/ui/switch";
import { Textarea } from "@/components/core/ui/textarea";
import { Clock, Calendar, MessageSquare } from "lucide-react";

export default function AwayMessagesPage() {
    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Away Messages</h1>
                    <p className="text-lg text-slate-600 mt-2">Auto-reply to customers when you&apos;re offline.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">Global Status:</span>
                    <Switch defaultChecked />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-indigo-600" />
                            Business Hours
                        </CardTitle>
                        <CardDescription>Set when away messages should trigger.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                            <div key={day} className="flex items-center justify-between text-sm">
                                <span className="w-24 font-medium text-slate-700">{day}</span>
                                <div className="flex gap-2 items-center">
                                    <input type="time" defaultValue="09:00" className="border border-slate-200 rounded px-2 py-1" />
                                    <span>to</span>
                                    <input type="time" defaultValue="17:00" className="border border-slate-200 rounded px-2 py-1" />
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100">
                            <span className="w-24 font-medium text-slate-700">Weekends</span>
                            <span className="text-slate-500 italic">Closed (Always Away)</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-indigo-600" />
                            Message Content
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Away Message</label>
                            <Textarea
                                className="h-32"
                                defaultValue="Hi there! Thanks for reaching out. We are currently closed. Our team will get back to you as soon as we open. In the meantime, check out our FAQ at riglify.com/help."
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">Save Message</Button>
                            <Button variant="outline" className="w-full">Preview</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
