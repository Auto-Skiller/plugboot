"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Switch } from "@/components/core/ui/switch";
import { Badge } from "@/components/core/ui/badge";
import { ShoppingCart, Plus, DollarSign, ArrowRight } from "lucide-react";

export default function CheckoutBumpPage() {
    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Checkout Bump</h1>
                    <p className="text-lg text-slate-600 mt-2">Increase AOV with one-click upsells at checkout.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Add Bump Offer
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-slate-200">
                        <CardHeader>
                            <CardTitle>Active Bumps</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { product: "Extended Warranty (1 Year)", price: "$9.99", takeRate: "24%", revenue: "$1,240" },
                                { product: "Priority Shipping", price: "$4.99", takeRate: "45%", revenue: "$3,450" },
                                { product: "Mystery Gift Box", price: "$19.99", takeRate: "12%", revenue: "$890" },
                            ].map((bump) => (
                                <div key={bump.product} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-100 p-2 rounded-md">
                                            <ShoppingCart className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{bump.product}</div>
                                            <div className="text-sm text-slate-500">Price: {bump.price}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-8 text-center">
                                        <div>
                                            <div className="font-bold text-slate-900">{bump.takeRate}</div>
                                            <div className="text-xs text-slate-500">Take Rate</div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-green-600">{bump.revenue}</div>
                                            <div className="text-xs text-slate-500">Revenue</div>
                                        </div>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-2 border-dashed border-red-500 bg-red-50 p-4 relative">
                        <div className="absolute -top-3 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold uppercase">
                            One-Time Offer
                        </div>
                        <div className="flex items-start gap-3 mt-2">
                            <input type="checkbox" className="mt-1 w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500" />
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Yes, Add Extended Warranty for $9.99</h4>
                                <p className="text-xs text-slate-600 mt-1">Protect your purchase for a full year. Covers accidental damage and defects. Usually $29.99!</p>
                            </div>
                        </div>
                    </Card>
                    <p className="text-center text-sm text-slate-500">Preview: How it looks on checkout</p>
                </div>
            </div>
        </div>
    );
}
