/**
 * Zone 1: Operations Landing Page
 * Route: /operations
 * Shows overview and links to sub-pages
 */

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Phone, Truck, ArrowRight } from "lucide-react";

export default function OperationsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-3 bg-red-500/10 rounded-xl">
                        <Phone className="h-8 w-8 text-red-500" />
                    </div>
                    Zone 1: العمليات (Operations)
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    The Engine Room - Confirm orders, ship fast, recover returns
                </p>
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <Link href="/operations/confirmation">
                    <Card className="group hover:shadow-lg hover:border-red-200 dark:hover:border-red-800 transition-all cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-red-500" />
                                    Confirmation Center
                                </span>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-red-500 transition-colors" />
                            </CardTitle>
                            <CardDescription>مركز التأكيد</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Single Pane of Glass for confirming orders. Risk calculator, call scripts, WhatsApp bot - all in one view.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/operations/warehouse">
                    <Card className="group hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-blue-500" />
                                    Warehouse
                                </span>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                            </CardTitle>
                            <CardDescription>اللوجيستيك (Entrepôt)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Track stock levels, manage multi-site inventory, and sync with carriers.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/operations/logistics-recovery">
                    <Card className="group hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-800 transition-all cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-orange-500" />
                                    Logistics & Recovery
                                </span>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                            </CardTitle>
                            <CardDescription>اللوجيستيك والروتور</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Track shipments, manage returns (Rotour), sync inventory with carriers. Rotour = Daily Emergency!
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}

export const metadata = {
    title: "Operations | E-Coma",
    description: "Zone 1: Operations - Confirmation, Logistics, and Recovery"
};
