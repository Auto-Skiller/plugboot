"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Badge } from "@/components/core/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/core/ui/dialog";
import { Search, Upload, Link2, Loader2, TrendingUp, DollarSign, Eye, Package, Camera } from "lucide-react";
import { FeatureFavoriteStar } from "@/components/core/ui/FeatureFavoriteStar";
import { RECENT_SEARCHES as RECENT_PRODUCTS } from "@/data/mock-research-data";
import type { RecentProduct } from "@/data/mock-research-data";

const ECOMMERCE_PLATFORMS = ["AliExpress", "Amazon", "Shopify", "eBay"];
const SOCIAL_PLATFORMS = ["Facebook", "Instagram", "TikTok"];
const SEARCH_METHODS = ["By Name", "By Photo", "By URL"];



export default function ProductSearch() {
    const [query, setQuery] = useState("");
    const [searchMethod, setSearchMethod] = useState("By Name");
    const [selectedEcommerce, setSelectedEcommerce] = useState<string[]>([]);
    const [selectedSocial, setSelectedSocial] = useState<string[]>([]);
    const [showScrapeModal, setShowScrapeModal] = useState(false);
    const [scrapingUrl, setScrapingUrl] = useState("");
    const [isScraping, setIsScraping] = useState(false);

    const togglePlatform = (platform: string, isSocial: boolean) => {
        if (isSocial) {
            setSelectedSocial(prev =>
                prev.includes(platform)
                    ? prev.filter(p => p !== platform)
                    : [...prev, platform]
            );
        } else {
            setSelectedEcommerce(prev =>
                prev.includes(platform)
                    ? prev.filter(p => p !== platform)
                    : [...prev, platform]
            );
        }
    };

    const handleUrlScrape = async () => {
        if (!scrapingUrl) return;

        setIsScraping(true);
        // Mock scraping - in production would call backend
        setTimeout(() => {
            setIsScraping(false);
            setShowScrapeModal(false);
            setScrapingUrl("");
            // Would add scraped product to results
        }, 2000);
    };

    const getProbabilityColor = (probability: number) => {
        if (probability >= 80) return "text-green-500";
        if (probability >= 60) return "text-yellow-500";
        return "text-orange-500";
    };

    const getProbabilityBadge = (probability: number) => {
        if (probability >= 80) return { variant: "default" as const, label: "High" };
        if (probability >= 60) return { variant: "secondary" as const, label: "Medium" };
        return { variant: "outline" as const, label: "Low" };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Search className="h-5 w-5 text-blue-500" />
                    Product Search
                    <FeatureFavoriteStar featureId="research-search" size="md" />
                </h3>
                <p className="text-sm text-muted-foreground">
                    Find winning products across e-commerce and social media platforms
                </p>
            </div>

            {/* Compact Filters - All in One Row */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg">
                {/* Filters Label */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">Filters:</span>
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-border" />

                {/* E-commerce Platforms */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium whitespace-nowrap">E-commerce:</span>
                    <div className="flex flex-wrap gap-1">
                        {ECOMMERCE_PLATFORMS.map(platform => (
                            <Badge
                                key={platform}
                                variant={selectedEcommerce.includes(platform) ? "default" : "outline"}
                                className="cursor-pointer text-xs"
                                onClick={() => togglePlatform(platform, false)}
                            >
                                {platform}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-border" />

                {/* Social Media Platforms */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium whitespace-nowrap">Social:</span>
                    <div className="flex flex-wrap gap-1">
                        {SOCIAL_PLATFORMS.map(platform => (
                            <Badge
                                key={platform}
                                variant={selectedSocial.includes(platform) ? "default" : "outline"}
                                className="cursor-pointer text-xs"
                                onClick={() => togglePlatform(platform, true)}
                            >
                                {platform}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search Input Area */}
            <div className="flex gap-2">
                <div className="relative flex-1 flex items-center gap-2">
                    <Input
                        type="text"
                        placeholder="Search by name, niche, or paste a product URL to scrape..."
                        className="flex-1 pr-12"
                        value={query}
                        onChange={(e) => {
                            const val = e.target.value;
                            setQuery(val);
                            // Auto-detect URL
                            if (val.startsWith('http://') || val.startsWith('https://')) {
                                setSearchMethod("By URL");
                            } else if (searchMethod === "By URL") {
                                // Revert to name search if user clears URL or types normal text
                                setSearchMethod("By Name");
                            }
                        }}
                    />

                    {/* Photo Search Button embedded in input */}
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                        <Input
                            type="file"
                            accept="image/*"
                            id="photo-search-input"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setQuery(reader.result as string);
                                        setSearchMethod("By Photo");
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => document.getElementById('photo-search-input')?.click()}
                            title="Search by Photo"
                        >
                            <Camera className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Main Action Button */}
                <Button
                    onClick={() => {
                        if (searchMethod === "By URL") {
                            setScrapingUrl(query);
                            setShowScrapeModal(true);
                        } else if (searchMethod === "By Photo") {
                            setIsScraping(true);
                            setTimeout(() => setIsScraping(false), 2000);
                        } else {
                            // Normal search logic
                        }
                    }}
                    disabled={isScraping || !query}
                    className={searchMethod === "By URL" ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                    {isScraping ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {searchMethod === "By Photo" ? "Scanning..." : "Scraping..."}
                        </>
                    ) : (
                        <>
                            {searchMethod === "By URL" ? (
                                <>
                                    <Link2 className="h-4 w-4 mr-2" />
                                    Scrape URL
                                </>
                            ) : (
                                <>
                                    <Search className="h-4 w-4 mr-2" />
                                    Search
                                </>
                            )}
                        </>
                    )}
                </Button>
            </div>

            {/* Image Preview for By Photo */}
            {searchMethod === "By Photo" && query && !query.startsWith("http") && (
                <div className="bg-muted p-4 rounded-lg flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="h-20 w-20 bg-background rounded-md overflow-hidden border">
                        <img src={query} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">Image selected ready for scan</p>
                        <p className="text-xs text-muted-foreground">We&apos;ll search for visually similar winning products</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setQuery("")} className="text-destructive">
                        Remove
                    </Button>
                </div>
            )}

            {/* Recent Searches - Product Cards */}
            <div>
                <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Recent Searches
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {RECENT_PRODUCTS.map((product) => {
                        const probabilityBadge = getProbabilityBadge(product.winningProbability);
                        return (
                            <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                <CardContent className="p-3">
                                    <div className="flex gap-3">
                                        {/* Product Image */}
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                            <img
                                                src={product.image}
                                                alt={product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <h5 className="font-semibold text-sm line-clamp-2 mb-1">
                                                {product.title}
                                            </h5>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                                <Badge variant="outline" className="text-xs py-0">
                                                    {product.platform}
                                                </Badge>
                                                <span>{product.searchDate}</span>
                                            </div>

                                            {/* Metrics */}
                                            <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                                                <div>
                                                    <span className="text-muted-foreground">Orders:</span>
                                                    <span className="font-semibold ml-1">{product.metrics.orders}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Rating:</span>
                                                    <span className="font-semibold ml-1">⭐ {product.metrics.rating}</span>
                                                </div>
                                            </div>

                                            {/* Price & Probability */}
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-green-600">{product.price}</span>
                                                <div className="flex items-center gap-1">
                                                    <TrendingUp className={`h-3 w-3 ${getProbabilityColor(product.winningProbability)}`} />
                                                    <span className={`text-xs font-bold ${getProbabilityColor(product.winningProbability)}`}>
                                                        {product.winningProbability}%
                                                    </span>
                                                    <Badge {...probabilityBadge} className="text-xs py-0">
                                                        {probabilityBadge.label}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* URL Scraping Modal */}
            <Dialog open={showScrapeModal} onOpenChange={setShowScrapeModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Scrape Product from URL</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Input
                                type="url"
                                placeholder="https://example.com/product..."
                                value={scrapingUrl}
                                onChange={(e) => setScrapingUrl(e.target.value)}
                                disabled={isScraping}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setShowScrapeModal(false)} disabled={isScraping}>
                                Cancel
                            </Button>
                            <Button onClick={handleUrlScrape} disabled={!scrapingUrl || isScraping}>
                                {isScraping ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Scraping...
                                    </>
                                ) : (
                                    <>
                                        <Link2 className="h-4 w-4 mr-2" />
                                        Scrape Product
                                    </>
                                )}
                            </Button>
                        </div>
                        {isScraping && (
                            <div className="text-center text-sm text-muted-foreground">
                                <p>Extracting product data...</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Search Results */}
            {query && searchMethod !== "By URL" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <h4 className="text-base font-semibold flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Search Results for "{query}"
                        </h4>
                        <Badge variant="secondary">{RECENT_PRODUCTS.filter(p => p.title.toLowerCase().includes(query.toLowerCase())).length + 4} Found</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Mock Search Results - Mixing real recent items with dynamic ones for demo */}
                        {[...RECENT_PRODUCTS, ...RECENT_PRODUCTS.map(p => ({ ...p, id: p.id + '_dup', title: "New " + p.title, winningProbability: Math.max(40, p.winningProbability - 10) }))]
                            .filter(product =>
                                product.title.toLowerCase().includes(query.toLowerCase()) ||
                                product.platform.toLowerCase().includes(query.toLowerCase())
                            )
                            .map((product) => {
                                const probabilityBadge = getProbabilityBadge(product.winningProbability);
                                return (
                                    <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20 bg-primary/5">
                                        <CardContent className="p-3">
                                            <div className="flex gap-3">
                                                {/* Product Image */}
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                    <img
                                                        src={product.image}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-semibold text-sm line-clamp-2 mb-1">
                                                        {product.title}
                                                    </h5>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                                        <Badge variant="outline" className="text-xs py-0">
                                                            {product.platform}
                                                        </Badge>
                                                        <span>Just now</span>
                                                    </div>

                                                    {/* Metrics */}
                                                    <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                                                        <div>
                                                            <span className="text-muted-foreground">Orders:</span>
                                                            <span className="font-semibold ml-1">{product.metrics.orders}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground">Rating:</span>
                                                            <span className="font-semibold ml-1">⭐ {product.metrics.rating}</span>
                                                        </div>
                                                    </div>

                                                    {/* Price & Probability */}
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-green-600">{product.price}</span>
                                                        <div className="flex items-center gap-1">
                                                            <TrendingUp className={`h-3 w-3 ${getProbabilityColor(product.winningProbability)}`} />
                                                            <span className={`text-xs font-bold ${getProbabilityColor(product.winningProbability)}`}>
                                                                {product.winningProbability}%
                                                            </span>
                                                            <Badge {...probabilityBadge} className="text-xs py-0">
                                                                {probabilityBadge.label}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                    </div>

                    {/* Empty State */}
                    {RECENT_PRODUCTS.filter(p => p.title.toLowerCase().includes(query.toLowerCase())).length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p>No exact matches found for "{query}"</p>
                            <p className="text-sm">Try searching for "Watch", "Holder", or "Cleaner"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
