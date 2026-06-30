"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Layout, MousePointer, Eye, X } from "lucide-react";

export default function PopupsPage() {
    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Popups & Sticky Bars</h1>
                    <p className="text-lg text-slate-600 mt-2">Capture leads and reduce cart abandonment.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Layout className="h-4 w-4" />
                    Create New Campaign
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { name: "Exit Intent Offer", type: "Popup", trigger: "Exit Intent", conversion: "12.5%", status: "Active" },
                        { name: "Free Shipping Bar", type: "Sticky Bar", trigger: "Page Load", conversion: "5.2%", status: "Active" },
                        { name: "Newsletter Signup", type: "Popup", trigger: "Scroll 50%", conversion: "3.1%", status: "Paused" },
                        { name: "Flash Sale Countdown", type: "Sticky Bar", trigger: "Page Load", conversion: "8.9%", status: "Draft" },
                    ].map((campaign) => (
                        <Card key={campaign.name} className="border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline">{campaign.type}</Badge>
                                    <Badge className={campaign.status === "Active" ? "bg-green-500" : "bg-slate-400"}>{campaign.status}</Badge>
                                </div>
                                <CardTitle className="text-lg mt-2">{campaign.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between text-sm text-slate-500 mt-2">
                                    <span>Trigger: {campaign.trigger}</span>
                                    <span className="font-bold text-slate-900">{campaign.conversion} Conv.</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-6">
                    <Card className="border-slate-200 bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute top-2 right-2">
                            <X className="h-5 w-5 text-slate-400 cursor-pointer hover:text-white" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-white text-center">Wait! Don&apos;t Go!</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-slate-300 mb-6">Get 10% OFF your first order if you sign up now.</p>
                            <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold">
                                Claim Discount
                            </Button>
                            <p className="text-xs text-slate-500 mt-4">No thanks, I hate saving money.</p>
                        </CardContent>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />
                    </Card>
                    <p className="text-center text-sm text-slate-500">Live Preview: Exit Intent Popup</p>
                </div>
            </div>
        </div>
    );
}
