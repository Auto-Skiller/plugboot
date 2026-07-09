"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Badge } from "@/components/core/ui/badge";
import { DollarSign, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function CodCashTracker() {
    return (
        <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200/60 dark:border-green-800/30">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-500">
                            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                            COD Cash Tracker
                        </CardTitle>
                        <CardDescription>Track cash on delivery flow & pending payments from couriers</CardDescription>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-700">
                        1.2M DA Pending
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-green-100/50 dark:border-green-800/30">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                            <Truck className="h-3.5 w-3.5" /> With Couriers
                        </div>
                        <p className="text-xl font-bold">450,000 DA</p>
                        <p className="text-[10px] text-green-600 dark:text-green-400 mt-1">158 Orders</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-green-100/50 dark:border-green-800/30">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                            <Clock className="h-3.5 w-3.5" /> Pending Remittance
                        </div>
                        <p className="text-xl font-bold">320,000 DA</p>
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-1">Yalidine: 200k</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-green-100/50 dark:border-green-800/30">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                            <CheckCircle className="h-3.5 w-3.5" /> Collected (Week)
                        </div>
                        <p className="text-xl font-bold">850,000 DA</p>
                        <p className="text-[10px] text-green-600 dark:text-green-400 mt-1">+12% vs Last Week</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-red-100/50 dark:border-red-900/30">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                            <AlertCircle className="h-3.5 w-3.5" /> Returns Cost
                        </div>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">-45,000 DA</p>
                        <p className="text-[10px] text-red-600 dark:text-red-400 mt-1">15 Returns</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
