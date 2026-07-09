"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/core/ui/tabs";
import { Banknote, FileText, PieChart, Wallet } from "lucide-react";

// Existing Components
import { CashCollector } from "@/views/Command/Finance/_components/CashCollector";
import CodCashTracker from "@/views/Command/Finance/_components/CodCashTracker";
import { ProfitCalculator } from "@/views/Command/Finance/_components/ProfitCalculator";
import { RevenueProfitChart } from "@/views/Command/Finance/_components/RevenueProfitChart";
import { IFUCalculator } from "@/views/Command/Finance/_components/IFUCalculator";

// Analytics
import { PaymentMethodAnalytics } from "./_components/PaymentMethodAnalytics";
import { CostAdSpendChart } from "./_components/CostAdSpendChart";
import { ReportSidebar } from "./_components/ReportSidebar";
import { ReportBuilder } from "./_components/ReportBuilder";

export default function FinancePage() {
    const [reportCategory, setReportCategory] = useState("lifecycle");

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Banknote className="h-6 w-6 text-purple-500" />
                    </div>
                    Tableau de Bord (Finance & Insights)
                </h1>
                <p className="text-muted-foreground mt-1">
                    Revenue KPIs, Profitability, and Cash Collection
                </p>
            </div>

            <Tabs defaultValue="revenue-kpis" className="space-y-6">
                <TabsList className="grid w-full max-w-4xl grid-cols-5">
                    <TabsTrigger value="revenue-kpis" className="gap-2">
                        <Banknote className="h-4 w-4" /> Revenue
                    </TabsTrigger>
                    <TabsTrigger value="profitability" className="gap-2">
                        <PieChart className="h-4 w-4" /> Profit
                    </TabsTrigger>
                    <TabsTrigger value="cash-collector" className="gap-2">
                        <Wallet className="h-4 w-4" /> Cash
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="gap-2">
                        <FileText className="h-4 w-4" /> Reports
                    </TabsTrigger>
                    <TabsTrigger value="utilities" className="gap-2">
                        <Banknote className="h-4 w-4" /> Utilities
                    </TabsTrigger>
                </TabsList>

                {/* Revenue KPIs */}
                <TabsContent value="revenue-kpis" className="space-y-6">
                    <RevenueProfitChart />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CostAdSpendChart />
                        <PaymentMethodAnalytics />
                    </div>
                </TabsContent>

                {/* Profitability */}
                <TabsContent value="profitability" className="space-y-6">
                    <ProfitCalculator />
                </TabsContent>

                {/* Cash Collector */}
                <TabsContent value="cash-collector" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardContent className="pt-6">
                                <CashCollector />
                            </CardContent>
                        </Card>
                        <CodCashTracker />
                    </div>
                </TabsContent>

                {/* Report Builder */}
                <TabsContent value="reports" className="space-y-6">
                    <Card className="h-full">
                        <CardHeader><CardTitle>Report Builder</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <ReportSidebar
                                    activeCategory={reportCategory}
                                    onCategoryChange={setReportCategory}
                                />
                                <div className="flex-1">
                                    <ReportBuilder category={reportCategory} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Utilities */}
                <TabsContent value="utilities" className="space-y-6">
                    <IFUCalculator />
                </TabsContent>
            </Tabs>
        </div>
    );
}
