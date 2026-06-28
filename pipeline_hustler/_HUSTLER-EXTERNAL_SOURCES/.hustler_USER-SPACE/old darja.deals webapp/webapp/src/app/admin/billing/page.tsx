"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Progress } from "@/components/core/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/core/ui/table";
import { Input } from "@/components/core/ui/input";
import { Check, CreditCard, Download, Sparkles, Zap, Building2, Upload, CheckCircle, Copy, AlertCircle } from "lucide-react";
import { PressableCard, triggerHaptic } from "@/components/core/ui/mobile-touch";
import { ScrollReveal } from "@/components/core/ui/advanced-motion";
import { cn } from "@/lib/utils";
import { useBilling, PlanType } from "@/components/core/layout/BillingProvider";

// Plan definitions (static config)
const PLANS_CONFIG = [
    {
        id: 'starter',
        name: 'Starter',
        price: 0,
        period: 'month',
        icon: Zap,
        features: [
            '100 orders/month',
            '1 store',
            'Email support',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 4900,
        period: 'month',
        icon: Sparkles,
        features: [
            'Unlimited orders',
            '5 stores',
            'AI Assistant',
            'Priority support',
            'API Access',
        ],
        popular: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: null,
        period: 'month',
        icon: Building2,
        features: [
            'Everything in Pro',
            'Unlimited stores',
            'Guaranteed SLA',
            'Dedicated account manager',
            'Custom integrations',
        ],
    },
];

export default function SubscriptionPage() {
    const { plan: currentPlan, credits, usage, invoices, upgradePlan, addCredits, isLoading } = useBilling();

    const [amount, setAmount] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        triggerHaptic("medium");
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            if (amount) {
                addCredits(parseInt(amount));
            }
            setIsSubmitting(false);
            setIsSuccess(true);
            triggerHaptic("heavy");
        }, 1500);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        triggerHaptic("light");
    };

    if (isLoading) return <div className="p-10 text-center">Loading billing info...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-12 p-4 md:p-6 rounded-xl">
            {/* Section 1: Subscription Plans */}
            <section className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Subscription Plans</h2>
                        <p className="text-muted-foreground">Choose the plan that fits your business needs.</p>
                    </div>
                </div>
                <ScrollReveal delay={0.1}>
                    <div className="grid md:grid-cols-3 gap-6">
                        {PLANS_CONFIG.map((planConfig) => {
                            const isCurrent = currentPlan === planConfig.id;
                            // @ts-ignore
                            const isPopular = planConfig.popular;

                            return (
                                <Card
                                    key={planConfig.id}
                                    className={cn(
                                        "relative flex flex-col transition-all duration-300",
                                        isPopular && !isCurrent && "border-primary shadow-lg ring-2 ring-primary/20",
                                        isCurrent && "border-green-500 ring-1 ring-green-500/50 bg-green-500/5"
                                    )}
                                >
                                    {isPopular && !isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge className="bg-primary">Most Popular</Badge>
                                        </div>
                                    )}
                                    {isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Current Plan</Badge>
                                        </div>
                                    )}
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <planConfig.icon className={cn("h-5 w-5", isCurrent ? "text-green-600" : "text-primary")} />
                                            <CardTitle>{planConfig.name}</CardTitle>
                                        </div>
                                        <div className="mt-4">
                                            {planConfig.price !== null ? (
                                                <>
                                                    <span className="text-4xl font-bold">{planConfig.price.toLocaleString()}</span>
                                                    <span className="text-muted-foreground"> DA/{planConfig.period}</span>
                                                </>
                                            ) : (
                                                <span className="text-2xl font-bold">Custom</span>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ul className="space-y-3">
                                            {planConfig.features.map((feature) => (
                                                <li key={feature} className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                    <span className="text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className="w-full"
                                            variant={isCurrent ? 'outline' : isPopular ? 'default' : 'outline'}
                                            disabled={isCurrent}
                                            onClick={() => upgradePlan(planConfig.id as PlanType)}
                                        >
                                            {isCurrent ? 'Current Plan' : planConfig.price === null ? 'Contact Us' : 'Upgrade'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </ScrollReveal>
            </section>

            {/* Divider */}
            <div className="border-t border-border/50" />

            {/* Section 2: Operations Split View */}
            <section className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Billing & Credits Operations</h2>
                    <p className="text-muted-foreground">Manage your usage, invoices, and wallet credits.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column: Usage & Invoices */}
                    <div className="space-y-8">
                        {/* Usage */}
                        <ScrollReveal delay={0.1}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Usage This Month</CardTitle>
                                    <CardDescription>Track your resource consumption.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {[
                                        { label: 'Orders', ...usage.orders },
                                        { label: 'Stores', ...usage.stores },
                                        { label: 'AI Credits', ...usage.ai_credits }
                                    ].map((metric) => (
                                        <div key={metric.label}>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="font-medium">{metric.label}</span>
                                                <span className="text-muted-foreground">{metric.used.toLocaleString()} / {metric.max.toLocaleString()}</span>
                                            </div>
                                            <Progress value={Math.min((metric.used / metric.max) * 100, 100)} className="h-2" />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </ScrollReveal>

                        {/* Payment Method */}
                        <ScrollReveal delay={0.2}>
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle>Wallet Balance</CardTitle>
                                            <CardDescription>Available credits for renewals and AI tools.</CardDescription>
                                        </div>
                                        <Badge variant="secondary" className="text-xl px-4 py-1">
                                            {credits.toLocaleString()} DA
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Direct Top-up</p>
                                            <p className="text-sm text-muted-foreground">Via CCP / BaridiMob</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </ScrollReveal>

                        {/* Invoices */}
                        <ScrollReveal delay={0.3}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Invoice History</CardTitle>
                                    <CardDescription>Download your past invoices.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoices.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                                        No invoices found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                invoices.map((invoice) => (
                                                    <TableRow key={invoice.id}>
                                                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                                                        <TableCell>{invoice.amount.toLocaleString()} DA</TableCell>
                                                        <TableCell>
                                                            <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'} className={invoice.status === 'paid' ? 'bg-green-500/20 text-green-600' : ''}>
                                                                {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="icon">
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </ScrollReveal>
                    </div>

                    {/* Right Column: Credits Top-up */}
                    <div className="space-y-6">
                        {!isSuccess ? (
                            <div className="grid gap-6">
                                {/* Payment Instructions */}
                                <ScrollReveal delay={0.1}>
                                    <Card className="bg-primary/5 border-primary/20">
                                        <CardHeader>
                                            <CardTitle className="flex items-center text-lg">
                                                <CreditCard className="mr-2 h-5 w-5 text-primary" /> Payment Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <PressableCard className="flex justify-between items-center p-3 bg-background rounded border cursor-pointer" onClick={() => copyToClipboard("0023456789 12")}>
                                                <div>
                                                    <div className="text-xs text-muted-foreground uppercase">CCP Account</div>
                                                    <div className="font-mono font-bold">0023456789 12</div>
                                                </div>
                                                <Button size="icon" variant="ghost" title="Copy">
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </PressableCard>
                                            <PressableCard className="flex justify-between items-center p-3 bg-background rounded border cursor-pointer" onClick={() => copyToClipboard("007 99999 0023456789 12")}>
                                                <div>
                                                    <div className="text-xs text-muted-foreground uppercase">BaridiMob RIP</div>
                                                    <div className="font-mono font-bold">007 99999 0023456789 12</div>
                                                </div>
                                                <Button size="icon" variant="ghost" title="Copy">
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </PressableCard>
                                            <div className="flex justify-between items-center p-3 bg-background rounded border">
                                                <div>
                                                    <div className="text-xs text-muted-foreground uppercase">Account Name</div>
                                                    <div className="font-bold">SARL RIGLIFY ALGERIE</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </ScrollReveal>

                                {/* Upload Form */}
                                <ScrollReveal delay={0.2}>
                                    <Card>
                                        <form onSubmit={handleSubmit}>
                                            <CardHeader>
                                                <CardTitle>Top-up Wallet</CardTitle>
                                                <CardDescription>Upload a screenshot of your payment to receive credits.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Amount (DZD)</label>
                                                    <Input
                                                        type="number"
                                                        placeholder="e.g. 5000"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                        required
                                                        min="1000"
                                                    />
                                                    <p className="text-xs text-muted-foreground">Minimum top-up: 1,000 DZD</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Payment Receipt</label>
                                                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                                                        <Input
                                                            type="file"
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            onChange={handleFileChange}
                                                            accept="image/*"
                                                            required
                                                        />
                                                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                                        {file ? (
                                                            <span className="text-sm font-medium text-primary">{file.name}</span>
                                                        ) : (
                                                            <>
                                                                <span className="text-sm font-medium">Click to upload image</span>
                                                                <span className="text-xs text-muted-foreground">JPG, PNG (Max 5MB)</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button type="submit" className="w-full box-glow" disabled={isSubmitting}>
                                                    {isSubmitting ? "Verifying..." : "Submit Request"}
                                                </Button>
                                            </CardFooter>
                                        </form>
                                    </Card>
                                </ScrollReveal>
                            </div>
                        ) : (
                            <ScrollReveal>
                                <Card className="border-green-500/50 bg-green-500/5">
                                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                                            <CheckCircle className="h-8 w-8 text-green-500" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">Request Submitted!</h2>
                                        <p className="text-muted-foreground max-w-md mt-2">
                                            Your top-up request for <span className="font-bold text-foreground">{parseInt(amount).toLocaleString()} DZD</span> has been received.
                                            Credits will be added to your wallet within 30 minutes.
                                        </p>
                                        <Button className="mt-6" variant="outline" onClick={() => { setIsSuccess(false); setAmount(""); setFile(null); }}>
                                            Submit Another
                                        </Button>
                                    </CardContent>
                                </Card>
                            </ScrollReveal>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
