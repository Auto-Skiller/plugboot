"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { ScrollReveal } from "@/components/core/ui/advanced-motion";
import { ChevronRight, ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, Clock, User } from "lucide-react";

// Article data
const ARTICLES: Record<string, { title: string; category: string; categorySlug: string; content: string[]; lastUpdated: string; author: string }> = {
    "create-first-order": {
        title: "How to create your first order",
        category: "Orders",
        categorySlug: "orders",
        lastUpdated: "December 5, 2025",
        author: "Riglify Team",
        content: [
            "Creating orders in Riglify is simple and straightforward. This guide will walk you through the process step by step.",
            "## Step 1: Navigate to Orders",
            "Go to **Operations → Orders & Delivery** in the sidebar. You'll see your order dashboard with all existing orders.",
            "## Step 2: Click 'New Order'",
            "Click the **New Order** button in the top right corner of the page. This will open the order creation form.",
            "## Step 3: Enter Customer Information",
            "Fill in the customer details:\n- **Customer Name**: Full name of the customer\n- **Phone Number**: Algerian phone number (05XX XX XX XX)\n- **Wilaya**: Select the delivery wilaya from the dropdown",
            "## Step 4: Add Products",
            "Search for products and add them to the order. You can adjust quantities and see the total price update in real-time.",
            "## Step 5: Review and Confirm",
            "Review the order details and click **Create Order**. The order will be created with 'Pending' status.",
            "## What's Next?",
            "Once created, the order will appear in your Call Center queue for confirmation. Your team can then call the customer to confirm the order.",
        ]
    },
    "setup-payment": {
        title: "Setting up payment methods",
        category: "Payments",
        categorySlug: "payments",
        lastUpdated: "December 4, 2025",
        author: "Riglify Team",
        content: [
            "Configure how you collect payments from customers in Algeria.",
            "## Cash on Delivery (COD)",
            "COD is the most common payment method in Algeria. Here's how to set it up:",
            "1. Go to **Settings → Billing**\n2. Enable **Cash on Delivery**\n3. Set your COD fee (if any)\n4. Configure wilaya-specific pricing",
            "## Payment Tracking",
            "Track payments from your delivery partners in the **Orders → Delivery** tab.",
        ]
    },
    "configure-delivery": {
        title: "Configuring delivery zones",
        category: "Delivery",
        categorySlug: "delivery",
        lastUpdated: "December 3, 2025",
        author: "Riglify Team",
        content: [
            "Set up delivery to all 58 wilayas in Algeria.",
            "## Access Delivery Settings",
            "Navigate to **Operations → Orders → Delivery** tab to see the wilaya heatmap and delivery configuration.",
            "## Set Prices per Wilaya",
            "Click on any wilaya to set:\n- Delivery price\n- Estimated delivery time\n- Available delivery companies",
            "## Bulk Price Updates",
            "Use the price table to update multiple wilayas at once for consistent pricing across regions.",
        ]
    },
    "using-ai-assistant": {
        title: "Using the AI assistant",
        category: "AI & Automation",
        categorySlug: "ai",
        lastUpdated: "December 2, 2025",
        author: "Riglify Team",
        content: [
            "Get the most out of Riglify's AI-powered features.",
            "## AI Sales Agent",
            "The AI Sales Agent can:\n- Respond to customer DMs automatically\n- Answer product questions\n- Close sales and take orders\n- Track delivery status",
            "## Setting Up",
            "1. Go to **Operations → AI Sales Agent**\n2. Connect your social accounts (Instagram, Facebook, TikTok)\n3. Train the AI with your product catalog\n4. Configure response settings",
            "## Best Practices",
            "- Keep your product catalog up to date\n- Add FAQs to the knowledge base\n- Test the AI with sample conversations\n- Monitor performance in the Analytics tab",
        ]
    },
    "team-permissions": {
        title: "Managing team permissions",
        category: "Settings",
        categorySlug: "settings",
        lastUpdated: "December 1, 2025",
        author: "Riglify Team",
        content: [
            "Set up roles and permissions for your team members.",
            "## Accessing Team Settings",
            "Go to **Settings → Team Members** to view and manage your team.",
            "## Adding Team Members",
            "1. Click **Invite Member**\n2. Enter their email address\n3. Select a role (Admin, Manager, Agent)\n4. Send the invitation",
            "## Role Types",
            "- **Admin**: Full access to all features\n- **Manager**: Access to operations and analytics\n- **Agent**: Access to orders and customer communication only",
            "## Custom Roles",
            "Go to **Settings → Roles & Permissions** to create custom roles with specific permissions.",
        ]
    },
};

export default function HelpArticlePage() {
    const params = useParams();
    const slug = params.slug as string;
    const article = ARTICLES[slug];

    if (!article) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Article not found</h1>
                <p className="text-muted-foreground mb-6">The help article you&apos;re looking for doesn&apos;t exist.</p>
                <Link href="/help">
                    <Button>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Help Center
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 rounded-xl m-4 md:m-6">
            {/* Breadcrumb */}
            <ScrollReveal direction="down">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href={`/help/${article.categorySlug}`} className="hover:text-foreground transition-colors">
                        {article.category}
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground truncate max-w-[200px]">{article.title}</span>
                </div>
            </ScrollReveal>

            {/* Article Header */}
            <ScrollReveal direction="down" delay={0.1}>
                <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
                    <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {article.author}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Updated {article.lastUpdated}
                    </span>
                </div>
            </ScrollReveal>

            {/* Article Content */}
            <ScrollReveal delay={0.2}>
                <Card className="mb-8">
                    <CardContent className="p-8 prose prose-slate dark:prose-invert max-w-none">
                        {article.content.map((paragraph, index) => {
                            // Handle headings
                            if (paragraph.startsWith("## ")) {
                                return (
                                    <h2 key={index} className="text-xl font-semibold mt-8 mb-4 first:mt-0">
                                        {paragraph.replace("## ", "")}
                                    </h2>
                                );
                            }
                            // Handle lists
                            if (paragraph.includes("\n-")) {
                                const parts = paragraph.split("\n");
                                return (
                                    <div key={index}>
                                        <p className="mb-2">{parts[0]}</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            {parts.slice(1).map((item, i) => (
                                                <li key={i}>{item.replace("- ", "")}</li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            }
                            // Handle numbered lists
                            if (paragraph.includes("\n1.")) {
                                const parts = paragraph.split("\n");
                                return (
                                    <div key={index}>
                                        <p className="mb-2">{parts[0]}</p>
                                        <ol className="list-decimal list-inside space-y-1">
                                            {parts.slice(1).map((item, i) => (
                                                <li key={i}>{item.replace(/^\d+\.\s/, "")}</li>
                                            ))}
                                        </ol>
                                    </div>
                                );
                            }
                            // Regular paragraphs with bold text
                            return (
                                <p key={index} className="mb-4" dangerouslySetInnerHTML={{
                                    __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                }} />
                            );
                        })}
                    </CardContent>
                </Card>
            </ScrollReveal>

            {/* Feedback */}
            <ScrollReveal delay={0.3}>
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <p className="text-center font-medium mb-4">Was this article helpful?</p>
                        <div className="flex items-center justify-center gap-4">
                            <Button variant="outline" className="gap-2">
                                <ThumbsUp className="h-4 w-4" />
                                Yes
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <ThumbsDown className="h-4 w-4" />
                                No
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </ScrollReveal>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Link href={`/help/${article.categorySlug}`}>
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to {article.category}
                    </Button>
                </Link>
                <Button variant="outline" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Contact Support
                </Button>
            </div>
        </div>
    );
}
