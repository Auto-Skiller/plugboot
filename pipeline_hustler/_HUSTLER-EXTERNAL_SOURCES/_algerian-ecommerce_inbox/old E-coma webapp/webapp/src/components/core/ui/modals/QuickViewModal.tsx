import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/core/ui/dialog";
import { Button } from "@/components/core/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/core/ui/tabs";
import { ScrollArea } from "@/components/core/ui/scroll-area";
import { Badge } from "@/components/core/ui/badge";
import { Separator } from "@/components/core/ui/separator";
import { Edit, ExternalLink, MoreVertical, X, Calendar, User, Mail, Phone, CreditCard, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickViewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data?: any; // Generic data input for now (Order, Customer, Product)
    type?: "order" | "customer" | "product";
}

export function QuickViewModal({
    open,
    onOpenChange,
    data,
    type = "order"
}: QuickViewModalProps) {
    if (!data) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                {/* Header with Actions */}
                <div className="flex items-start justify-between p-6 border-b bg-muted/10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="uppercase text-[10px] tracking-wider">{type}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {new Date().toLocaleDateString()}
                            </span>
                        </div>
                        <DialogTitle className="text-2xl font-bold font-mono tracking-tight mr-8">{data.title || "Entity #12345"}</DialogTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="hidden sm:flex">
                            <Edit className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Sidebar / Summary (Left) */}
                    <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r bg-muted/5 p-6 space-y-6 overflow-y-auto">
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status</h4>
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200">Payment Paid</Badge>
                                <Badge className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-200">Unfulfilled</Badge>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2"><User className="w-4 h-4" /> Customer</h4>
                            <div className="space-y-1">
                                <p className="font-medium text-sm">Amine Khelif</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> amine.k@example.com</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> +213 555 123 456</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2"><Truck className="w-4 h-4" /> Shipping</h4>
                            <div className="p-3 bg-secondary/20 rounded-lg text-sm">
                                <p className="font-medium mb-1">Yalidine Express</p>
                                <p className="text-xs text-muted-foreground">Stop Desk, Alger Centre</p>
                                <p className="text-xs font-mono mt-2 text-primary">#TRK-882910</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content (Tabs) */}
                    <div className="flex-1 flex flex-col min-h-0 bg-background">
                        <Tabs defaultValue="details" className="flex-1 flex flex-col">
                            <div className="border-b px-6">
                                <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-6">
                                    <TabsTrigger value="details" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0">Item Details</TabsTrigger>
                                    <TabsTrigger value="timeline" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0">Timeline</TabsTrigger>
                                    <TabsTrigger value="notes" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0">Notes</TabsTrigger>
                                </TabsList>
                            </div>

                            <ScrollArea className="flex-1">
                                <TabsContent value="details" className="p-6 m-0 space-y-6">
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                                                <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-sm">Premium Wireless Earbuds</h4>
                                                            <p className="text-xs text-muted-foreground mt-0.5">Color: Black • Qty: 1</p>
                                                        </div>
                                                        <span className="font-mono font-medium text-sm">4,500 DA</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="flex justify-end pt-4 border-t mt-8">
                                            <div className="w-full max-w-xs space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Subtotal</span>
                                                    <span>13,500 DA</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Shipping</span>
                                                    <span>500 DA</span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between font-bold text-lg">
                                                    <span>Total</span>
                                                    <span>14,000 DA</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="timeline" className="p-6 m-0">
                                    <div className="space-y-6 pl-4 border-l-2 border-muted ml-2">
                                        {[
                                            { title: "Order Delivered", time: "2 hours ago", desc: "Package received by customer" },
                                            { title: "Out for Delivery", time: "5 hours ago", desc: "Driver: Mohamed B." },
                                            { title: "Payment Confirmed", time: "1 day ago", desc: "CCP payment verified" },
                                            { title: "Order Placed", time: "1 day ago", desc: "Customer placed order via Web" },
                                        ].map((event, idx) => (
                                            <div key={idx} className="relative">
                                                <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium leading-none">{event.title}</p>
                                                    <p className="text-xs text-muted-foreground">{event.time}</p>
                                                    <p className="text-sm text-foreground/80 mt-1">{event.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                                <TabsContent value="notes" className="p-6 m-0">
                                    <div className="h-32 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground text-sm">
                                        No notes added yet
                                    </div>
                                </TabsContent>
                            </ScrollArea>
                        </Tabs>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
