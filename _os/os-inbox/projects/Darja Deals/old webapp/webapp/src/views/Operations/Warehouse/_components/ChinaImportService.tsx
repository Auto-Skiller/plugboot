"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Textarea } from "@/components/core/ui/textarea";
import { Badge } from "@/components/core/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/core/ui/tabs";
import { Container, Package, Search, Ship, CheckCircle2, CircleDashed, ArrowRight, Upload } from "lucide-react";

interface ImportRequest {
    id: string;
    productName: string;
    status: 'searching' | 'quoting' | 'ordered' | 'shipped' | 'customs' | 'delivered';
    date: string;
    updates: number;
}

const MOCK_REQUESTS: ImportRequest[] = [
    { id: "req-1", productName: "Smart Watched Series 8 Clones", status: 'customs', date: "2024-12-01", updates: 2 },
    { id: "req-2", productName: "Bamboo Fiber Towels", status: 'quoting', date: "2024-12-15", updates: 1 },
];

const STAGES = [
    { id: 'searching', label: 'Searching', icon: Search },
    { id: 'quoting', label: 'Quoting', icon: Container },
    { id: 'ordered', label: 'Ordered', icon: Package },
    { id: 'shipped', label: 'Shipped', icon: Ship },
    { id: 'customs', label: 'Customs', icon: CheckCircle2 },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export function ChinaImportService() {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Ship className="h-5 w-5 text-red-600" />
                            China Import Service
                        </CardTitle>
                        <CardDescription>
                            Let DG handle sourcing, shipping, and customs for you.
                        </CardDescription>
                    </div>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                        Start New Request
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <Tabs defaultValue="active" className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="active">Active Requests</TabsTrigger>
                        <TabsTrigger value="new">New Request</TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="flex-1 space-y-4">
                        {MOCK_REQUESTS.map((req) => (
                            <div key={req.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="h-8 w-8 rounded-full p-0 flex items-center justify-center border-red-200 bg-red-50 text-red-600">
                                            {req.updates > 0 ? req.updates : <Container className="h-4 w-4" />}
                                        </Badge>
                                        <div>
                                            <h4 className="font-semibold text-sm">{req.productName}</h4>
                                            <p className="text-xs text-muted-foreground">Req ID: {req.id} • {req.date}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-xs gap-1">
                                        View Details <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative pt-2 pb-1">
                                    <div className="flex justify-between items-center text-xs relative z-10">
                                        {STAGES.map((stage, idx) => {
                                            const currentIdx = STAGES.findIndex(s => s.id === req.status);
                                            const isCompleted = idx <= currentIdx;
                                            const isActive = idx === currentIdx;
                                            const Icon = stage.icon;

                                            return (
                                                <div key={stage.id} className="flex flex-col items-center gap-1 group">
                                                    <div className={`
                                                        h-6 w-6 rounded-full flex items-center justify-center transition-colors
                                                        ${isActive ? 'bg-red-600 text-white' : (isCompleted ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground')}
                                                    `}>
                                                        <Icon className="h-3 w-3" />
                                                    </div>
                                                    <span className={`text-[10px] ${isActive ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{stage.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* Line background */}
                                    <div className="absolute top-[18px] left-3 right-3 h-0.5 bg-muted -z-0">
                                        <div
                                            className="h-full bg-red-200 transition-all duration-500"
                                            style={{ width: `${(STAGES.findIndex(s => s.id === req.status) / (STAGES.length - 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="new" className="space-y-4">
                        <div className="grid gap-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="product">Product Description</Label>
                                <Input id="product" placeholder="e.g. Wireless charger with fast charging..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Target Quantity</Label>
                                    <Input id="quantity" type="number" placeholder="1000" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Target Budget (DZD)</Label>
                                    <Input id="budget" placeholder="500,000" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Additional Specs / Notes</Label>
                                <Textarea id="notes" placeholder="Any specific requirements regarding packaging, logo..." />
                            </div>
                            <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors cursor-pointer">
                                <div className="text-center space-y-2">
                                    <div className="mx-auto h-10 w-10 text-muted-foreground bg-muted rounded-full flex items-center justify-center">
                                        <Upload className="h-5 w-5" />
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <span className="font-semibold text-primary">Click to upload</span> reference images
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button className="w-full bg-red-600 hover:bg-red-700 text-white">Submit Inquiry</Button>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="pt-2 border-t bg-muted/20">
                <p className="text-xs text-muted-foreground w-full text-center">
                    DG Service Fee: 5-10% depending on volume. Includes QC & Customs.
                </p>
            </CardFooter>
        </Card>
    );
}
