"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Textarea } from "@/components/core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import { Badge } from "@/components/core/ui/badge";
import { Video, Package, CheckCircle, Clock, Truck, Download, Plus, Info, Heart } from "lucide-react";
import { Sheet, SheetContent } from "@/components/core/ui/sheet";
import { toast } from "sonner";

// Mock Request Data
const MOCK_REQUESTS = [
    {
        id: "ugc_1",
        productName: "Wireless Headphones Pro",
        status: "delivered",
        createdAt: "2024-12-10",
        deliveredAt: "2024-12-20",
        style: "Unboxing + Review"
    },
    {
        id: "ugc_2",
        productName: "Smartwatch Elite",
        status: "in_production",
        createdAt: "2024-12-18",
        deliveredAt: null,
        style: "Tutorial"
    },
];

type RequestStatus = "request" | "product_received" | "in_production" | "delivered";

// Form component for the Right Panel
function UGCRequestForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
    const [productName, setProductName] = useState("");
    const [productDesc, setProductDesc] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");
    const [style, setStyle] = useState("unboxing");
    const [platform, setPlatform] = useState("instagram");

    const handleSubmit = () => {
        if (!productName || !shippingAddress) {
            toast.error("Please fill in required fields");
            return;
        }
        onSubmit({
            productName,
            productDesc,
            shippingAddress,
            style: style === "unboxing" ? "Unboxing" : style === "review" ? "Review" : "Tutorial",
            platform
        });
        // Reset
        setProductName("");
        setProductDesc("");
        setShippingAddress("");
    };

    return (
        <div className="space-y-4 p-4">
            <div className="space-y-2">
                <Label htmlFor="product-name">Product Name *</Label>
                <Input
                    id="product-name"
                    placeholder="e.g., Wireless Headphones Pro"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="product-desc">Product Description</Label>
                <Textarea
                    id="product-desc"
                    placeholder="Brief description, key features, target audience..."
                    rows={3}
                    value={productDesc}
                    onChange={(e) => setProductDesc(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="shipping">Shipping Address *</Label>
                <Textarea
                    id="shipping"
                    placeholder="Full address where you'll ship the product for UGC creation"
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="style">Content Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger id="style">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unboxing">Unboxing</SelectItem>
                            <SelectItem value="review">Product Review</SelectItem>
                            <SelectItem value="tutorial">Tutorial / How-to</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="platform">Target Platform</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger id="platform">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="tiktok">TikTok</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="youtube">YouTube</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* What's Included */}
            <div className="pt-3 border-t space-y-2">
                <p className="font-semibold text-sm">What&apos;s Included:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>1080p vertical video (optimized for stories/reels)</li>
                    <li>Professional editing with captions</li>
                    <li>Full commercial usage rights</li>
                    <li>Revision if needed</li>
                </ul>
            </div>

            {/* Pricing */}
            <div className="bg-muted/50 p-3 rounded-lg border">
                <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Pricing:</strong> Starting at 25,000 DZD per UGC piece
                </p>
            </div>

            <div className="flex gap-2">
                <Button variant="outline" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} className="flex-1 gap-2">
                    <Package className="h-4 w-4" /> Submit Request
                </Button>
            </div>
        </div>
    );
}

export function RequestUGCService() {
    const [requests, setRequests] = useState(MOCK_REQUESTS);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleNewRequest = () => {
        setIsSheetOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "request": return "bg-gray-500/10 text-gray-600 border-gray-500/30";
            case "product_received": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
            case "in_production": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
            case "delivered": return "bg-green-500/10 text-green-600 border-green-500/30";
            default: return "bg-muted";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "request": return <Package className="h-4 w-4" />;
            case "product_received": return <Truck className="h-4 w-4" />;
            case "in_production": return <Video className="h-4 w-4" />;
            case "delivered": return <CheckCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const formatStatus = (status: string) => {
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="space-y-4">
            {/* Header with Title and Action */}
            <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-[hsl(var(--accent-orange))]" />
                    <h2 className="text-xl font-bold">UGC Creator Service</h2>
                </div>
                <Button size="sm" className="gap-2" onClick={handleNewRequest}>
                    <Plus className="h-4 w-4" /> New Request
                </Button>
            </div>

            {/* Main Card: How It Works + Requests */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Your UGC Requests</CardTitle>
                    <CardDescription>Professional UGC: unboxing, reviews, tutorials created by our team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* How It Works - Detailed Steps */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-red-500/5 to-pink-500/5 border border-red-500/10">
                        <div className="flex items-center gap-2 mb-3">
                            <Info className="h-4 w-4 text-red-500" />
                            <span className="font-semibold text-sm">How It Works</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="flex items-start gap-2">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">1</div>
                                <div>
                                    <p className="text-xs font-medium">Submit Request</p>
                                    <p className="text-[10px] text-muted-foreground">Fill out the form with product details</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">2</div>
                                <div>
                                    <p className="text-xs font-medium">Ship Product</p>
                                    <p className="text-[10px] text-muted-foreground">Send your product to our creation team</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">3</div>
                                <div>
                                    <p className="text-xs font-medium">Content Creation</p>
                                    <p className="text-[10px] text-muted-foreground">Professional UGC created (3-5 days)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">4</div>
                                <div>
                                    <p className="text-xs font-medium">Receive Files</p>
                                    <p className="text-[10px] text-muted-foreground">Download high-quality content</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Requests List */}
                    {requests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No requests yet</p>
                            <p className="text-xs">Click &quot;New Request&quot; to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {requests.map((request) => (
                                <div
                                    key={request.id}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${getStatusColor(request.status)}`}>
                                            {getStatusIcon(request.status)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{request.productName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {request.createdAt} • {request.style}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={`text-[10px] ${getStatusColor(request.status)}`}>
                                            {formatStatus(request.status)}
                                        </Badge>
                                        {request.status === "delivered" && (
                                            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
                                                <Download className="h-3 w-3" /> Download
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card >
            {/* Sheet for New Request */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto p-0">
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-semibold">New UGC Request</h2>
                            <p className="text-sm text-muted-foreground">Tell us about your product and content needs</p>
                        </div>
                        <div className="p-6">
                            <UGCRequestForm
                                onSubmit={(data) => {
                                    const newRequest = {
                                        id: `ugc_${Date.now()}`,
                                        productName: data.productName,
                                        status: "request" as const,
                                        createdAt: new Date().toISOString().split('T')[0],
                                        deliveredAt: null,
                                        style: data.style
                                    };
                                    setRequests(prev => [newRequest, ...prev]);
                                    toast.success("UGC request submitted! We'll contact you for shipping details.");
                                    setIsSheetOpen(false);
                                }}
                                onCancel={() => setIsSheetOpen(false)}
                            />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div >
    );
}
