/**
 * Zone 3: Command Landing Page
 * Route: /command
 * Shows overview and links to sub-pages
 */

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Crown, Banknote, Package, ArrowRight } from "lucide-react";

export default function CommandPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                        <Crown className="h-8 w-8 text-purple-500" />
                    </div>
                    Zone 3: القيادة (Command)
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    The Control Tower - Financial insights and strategic decisions
                </p>
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <Link href="/command/finance">
                    <Card className="group hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800 transition-all cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Banknote className="h-5 w-5 text-purple-500" />
                                    Finance & Insights
                                </span>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                            </CardTitle>
                            <CardDescription>المالية</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Track real cash at carriers (Pending COD), not theoretical revenue. Cash Collector is your main KPI.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/command/sourcing">
                    <Card className="group hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-800 transition-all cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-orange-500" />
                                    Sourcing
                                </span>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                            </CardTitle>
                            <CardDescription>المصادر</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Find winning products and reliable suppliers. Local (El-Eulma/Hamiz) and China options.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}

export const metadata = {
    title: "Command | E-Coma",
    description: "Zone 3: Command - Finance, Insights, and Sourcing"
};
