"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/core/ui/dialog";
import { Textarea } from "@/components/core/ui/textarea";
import {
    Factory, MapPin, Phone, Mail, Globe, Clock, Package, Star,
    Search, Filter, Plus, CheckCircle2, AlertCircle, Building2
} from "lucide-react";
import { SUPPLIERS, ALGERIA_WILAYAS, type Supplier } from "@/data/mock-research-data";

const CATEGORIES = ["All", "Textiles", "Cosmetics", "Plastics", "Electronics", "Food"] as const;

export default function SupplierDatabase() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedWilaya, setSelectedWilaya] = useState<string>("all");
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [pendingSuppliers, setPendingSuppliers] = useState<Supplier[]>([]);

    // Filter suppliers
    const filteredSuppliers = [...SUPPLIERS, ...pendingSuppliers].filter(supplier => {
        const matchesSearch = searchQuery === "" ||
            supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            supplier.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === "All" || supplier.category === selectedCategory;
        const matchesWilaya = selectedWilaya === "all" || supplier.wilaya === selectedWilaya;
        return matchesSearch && matchesCategory && matchesWilaya;
    });

    // Get unique wilayas from suppliers
    const supplierWilayas = Array.from(new Set(SUPPLIERS.map(s => s.wilaya)));

    const handleAddSupplier = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newSupplier: Supplier = {
            id: Date.now(),
            name: formData.get("name") as string,
            wilaya: formData.get("wilaya") as string,
            category: formData.get("category") as Supplier["category"],
            products: (formData.get("products") as string).split(",").map(p => p.trim()),
            contact: {
                phone: formData.get("phone") as string,
                email: formData.get("email") as string || undefined
            },
            moq: parseInt(formData.get("moq") as string) || 50,
            leadTime: formData.get("leadTime") as string,
            verified: false,
            isPending: true
        };
        setPendingSuppliers([...pendingSuppliers, newSupplier]);
        setShowAddDialog(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Factory className="h-5 w-5 text-emerald-500" />
                        Supplier Database
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Curated database of Algerian manufacturers - textiles, cosmetics, plastics & more
                    </p>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Supplier
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <form onSubmit={handleAddSupplier}>
                            <DialogHeader>
                                <DialogTitle>Submit New Supplier</DialogTitle>
                                <DialogDescription>
                                    Add a supplier for review. Once verified, it will appear in the database.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Company Name *</Label>
                                    <Input id="name" name="name" required placeholder="e.g., Textile El Baraka" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">Category *</Label>
                                        <Select name="category" required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.filter(c => c !== "All").map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="wilaya">Wilaya *</Label>
                                        <Select name="wilaya" required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ALGERIA_WILAYAS.map(w => (
                                                    <SelectItem key={w} value={w}>{w}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="products">Products (comma separated) *</Label>
                                    <Input id="products" name="products" required placeholder="T-shirts, Hoodies, Custom prints" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone *</Label>
                                        <Input id="phone" name="phone" required placeholder="0551 234 567" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" name="email" type="email" placeholder="contact@example.dz" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="moq">Min. Order Qty *</Label>
                                        <Input id="moq" name="moq" type="number" required placeholder="100" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="leadTime">Lead Time *</Label>
                                        <Input id="leadTime" name="leadTime" required placeholder="7-14 days" />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                                <Button type="submit">Submit for Review</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search suppliers or products..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={selectedWilaya} onValueChange={setSelectedWilaya}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Wilayas</SelectItem>
                        {supplierWilayas.sort().map(w => (
                            <SelectItem key={w} value={w}>{w}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {CATEGORIES.filter(c => c !== "All").map(cat => {
                    const count = SUPPLIERS.filter(s => s.category === cat).length;
                    return (
                        <Card key={cat} className={`cursor-pointer transition-all hover:shadow-md ${selectedCategory === cat ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => setSelectedCategory(cat)}>
                            <CardContent className="p-3 text-center">
                                <p className="text-2xl font-bold">{count}</p>
                                <p className="text-xs text-muted-foreground">{cat}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Supplier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSuppliers.map((supplier) => (
                    <Card key={supplier.id} className={`hover:shadow-lg transition-all ${supplier.isPending ? 'border-amber-300 bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
                        <CardContent className="p-4 space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold">{supplier.name}</h4>
                                        {supplier.verified ? (
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1 text-xs">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Verified
                                            </Badge>
                                        ) : supplier.isPending ? (
                                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 gap-1 text-xs">
                                                <AlertCircle className="h-3 w-3" />
                                                Pending
                                            </Badge>
                                        ) : null}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                        <MapPin className="h-3 w-3" />
                                        {supplier.wilaya}
                                    </div>
                                </div>
                                <Badge variant="outline">{supplier.category}</Badge>
                            </div>

                            {/* Products */}
                            <div className="flex flex-wrap gap-1">
                                {supplier.products.slice(0, 4).map(product => (
                                    <Badge key={product} variant="secondary" className="text-xs font-normal">
                                        {product}
                                    </Badge>
                                ))}
                                {supplier.products.length > 4 && (
                                    <Badge variant="secondary" className="text-xs font-normal">
                                        +{supplier.products.length - 4}
                                    </Badge>
                                )}
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-3 gap-2 py-2 border-y">
                                <div className="text-center">
                                    <Package className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                                    <p className="text-xs text-muted-foreground">MOQ</p>
                                    <p className="font-bold text-sm">{supplier.moq}</p>
                                </div>
                                <div className="text-center">
                                    <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                                    <p className="text-xs text-muted-foreground">Lead Time</p>
                                    <p className="font-bold text-sm">{supplier.leadTime}</p>
                                </div>
                                <div className="text-center">
                                    <Star className="h-4 w-4 mx-auto text-amber-500 mb-1" />
                                    <p className="text-xs text-muted-foreground">Rating</p>
                                    <p className="font-bold text-sm">{supplier.rating?.toFixed(1) || "N/A"}</p>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <span>{supplier.contact.phone}</span>
                                </div>
                                {supplier.contact.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-primary hover:underline cursor-pointer truncate">{supplier.contact.email}</span>
                                    </div>
                                )}
                                {supplier.contact.website && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Globe className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-primary hover:underline cursor-pointer">{supplier.contact.website}</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {supplier.description && (
                                <p className="text-xs text-muted-foreground italic line-clamp-2">
                                    {supplier.description}
                                </p>
                            )}

                            {/* Action */}
                            <Button variant="outline" size="sm" className="w-full">
                                <Building2 className="h-4 w-4 mr-2" />
                                View Details
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {filteredSuppliers.length === 0 && (
                <div className="text-center py-12">
                    <Factory className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h4 className="font-semibold mb-1">No suppliers found</h4>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new supplier</p>
                </div>
            )}
        </div>
    );
}
