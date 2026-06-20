"use client";

import { useState } from "react";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Video, ChevronRight, Sparkles, Package, Info, Clock, CheckCircle, Truck, AlertCircle } from "lucide-react";
import { Sheet, SheetContent } from "@/components/core/ui/sheet";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Textarea } from "@/components/core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock Data
const MOCK_REQUESTS = [
    { id: "R-1024", product: "Summer Collection Bundle", status: "production", date: "2 days ago", type: "Unboxing", price: "25,000 DZD" },
    { id: "R-1023", product: "Pro Wireless Earbuds", status: "shipping", date: "1 week ago", type: "Review", price: "30,000 DZD" },
    { id: "R-1020", product: "Gaming Keyboard", status: "completed", date: "2 weeks ago", type: "Tutorial", price: "25,000 DZD" },
];

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "production":
            return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-200 flex gap-1 items-center"><Video className="w-3 h-3" /> In Production</Badge>;
        case "shipping":
            return <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-200 flex gap-1 items-center"><Truck className="w-3 h-3" /> Await Product</Badge>;
        case "completed":
            return <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-200 flex gap-1 items-center"><CheckCircle className="w-3 h-3" /> Completed</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

// Sub-Component: Request List
function UGCRequestList({ onCreateNew }: { onCreateNew: () => void }) {
    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm text-muted-foreground">Recent Requests</h3>
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onCreateNew}>
                    + New Request
                </Button>
            </div>

            <div className="space-y-3">
                {MOCK_REQUESTS.map((req) => (
                    <div key={req.id} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h4 className="font-semibold text-sm">{req.product}</h4>
                                <p className="text-xs text-muted-foreground">{req.id} • {req.date}</p>
                            </div>
                            <StatusBadge status={req.status} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                            <div className="flex gap-2">
                                <span className="bg-muted px-2 py-0.5 rounded capitalize">{req.type}</span>
                                <span>{req.price}</span>
                            </div>
                            {req.status === "completed" && (
                                <span className="text-primary group-hover:underline">View Assets →</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Sub-Component: Request Form
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
    };

    return (
        <div className="space-y-4 p-4">
            {/* How It Works */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-3">
                    <Info className="h-4 w-4 text-orange-500" />
                    <span className="font-semibold text-sm">How It Works</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">1</div>
                        <span className="text-xs">Submit request</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">2</div>
                        <span className="text-xs">Ship product</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">3</div>
                        <span className="text-xs">We create UGC</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">4</div>
                        <span className="text-xs">Download files</span>
                    </div>
                </div>
            </div>

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
                    placeholder="Brief description, key features..."
                    rows={2}
                    value={productDesc}
                    onChange={(e) => setProductDesc(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="shipping">Shipping Address *</Label>
                <Textarea
                    id="shipping"
                    placeholder="Full address for product shipping"
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <Label htmlFor="style">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger id="style">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unboxing">Unboxing</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="tutorial">Tutorial</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger id="platform">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="tiktok">TikTok</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Pricing */}
            <div className="bg-muted/50 p-3 rounded-lg border text-xs">
                <strong>Pricing:</strong> Starting at 25,000 DZD • Includes editing, captions, full rights
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

// Wrapper to handle tabs in the panel
function UGCPanelContent({ initialView = "list", onClose }: { initialView?: "list" | "new", onClose: () => void }) {
    const [view, setView] = useState<"list" | "new">(initialView);

    return (
        <div className="flex flex-col h-full">
            <div className="flex border-b">
                <button
                    onClick={() => setView("list")}
                    className={cn(
                        "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                        view === "list" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    My Requests
                </button>
                <button
                    onClick={() => setView("new")}
                    className={cn(
                        "flex-1 py-3 text-sm font-medium border-b-2 transition-colors",
                        view === "new" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                >
                    New Request
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {view === "list" ? (
                    <UGCRequestList onCreateNew={() => setView("new")} />
                ) : (
                    <UGCRequestForm
                        onSubmit={(data) => {
                            toast.success("UGC request submitted! We'll contact you for shipping details.");
                            setView("list");
                        }}
                        onCancel={() => setView("list")}
                    />
                )}
            </div>
        </div>
    );
}

/**
 * UGCServiceBanner - Compact promotional banner for UGC Creator Service
 */
export function UGCServiceBanner() {
    const [requestCount] = useState(3); // Mock count
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [activeView, setActiveView] = useState<"list" | "new">("list");

    const openPanel = (view: "list" | "new") => {
        setActiveView(view);
        setIsSheetOpen(true);
    };

    return (
        <>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10 border border-orange-500/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500">
                        <Video className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">Need Pro UGC?</span>
                            <Badge variant="secondary" className="text-[10px] bg-orange-500/10 text-orange-600 border-orange-500/30">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Popular
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Unboxings, reviews, tutorials • Starting at 25,000 DZD
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {requestCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs bg-background/50 border hover:bg-background"
                            onClick={() => openPanel('list')}
                        >
                            {requestCount} active requests
                        </Button>
                    )}
                    <Button size="sm" className="gap-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600" onClick={() => openPanel('new')}>
                        New Request
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto p-0">
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-semibold">UGC Creator Service</h2>
                            <p className="text-sm text-muted-foreground">Manage your content requests</p>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <UGCPanelContent initialView={activeView} onClose={() => setIsSheetOpen(false)} />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
