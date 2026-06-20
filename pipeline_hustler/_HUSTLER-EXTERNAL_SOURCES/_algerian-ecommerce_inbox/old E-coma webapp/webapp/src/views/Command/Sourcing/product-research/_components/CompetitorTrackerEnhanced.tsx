"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/core/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/core/ui/dialog";
import {
    Eye, TrendingUp, TrendingDown, Bell, Plus, Facebook, Instagram,
    Video, Image, Layers, DollarSign, AlertTriangle, ExternalLink,
    Users, Calendar, Globe, Megaphone, ShoppingBag, CheckCircle2
} from "lucide-react";
import {
    COMPETITORS, COMPETITOR_ADS, COMPETITOR_PRODUCTS, COMPETITOR_ALERTS,
    type Competitor, type CompetitorAd, type CompetitorProduct, type CompetitorAlert
} from "@/data/mock-research-data";

function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
    if (platform === "instagram") return <Instagram className={className} />;
    if (platform === "facebook") return <Facebook className={className} />;
    return null;
}

function AdTypeIcon({ type, className }: { type: string; className?: string }) {
    if (type === "video") return <Video className={className} aria-label="Video ad type" />;
    if (type === "image") return <Image className={className} aria-label="Image ad type" />;
    if (type === "carousel") return <Layers className={className} aria-label="Carousel ad type" />;
    return null;
}

export default function CompetitorTrackerEnhanced() {
    const [selectedCompetitor, setSelectedCompetitor] = useState<number | null>(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [alerts, setAlerts] = useState(COMPETITOR_ALERTS);

    const unreadAlerts = alerts.filter(a => !a.read).length;

    // Get data for selected competitor or all
    const filteredAds = selectedCompetitor
        ? COMPETITOR_ADS.filter(ad => ad.competitorId === selectedCompetitor)
        : COMPETITOR_ADS;

    const filteredProducts = selectedCompetitor
        ? COMPETITOR_PRODUCTS.filter(p => p.competitorId === selectedCompetitor)
        : COMPETITOR_PRODUCTS;

    const filteredAlerts = selectedCompetitor
        ? alerts.filter(a => a.competitorId === selectedCompetitor)
        : alerts;

    const markAlertAsRead = (alertId: number) => {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, read: true } : a));
    };

    const getCompetitorName = (id: number) => COMPETITORS.find(c => c.id === id)?.name || "Unknown";

    const getAlertIcon = (type: string) => {
        if (type === "new_ad") return <Megaphone className="h-4 w-4 text-blue-500" />;
        if (type === "price_change") return <DollarSign className="h-4 w-4 text-amber-500" />;
        if (type === "new_product") return <ShoppingBag className="h-4 w-4 text-green-500" />;
        return <Bell className="h-4 w-4" />;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-500" />
                        Competitor Tracker
                        {unreadAlerts > 0 && (
                            <Badge variant="destructive" className="ml-2 animate-pulse">{unreadAlerts} new</Badge>
                        )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Track competitor FB pages, ads, prices, and product launches
                    </p>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Competitor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add Competitor</DialogTitle>
                            <DialogDescription>
                                Enter a Facebook page URL to start tracking a competitor.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fb-url">Facebook Page URL *</Label>
                                <Input id="fb-url" placeholder="https://facebook.com/competitor-page" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="comp-name">Competitor Name (optional)</Label>
                                <Input id="comp-name" placeholder="Will be auto-detected from page" />
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    📊 We&apos;ll automatically track: active ads, product prices, and new launches
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                            <Button onClick={() => setShowAddDialog(false)}>Start Tracking</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Competitor Pills */}
            <div className="flex flex-wrap gap-2">
                <Badge
                    variant={selectedCompetitor === null ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1"
                    onClick={() => setSelectedCompetitor(null)}
                >
                    All Competitors
                </Badge>
                {COMPETITORS.map(comp => (
                    <Badge
                        key={comp.id}
                        variant={selectedCompetitor === comp.id ? "default" : "outline"}
                        className="cursor-pointer px-3 py-1 gap-1"
                        onClick={() => setSelectedCompetitor(comp.id)}
                    >
                        <Facebook className="h-3 w-3" />
                        {comp.name}
                        <span className="text-xs opacity-70">({comp.followers})</span>
                    </Badge>
                ))}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="ads" className="gap-1">
                        Ads
                        {filteredAds.filter(a => a.isNew).length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                                {filteredAds.filter(a => a.isNew).length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="prices">Prices</TabsTrigger>
                    <TabsTrigger value="alerts" className="gap-1">
                        Alerts
                        {unreadAlerts > 0 && (
                            <span className="bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                                {unreadAlerts}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {COMPETITORS.map(comp => (
                            <Card key={comp.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedCompetitor(comp.id)}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-bold flex items-center gap-2">
                                                <Facebook className="h-4 w-4 text-blue-500" />
                                                {comp.name}
                                            </h4>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Users className="h-3 w-3" /> {comp.followers} followers
                                            </p>
                                        </div>
                                        <Badge variant={comp.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                            {comp.status}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="p-2 bg-muted/50 rounded">
                                            <p className="text-lg font-bold">{COMPETITOR_ADS.filter(a => a.competitorId === comp.id).length}</p>
                                            <p className="text-[10px] text-muted-foreground">Active Ads</p>
                                        </div>
                                        <div className="p-2 bg-muted/50 rounded">
                                            <p className="text-lg font-bold">{COMPETITOR_PRODUCTS.filter(p => p.competitorId === comp.id).length}</p>
                                            <p className="text-[10px] text-muted-foreground">Products</p>
                                        </div>
                                        <div className="p-2 bg-muted/50 rounded">
                                            <p className="text-lg font-bold">{alerts.filter(a => a.competitorId === comp.id && !a.read).length}</p>
                                            <p className="text-[10px] text-muted-foreground">Alerts</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> Tracking since {comp.addedDate}
                                        </span>
                                        <ExternalLink className="h-3 w-3" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Recently Launched Products */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4 text-green-500" />
                                Recent Launches
                            </h4>
                            <Badge variant="outline" className="text-xs">Last 14 days</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredProducts.filter(p => p.isNew).map(product => (
                                <Card key={product.id} className="overflow-hidden hover:shadow-md transition-all border-green-100 dark:border-green-900/30">
                                    <div className="aspect-square bg-muted relative">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        <Badge className="absolute top-2 right-2 bg-green-500 shadow-sm text-[10px] h-4 px-1">NEW</Badge>
                                    </div>
                                    <CardContent className="p-2">
                                        <p className="text-[10px] text-muted-foreground truncate">{getCompetitorName(product.competitorId)}</p>
                                        <h5 className="font-bold text-xs truncate mb-1">{product.name}</h5>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-primary">{product.currentPrice.toLocaleString()} DA</span>
                                            <span className="text-[9px] text-muted-foreground">{product.launchedDate || "Recent"}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                {/* Ads Tab */}
                <TabsContent value="ads" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAds.map(ad => (
                            <Card key={ad.id} className={`hover:shadow-md transition-all ${ad.isNew ? 'ring-2 ring-blue-500' : ''}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <PlatformIcon platform={ad.platform} className="h-4 w-4" />
                                            <AdTypeIcon type={ad.adType} className="h-4 w-4 text-muted-foreground" />
                                            <Badge variant="secondary" className="text-xs capitalize">{ad.adType}</Badge>
                                            {ad.isNew && <Badge className="text-xs bg-blue-500">NEW</Badge>}
                                        </div>
                                        <Badge variant={ad.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                            {ad.status}
                                        </Badge>
                                    </div>
                                    <h4 className="font-semibold mb-2">{ad.headline}</h4>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        by {getCompetitorName(ad.competitorId)}
                                    </p>
                                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                        <div>
                                            <p className="text-muted-foreground text-xs">Spend Est.</p>
                                            <p className="font-bold text-xs">{ad.spendEstimate}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Engagement</p>
                                            <p className="font-bold text-green-500">{ad.engagement}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Started</p>
                                            <p className="font-bold text-xs">{ad.startDate}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full mt-3 gap-2">
                                        <ExternalLink className="h-3 w-3" />
                                        View in Ad Library
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Prices Tab */}
                <TabsContent value="prices" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Price Comparison Table</CardTitle>
                            <CardDescription>Compare your prices with competitors</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-3">Product</th>
                                            <th className="text-left py-2 px-3">Competitor</th>
                                            <th className="text-right py-2 px-3">Their Price</th>
                                            <th className="text-right py-2 px-3">Change</th>
                                            <th className="text-right py-2 px-3">Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map(product => {
                                            const priceChange = product.previousPrice
                                                ? ((product.currentPrice - product.previousPrice) / product.previousPrice * 100).toFixed(1)
                                                : null;
                                            const isDown = priceChange && parseFloat(priceChange) < 0;
                                            return (
                                                <tr key={product.id} className="border-b hover:bg-muted/50">
                                                    <td className="py-2 px-3 font-medium">{product.name}</td>
                                                    <td className="py-2 px-3 text-muted-foreground">{getCompetitorName(product.competitorId)}</td>
                                                    <td className="py-2 px-3 text-right font-bold">{product.currentPrice.toLocaleString()} DA</td>
                                                    <td className="py-2 px-3 text-right">
                                                        {priceChange && (
                                                            <Badge variant="outline" className={isDown ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}>
                                                                {isDown ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                                                                {priceChange}%
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="py-2 px-3 text-right text-muted-foreground text-xs">{product.lastUpdated}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Price History Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {filteredProducts.map(product => (
                            <Card key={product.id}>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold mb-2">{product.name}</h4>
                                    <p className="text-xs text-muted-foreground mb-3">{getCompetitorName(product.competitorId)}</p>
                                    <div className="space-y-1">
                                        {product.priceHistory.map((entry, idx) => (
                                            <div key={idx} className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">{entry.date}</span>
                                                <span className="font-medium">{entry.price.toLocaleString()} DA</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Alerts Tab */}
                <TabsContent value="alerts" className="space-y-3 mt-4">
                    {filteredAlerts.length === 0 ? (
                        <div className="text-center py-8">
                            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground">No alerts yet</p>
                        </div>
                    ) : (
                        filteredAlerts.map(alert => (
                            <Card key={alert.id} className={`transition-all ${!alert.read ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200' : ''}`}>
                                <CardContent className="p-4 flex items-start gap-3">
                                    <div className="p-2 rounded-full bg-muted">
                                        {getAlertIcon(alert.type)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">{alert.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(alert.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    {!alert.read && (
                                        <Button variant="ghost" size="sm" onClick={() => markAlertAsRead(alert.id)}>
                                            <CheckCircle2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
