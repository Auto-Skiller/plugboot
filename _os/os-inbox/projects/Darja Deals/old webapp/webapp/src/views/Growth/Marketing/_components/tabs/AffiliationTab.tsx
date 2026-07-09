"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import {
    Wallet,
    Users,
    Plus,
    Link2,
    CheckCircle,
    Clock,
    Gift,
    Copy,
    Eye,
    TrendingUp
} from "lucide-react";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";

// Mock data
const affiliates = [
    { id: 1, name: "Ahmed M.", email: "ahmed@example.com", sales: 45, earnings: "12,500 DA", status: "active", joined: "Jan 2024" },
    { id: 2, name: "Fatima K.", email: "fatima@example.com", sales: 32, earnings: "8,900 DA", status: "active", joined: "Fév 2024" },
    { id: 3, name: "Youcef B.", email: "youcef@example.com", sales: 18, earnings: "4,200 DA", status: "pending", joined: "Mar 2024" },
    { id: 4, name: "Sarah L.", email: "sarah@example.com", sales: 0, earnings: "0 DA", status: "inactive", joined: "Mar 2024" },
];

const payouts = [
    { id: 1, affiliate: "Ahmed M.", amount: "5,500 DA", status: "completed", date: "10 Déc 2024" },
    { id: 2, affiliate: "Fatima K.", amount: "3,200 DA", status: "pending", date: "15 Déc 2024" },
    { id: 3, affiliate: "Youcef B.", amount: "1,800 DA", status: "processing", date: "14 Déc 2024" },
];

const links = [
    { id: "main", name: "Lien Principal", url: "https://votrestore.dz?ref=", clicks: 1234, conversions: 89 },
    { id: "promo", name: "Promo Été", url: "https://votrestore.dz/promo?ref=", clicks: 567, conversions: 42 },
    { id: "product", name: "Produit Bestseller", url: "https://votrestore.dz/product/123?ref=", clicks: 234, conversions: 18 },
];

export function AffiliationTab() {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (id: string, url: string) => {
        navigator.clipboard.writeText(url + "VOTRE_CODE");
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Split View: Affiliates + Payouts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Affiliates List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                                Affiliés Actifs
                            </CardTitle>
                            <CardDescription>Partenaires performants</CardDescription>
                        </div>
                        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Inviter</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {affiliates.map((affiliate) => (
                                <div key={affiliate.id} className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {affiliate.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{affiliate.name}</p>
                                            <p className="text-xs text-muted-foreground">{affiliate.sales} ventes</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">{affiliate.earnings}</p>
                                        <Badge variant={affiliate.status === "active" ? "default" : "secondary"} className="text-[10px]">
                                            {affiliate.status === "active" ? "Actif" : affiliate.status === "pending" ? "En attente" : "Inactif"}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Payouts */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Wallet className="h-5 w-5 text-primary" />
                                Aperçu Paiements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div><p className="text-xs text-muted-foreground mb-1">Payé (Mois)</p><p className="text-xl font-bold text-primary">45,200 DA</p></div>
                                <div><p className="text-xs text-muted-foreground mb-1">En Attente</p><p className="text-xl font-bold text-orange-500">12,800 DA</p></div>
                                <div><p className="text-xs text-muted-foreground mb-1">Total Payé</p><p className="text-xl font-bold">892,500 DA</p></div>
                            </div>
                            <Button className="w-full gap-2 mt-6"><Gift className="h-4 w-4" />Traiter Tous les Paiements</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Transactions Récentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {payouts.map((payout) => (
                                    <div key={payout.id} className="flex items-center justify-between p-3 rounded-xl border">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${payout.status === 'completed' ? 'bg-green-100 text-green-600' : payout.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {payout.status === 'completed' ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{payout.affiliate}</p>
                                                <p className="text-xs text-muted-foreground">{payout.date}</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-sm">{payout.amount}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Commission Links */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Link2 className="h-5 w-5 text-[hsl(var(--accent-blue))]" />
                                Liens de Commission
                            </CardTitle>
                            <CardDescription>Gérez vos liens de parrainage</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2"><Plus className="h-4 w-4" />Créer Lien</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {links.map((link) => (
                            <div key={link.id} className="p-4 rounded-lg border hover:shadow-md transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 bg-blue-100 rounded-lg"><Link2 className="h-5 w-5 text-blue-500" /></div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(link.id, link.url)}>
                                        {copied === link.id ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <h3 className="font-semibold mb-1">{link.name}</h3>
                                <code className="text-xs bg-muted px-2 py-1 rounded block truncate mb-3">{link.url}CODE</code>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1 text-muted-foreground"><Eye className="h-4 w-4" />{link.clicks}</span>
                                    <span className="flex items-center gap-1 text-green-600 font-medium"><TrendingUp className="h-4 w-4" />{link.conversions}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
