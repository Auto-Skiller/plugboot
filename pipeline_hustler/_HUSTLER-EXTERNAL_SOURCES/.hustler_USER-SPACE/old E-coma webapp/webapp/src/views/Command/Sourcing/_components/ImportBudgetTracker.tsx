"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Progress } from "@/components/core/ui/progress";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/core/ui/dialog";
import { Plane, AlertCircle, Calendar, Plus, History } from "lucide-react";

interface ImportTrip {
    id: string;
    date: string;
    value: number;
    description: string;
}

const MOCK_TRIPS: ImportTrip[] = [
    { id: "t1", date: "2025-12-10", value: 450000, description: "Electronics Batch A" },
    { id: "t2", date: "2025-11-20", value: 800000, description: "Winter Clothing Stock" },
    { id: "t3", date: "2025-10-05", value: 200000, description: "Accessories Restock" },
];

export function ImportBudgetTracker() {
    // Mock data based on Cabnas limit (1.8M DZD per trip)
    const tripLimit = 1800000; // 1.8M DZD per trip limit
    const currentTripValue = 1450000; // Current accumulating value for the "Next" or "Current" trip

    // Calculate yearly totals if needed, but the rule is per trip usually + frequency
    const percentage = (currentTripValue / tripLimit) * 100;
    const isWarning = percentage > 80;

    const tripsThisYear = MOCK_TRIPS.length;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Plane className="h-4 w-4 text-purple-500" />
                            Cabas Import Limit
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Track your 1.8M DZD/trip allowance
                        </CardDescription>
                    </div>
                    {isWarning && (
                        <Badge variant="destructive" className="text-[10px]">
                            Near Limit
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {/* Current Trip Progress */}
                <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Current Trip Plan</span>
                        <span>{(currentTripValue / 1000).toFixed(0)}k / {(tripLimit / 1000).toFixed(0)}k DZD</span>
                    </div>
                    <Progress value={percentage} className={`h-2 ${isWarning ? "bg-red-100 dark:bg-red-900/20" : ""}`} />
                    <p className="text-xs text-muted-foreground text-right">
                        {(tripLimit - currentTripValue).toLocaleString()} DZD remaining
                    </p>
                    {isWarning && (
                        <div className="flex gap-2 items-start p-2 mt-2 rounded bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-200 text-xs">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>Approaching limit. Exceeding 1.8M DZD risks customs seizure.</p>
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 border rounded flex flex-col gap-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Monthly Limit
                        </span>
                        <span className="font-semibold">
                            {MOCK_TRIPS.filter(t => t.date.startsWith("2025-12")).length} / 2 Trips Used
                        </span>
                    </div>
                    <div className="p-2 border rounded flex flex-col gap-1">
                        <span className="text-muted-foreground flex items-center gap-1">
                            <History className="h-3 w-3" /> Left This Month
                        </span>
                        <span className="font-semibold text-green-600">
                            {2 - MOCK_TRIPS.filter(t => t.date.startsWith("2025-12")).length} Trips Remaining
                        </span>
                    </div>
                </div>

                {/* Recent Trips List */}
                <div className="flex-1 space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground">Recent Imports</h4>
                    <div className="space-y-2 max-h-[150px] overflow-auto pr-1">
                        {MOCK_TRIPS.map(trip => (
                            <div key={trip.id} className="flex justify-between items-center text-xs p-2 border rounded hover:bg-muted/50">
                                <div>
                                    <p className="font-medium">{trip.description}</p>
                                    <p className="text-muted-foreground">{trip.date}</p>
                                </div>
                                <span className="font-semibold">{(trip.value / 1000).toFixed(0)}k DA</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full gap-2" size="sm">
                            <Plus className="h-4 w-4" /> Log New Import
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Log New Import Trip</DialogTitle>
                            <DialogDescription>Add details for your recent cabas import.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="desc">Description</Label>
                                <Input id="desc" placeholder="e.g. Winter Clothing Batch" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Trip Date</Label>
                                <Input id="date" type="date" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">Total Value (DZD)</Label>
                                <Input id="value" type="number" placeholder="0.00" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button>Save Trip</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
