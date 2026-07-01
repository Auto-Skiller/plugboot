"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { ScrollReveal } from "@/components/core/ui/advanced-motion";
import { Search, ChevronRight, ArrowLeft, ShoppingCart, CreditCard, Truck, Users, Settings, Zap } from "lucide-react";

// Category data
const CATEGORIES: Record<string, { name: string; icon: React.ElementType; color: string; articles: { slug: string; title: string; excerpt: string }[] }> = {
    orders: {
        name: "Orders",
        icon: ShoppingCart,
        color: "text-green-600 bg-green-100",
        articles: [
            { slug: "create-first-order", title: "How to create your first order", excerpt: "Learn how to manually create and process orders in Riglify." },
            { slug: "order-statuses", title: "Understanding order statuses", excerpt: "Learn what each order status means and how to manage them." },
            { slug: "bulk-order-actions", title: "Bulk order actions", excerpt: "Process multiple orders at once with bulk actions." },
            { slug: "order-recovery", title: "Recovering abandoned orders", excerpt: "How to recover orders marked as 'No Answer'." },
        ]
    },
    payments: {
        name: "Payments",
        icon: CreditCard,
        color: "text-blue-600 bg-blue-100",
        articles: [
            { slug: "setup-payment", title: "Setting up payment methods", excerpt: "Configure payment collection for your store." },
            { slug: "cod-payments", title: "Cash on Delivery (COD)", excerpt: "How COD works in Algeria and best practices." },
            { slug: "payment-tracking", title: "Tracking payments", excerpt: "Monitor and reconcile your payments." },
        ]
    },
    delivery: {
        name: "Delivery",
        icon: Truck,
        color: "text-purple-600 bg-purple-100",
        articles: [
            { slug: "configure-delivery", title: "Configuring delivery zones", excerpt: "Set up delivery to all 58 wilayas." },
            { slug: "delivery-pricing", title: "Setting delivery prices", excerpt: "Configure pricing per wilaya." },
            { slug: "delivery-companies", title: "Connecting delivery companies", excerpt: "Integrate with local delivery services." },
        ]
    },
    customers: {
        name: "Customers",
        icon: Users,
        color: "text-yellow-600 bg-yellow-100",
        articles: [
            { slug: "customer-management", title: "Managing customers", excerpt: "View and manage your customer database." },
            { slug: "customer-segments", title: "Customer segmentation", excerpt: "Create segments for targeted marketing." },
        ]
    },
    settings: {
        name: "Settings",
        icon: Settings,
        color: "text-gray-600 bg-gray-100",
        articles: [
            { slug: "team-permissions", title: "Managing team permissions", excerpt: "Set up roles and permissions for your team." },
            { slug: "store-settings", title: "Store settings", excerpt: "Configure your store's basic settings." },
            { slug: "notifications", title: "Notification preferences", excerpt: "Customize when and how you receive notifications." },
        ]
    },
    ai: {
        name: "AI & Automation",
        icon: Zap,
        color: "text-indigo-600 bg-indigo-100",
        articles: [
            { slug: "using-ai-assistant", title: "Using the AI assistant", excerpt: "Get the most out of Riglify's AI features." },
            { slug: "keyword-rules", title: "Setting up keyword rules", excerpt: "Automate responses with keyword triggers." },
            { slug: "ai-sales-agent", title: "AI Sales Agent setup", excerpt: "Configure your AI to handle sales conversations." },
        ]
    },
};

export default function HelpCategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const category = CATEGORIES[slug];

    if (!category) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Category not found</h1>
                <p className="text-muted-foreground mb-6">The help category you&apos;re looking for doesn&apos;t exist.</p>
                <Link href="/help">
                    <Button>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Help Center
                    </Button>
                </Link>
            </div>
        );
    }

    const CategoryIcon = category.icon;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 rounded-xl m-4 md:m-6">
            {/* Breadcrumb */}
            <ScrollReveal direction="down">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground">{category.name}</span>
                </div>
            </ScrollReveal>

            {/* Header */}
            <ScrollReveal direction="down" delay={0.1}>
                <div className="flex items-center gap-4 mb-8">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${category.color}`}>
                        <CategoryIcon className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{category.name}</h1>
                        <p className="text-muted-foreground">{category.articles.length} articles</p>
                    </div>
                </div>
            </ScrollReveal>

            {/* Search */}
            <ScrollReveal delay={0.2}>
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder={`Search in ${category.name}...`}
                        className="pl-12 h-12"
                    />
                </div>
            </ScrollReveal>

            {/* Articles List */}
            <ScrollReveal delay={0.3}>
                <div className="space-y-3">
                    {category.articles.map((article) => (
                        <Link
                            key={article.slug}
                            href={`/help/article/${article.slug}`}
                            className="block p-5 border rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium group-hover:text-primary transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">{article.excerpt}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>
            </ScrollReveal>

            {/* Back Button */}
            <div className="mt-8">
                <Link href="/help">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Help Center
                    </Button>
                </Link>
            </div>
        </div>
    );
}
