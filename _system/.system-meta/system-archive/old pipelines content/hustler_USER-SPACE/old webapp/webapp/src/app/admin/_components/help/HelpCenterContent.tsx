"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { ScrollReveal } from "@/components/core/ui/advanced-motion";
import { Search, ShoppingCart, CreditCard, Truck, Users, Settings, Zap, MessageCircle, ChevronRight, HelpCircle, FileText, BookOpen, Headphones, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// Types
interface Category {
    id: string;
    name: string;
    slug: string;
    icon: React.ElementType;
    color: string;
    articlesCount: number;
}

interface Article {
    id: string;
    title: string;
    slug: string;
}

interface FAQItem {
    q: string;
    a: string;
}

const CATEGORIES: Category[] = [
    { id: '1', name: 'Orders', slug: 'orders', icon: ShoppingCart, color: 'text-green-400', articlesCount: 12 },
    { id: '2', name: 'Payments', slug: 'payments', icon: CreditCard, color: 'text-blue-400', articlesCount: 8 },
    { id: '3', name: 'Delivery', slug: 'delivery', icon: Truck, color: 'text-purple-400', articlesCount: 15 },
    { id: '4', name: 'Customers', slug: 'customers', icon: Users, color: 'text-yellow-400', articlesCount: 10 },
    { id: '5', name: 'Settings', slug: 'settings', icon: Settings, color: 'text-zinc-400', articlesCount: 20 },
    { id: '6', name: 'AI & Automation', slug: 'ai', icon: Zap, color: 'text-indigo-400', articlesCount: 6 },
];

const POPULAR_ARTICLES: Article[] = [
    { id: '1', title: 'How to create your first order', slug: 'create-first-order' },
    { id: '2', title: 'Setting up payment methods', slug: 'setup-payment' },
    { id: '3', title: 'Configuring delivery zones', slug: 'configure-delivery' },
    { id: '4', title: 'Using the AI assistant', slug: 'using-ai-assistant' },
    { id: '5', title: 'Managing team permissions', slug: 'team-permissions' },
];

const FAQ_ITEMS: FAQItem[] = [
    { q: "How do I reset my password?", a: "Go to Settings > Security > Change Password" },
    { q: "How do I add a new team member?", a: "Go to Settings > Team and click 'Invite Member'" },
    { q: "How do I export my data?", a: "Go to Reports > Export and select your date range" },
];

interface HelpCenterContentProps {
    embedded?: boolean;
    activeTab?: string;
    whatsappNumber?: string;
    messengerUsername?: string;
    telegramUsername?: string;
}

export function HelpCenterContent({
    embedded = false,
    activeTab: externalTab,
    whatsappNumber,
    messengerUsername,
    telegramUsername
}: HelpCenterContentProps) {
    const [currentTab, setCurrentTab] = useState("faq");

    // Sync external tab to local state
    useEffect(() => {
        if (externalTab) {
            setCurrentTab(externalTab);
        }
    }, [externalTab]);

    const handleTabChange = (tab: string) => {
        setCurrentTab(tab);
    };

    return (
        <div className={cn("space-y-6", embedded ? "p-4" : "max-w-4xl mx-auto p-4 md:p-6 rounded-xl")}>

            {/* Embedded Navigation (since RightPanel isn't available in popup) */}
            {embedded && (
                <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/5 rounded-lg mb-4">
                    <button
                        onClick={() => handleTabChange('faq')}
                        className={cn("flex-1 text-xs font-medium py-1.5 rounded-md transition-all", currentTab === 'faq' ? "bg-white/10 text-white shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/5")}
                    >
                        FAQ
                    </button>
                    <button
                        onClick={() => handleTabChange('guides')}
                        className={cn("flex-1 text-xs font-medium py-1.5 rounded-md transition-all", currentTab === 'guides' ? "bg-white/10 text-white shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/5")}
                    >
                        Guides
                    </button>
                    <button
                        onClick={() => handleTabChange('support')}
                        className={cn("flex-1 text-xs font-medium py-1.5 rounded-md transition-all", currentTab === 'support' ? "bg-white/10 text-white shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/5")}
                    >
                        Support
                    </button>
                </div>
            )}

            {/* Hero Search */}
            <ScrollReveal direction="down">
                <div className="text-center mb-6">
                    {!embedded && (
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                            <HelpCircle className="h-8 w-8 text-primary" />
                        </div>
                    )}
                    <h2 className={cn("font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2 mb-4 hidden", embedded ? "text-lg hidden" : "text-2xl")}>
                        {embedded ? "How can we help?" : "How can we help you?"}
                    </h2>
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Search for help..."
                            className={cn("pl-9 border-white/10 bg-white/5 placeholder:text-zinc-600 focus:bg-white/10 transition-all", embedded ? "h-10 text-sm text-zinc-300 rounded-xl" : "h-14 pl-12 text-lg")}
                        />
                    </div>
                </div>
            </ScrollReveal>

            {/* Tab Content */}
            {currentTab === "faq" && (
                <>
                    {/* Categories Grid */}
                    <ScrollReveal delay={0.1}>
                        <div className={cn("grid gap-2 mb-6", embedded ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 gap-4 mb-12")}>
                            {CATEGORIES.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/help/${cat.slug}`}
                                    className={cn("border rounded-xl transition-all group", embedded ? "p-3 border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10" : "p-6 hover:shadow-md hover:border-primary/50")}
                                >
                                    <div className={cn(
                                        "rounded-lg flex items-center justify-center mb-2",
                                        embedded ? "w-8 h-8 bg-black/40" : "w-12 h-12 mb-4 bg-primary/10"
                                    )}>
                                        <cat.icon className={cn(cat.color, embedded ? "h-4 w-4" : "h-6 w-6")} />
                                    </div>
                                    <h3 className={cn("font-medium group-hover:text-white transition-colors", embedded ? "text-xs mb-0 text-zinc-300" : "mb-1")}>{cat.name}</h3>
                                    {!embedded && <p className="text-sm text-muted-foreground">{cat.articlesCount} articles</p>}
                                </Link>
                            ))}
                        </div>
                    </ScrollReveal>

                    {/* FAQ Items */}
                    <ScrollReveal delay={0.2}>
                        <div className="mb-8">
                            <h2 className={cn("font-semibold mb-3 flex items-center gap-2 text-zinc-100", embedded ? "text-sm" : "text-xl")}>
                                <FileText className={cn("text-blue-400", embedded ? "h-4 w-4" : "h-5 w-5")} /> Frequently Asked Questions
                            </h2>
                            <div className="space-y-2">
                                {FAQ_ITEMS.map((item, idx) => (
                                    <div key={idx} className={cn("p-3 border rounded-lg", embedded ? "bg-white/5 border-white/5" : "bg-card")}>
                                        <p className={cn("font-medium mb-1 text-zinc-200", embedded ? "text-xs" : "text-sm")}>{item.q}</p>
                                        <p className={cn("text-xs text-zinc-500", embedded ? "" : "text-muted-foreground")}>{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollReveal>
                </>
            )}

            {currentTab === "guides" && (
                <ScrollReveal delay={0.1}>
                    <div className="mb-8">
                        <h2 className={cn("font-semibold mb-3 flex items-center gap-2 text-zinc-100", embedded ? "text-sm" : "text-xl")}>
                            <BookOpen className={cn("text-purple-400", embedded ? "h-4 w-4" : "h-5 w-5")} /> Guides & Tutorials
                        </h2>
                        <div className="space-y-1.5">
                            {POPULAR_ARTICLES.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/help/article/${article.slug}`}
                                    className={cn("flex items-center justify-between p-2.5 border rounded-lg transition-colors group", embedded ? "bg-white/5 border-white/5 hover:bg-white/10" : "hover:bg-muted/50")}
                                >
                                    <span className={cn("group-hover:text-white transition-colors text-zinc-400", embedded ? "text-xs" : "text-base")}>{article.title}</span>
                                    <ChevronRight className="h-3 w-3 text-zinc-600 group-hover:text-white transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>
            )}

            {currentTab === "support" && (
                <ScrollReveal delay={0.1}>
                    <div className="text-center py-4">
                        {!embedded && <Headphones className="h-16 w-16 mx-auto mb-4 text-primary opacity-70" />}
                        <h2 className={cn("font-bold mb-2 text-white", embedded ? "text-base" : "text-2xl")}>Contact Support</h2>
                        <p className={cn("text-zinc-400 mb-6 max-w-md mx-auto", embedded ? "text-xs" : "text-base")}>
                            {embedded ? "Need help? Reach out to us." : "Our support team is available 24/7 to help you with any questions."}
                        </p>

                        <div className={cn("grid gap-2", embedded ? "grid-cols-1" : "flex justify-center gap-4")}>
                            {/* WhatsApp */}
                            {whatsappNumber && (
                                <a
                                    href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-all group"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                    <span className="font-medium text-xs flex-1 text-left">WhatsApp Support</span>
                                </a>
                            )}

                            {/* Messenger */}
                            {messengerUsername && (
                                <a
                                    href={`https://m.me/${messengerUsername}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all group"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" /></svg>
                                    <span className="font-medium text-xs flex-1 text-left">Messenger</span>
                                </a>
                            )}

                            <Button className={cn("w-full justify-start text-xs bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10", embedded ? "" : "flex-none w-auto")} variant="outline">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Live Chat (Coming Soon)
                            </Button>
                        </div>
                    </div>
                </ScrollReveal>
            )}

            {/* Contact Support Card - Only show in full mode if not in support tab */}
            {!embedded && currentTab !== "support" && (
                <ScrollReveal delay={0.3}>
                    <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">Need more help?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Our support team is here to assist you.
                                </p>
                            </div>
                            <Button className="box-glow" onClick={() => handleTabChange('support')}>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Contact Support
                            </Button>
                        </CardContent>
                    </Card>
                </ScrollReveal>
            )}
        </div>
    );
}
