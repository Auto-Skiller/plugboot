"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Users, Flame, CreditCard, UserCheck, Package, Truck, CheckCircle2, RotateCcw, Bot, Globe, MoreHorizontal, TrendingUp, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { NumberTicker } from "@/components/core/ui/advanced-motion";
import { TrafficSourcesChart, SourceData } from "@/views/Growth/Marketing/_components/traffic/TrafficSourcesChart";

interface SourceBreakdown {
    name: string;
    count: number;
    icon?: React.ReactNode;
}

interface FunnelStage {
    id: string;
    label: string;
    description?: string;
    count: number;
    icon: React.ReactNode;
    color: string;
    sources?: SourceBreakdown[];
    revenue?: number;        // Revenue at this stage
    avgTime?: string;        // Avg time in stage (e.g., "2.3 days")
}

// Traffic Source Data for the table
export interface TrafficSourceItem {
    name: string;
    visitors: number;
    orders: number;
    revenue: number;
    conversion: number; // Numeric for sorting
}

interface LifecycleFunnelProps {
    stages?: FunnelStage[];
    className?: string;
    ordersSourceData?: SourceData[];
    trafficSourcesData?: TrafficSourceItem[];
    // Conversion metrics
    confirmationRate?: number;
    deliverySuccess?: number;
    returnRate?: number;
    // Hide Traffic section (for split view usage)
    hideTrafficSection?: boolean;
}

// Algerian COD Flow Mock Data
const codStages: FunnelStage[] = [
    {
        id: "lead",
        label: "New Leads",
        description: "Captured Interest",
        count: 1250,
        icon: <Users className="h-5 w-5" />,
        color: "bg-blue-500",
        revenue: 0,
        avgTime: "0.5 days",
        sources: [
            { name: "Chatbot", count: 500, icon: <Bot className="h-3 w-3" /> },
            { name: "Landing Page", count: 450, icon: <Globe className="h-3 w-3" /> },
            { name: "Social", count: 300, icon: <MoreHorizontal className="h-3 w-3" /> }
        ]
    },
    {
        id: "qualified",
        label: "Qualified",
        description: "Confirmed via Call",
        count: 850,
        icon: <Flame className="h-5 w-5" />,
        color: "bg-amber-500",
        revenue: 0,
        avgTime: "1.2 days",
        sources: [
            { name: "Phone Call", count: 650, icon: <UserCheck className="h-3 w-3" /> },
            { name: "WhatsApp", count: 200, icon: <MoreHorizontal className="h-3 w-3" /> }
        ]
    },
    {
        id: "order_placed",
        label: "Order Placed",
        description: "Ready to Ship",
        count: 820,
        icon: <CreditCard className="h-5 w-5" />,
        color: "bg-indigo-500",
        revenue: 4100000,
        avgTime: "0.8 days",
        sources: [
            { name: "COD", count: 780, icon: <Package className="h-3 w-3" /> },
            { name: "Prepaid", count: 40, icon: <CreditCard className="h-3 w-3" /> }
        ]
    },
    {
        id: "shipped",
        label: "Shipped",
        description: "With Courier",
        count: 780,
        icon: <Truck className="h-5 w-5" />,
        color: "bg-cyan-500",
        revenue: 3900000,
        avgTime: "2.5 days",
        sources: [
            { name: "Yalidine", count: 450, icon: <Truck className="h-3 w-3" /> },
            { name: "ZR Express", count: 330, icon: <Truck className="h-3 w-3" /> }
        ]
    },
    {
        id: "delivered",
        label: "Delivered",
        description: "Payment Received",
        count: 700,
        icon: <CheckCircle2 className="h-5 w-5" />,
        color: "bg-emerald-500",
        revenue: 3500000,
        avgTime: "Completed"
    },
    {
        id: "returned",
        label: "Returned",
        description: "Failed / Refused",
        count: 80,
        icon: <RotateCcw className="h-5 w-5" />,
        color: "bg-rose-500",
        revenue: -400000,
        avgTime: "5.2 days"
    },
];

export function LifecycleFunnel({
    stages = codStages,
    className,
    ordersSourceData,
    trafficSourcesData,
    confirmationRate = 78,
    deliverySuccess = 92,
    returnRate = 8,
    hideTrafficSection = false
}: LifecycleFunnelProps) {
    const totalLeads = stages[0]?.count || 1;

    // Separate Returned from the main success flow for calculation
    const mainFlowStages = stages.filter(s => s.id !== 'returned');
    const returnedStage = stages.find(s => s.id === 'returned');
    const orderStage = stages.find(s => s.id === 'order_placed');
    const deliveredStage = stages.find(s => s.id === 'delivered');

    // Calculate Summary Metrics
    const conversionRate = deliveredStage ? ((deliveredStage.count / totalLeads) * 100).toFixed(1) : "0.0";
    const totalOrders = orderStage ? orderStage.count : 0;
    const calculatedReturnRate = returnedStage ? ((returnedStage.count / totalLeads) * 100).toFixed(1) : "0.0";

    // Expanded Summary Metrics (merged with Conversion Metrics)
    const SUMMARY_METRICS = [
        { label: "Total Leads", value: totalLeads.toLocaleString(), change: "+14%", icon: Users, color: "text-blue-500" },
        { label: "Conversion Rate", value: `${conversionRate}%`, change: "+2.1%", icon: Flame, color: "text-amber-500" },
        { label: "Confirmed Orders", value: totalOrders.toLocaleString(), change: "+8%", icon: CreditCard, color: "text-indigo-500" },
        { label: "Confirmation Rate", value: `${confirmationRate}%`, change: "+3.2%", icon: CheckCircle2, color: "text-green-500" },
        { label: "Delivery Success", value: `${deliverySuccess}%`, change: "+1.5%", icon: Truck, color: "text-purple-500" },
        { label: "Return Rate", value: `${calculatedReturnRate}%`, change: "-0.5%", icon: RotateCcw, color: "text-rose-500" },
    ];

    return (
        <Card className={cn("overflow-hidden border shadow-sm transition-all duration-500", className)}>
            <CardHeader className="bg-muted/30 pb-4">
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            Lead Lifecycle & Acquisition (COD)
                        </CardTitle>
                        <CardDescription>
                            Tracking the complete customer journey from acquisition to delivery
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">

                {/* 1. Summary Metrics Grid (6 KPIs - 2 rows of 3) */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {SUMMARY_METRICS.map((metric, i) => (
                        <div key={i} className="bg-card border rounded-xl p-4 flex flex-col gap-2 hover:border-primary/50 transition-colors">
                            <div className="flex justify-between items-start">
                                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{metric.label}</span>
                                <div className={`p-1.5 rounded-full bg-background border shadow-sm ${metric.color}`}>
                                    <metric.icon className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">{metric.value}</span>
                                <span className={cn(
                                    "text-xs font-medium px-1 py-0.5 rounded",
                                    metric.change.startsWith('+')
                                        ? "text-emerald-500 bg-emerald-500/10"
                                        : "text-rose-500 bg-rose-500/10"
                                )}>
                                    {metric.change}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. Conversion Path (Full Width) */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between pl-1">
                        <h3 className="font-semibold flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            Conversion Path
                        </h3>
                    </div>

                    <div className="relative">
                        {/* Continuous Connector Line */}
                        <div className="absolute left-[2.4rem] top-6 bottom-6 w-0.5 bg-gradient-to-b from-border/50 via-border to-transparent -z-10 hidden sm:block" />

                        <div className="space-y-3">
                            {mainFlowStages.map((stage, index) => {
                                const previousCount = index > 0 ? mainFlowStages[index - 1].count : totalLeads;
                                const stageConversionRate = ((stage.count / previousCount) * 100).toFixed(1);
                                const overallRate = ((stage.count / totalLeads) * 100).toFixed(1);
                                const widthPercentage = Math.max(40, (stage.count / totalLeads) * 100);
                                const dropOff = index > 0 ? ((1 - (stage.count / previousCount)) * 100).toFixed(1) : "0";

                                return (
                                    <div key={stage.id} className="relative group animate-in fade-in slide-in-from-left-4 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                                        <div className="flex items-start gap-3">
                                            {/* Icon Bubble - Compact */}
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white shadow-md ring-2 ring-background transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 mt-1",
                                                stage.color
                                            )}>
                                                {React.cloneElement(stage.icon as React.ReactElement, { className: "w-5 h-5" })}
                                            </div>

                                            {/* Bar Container - Streamlined */}
                                            <div
                                                className={cn(
                                                    "relative flex-1 rounded-lg p-3 transition-all duration-300 border border-transparent hover:border-border/50",
                                                    "bg-gradient-to-r from-muted/50 to-muted/10 hover:from-muted/70 hover:to-muted/30"
                                                )}
                                                style={{ maxWidth: `${widthPercentage}%`, minWidth: '340px' }}
                                            >
                                                {/* Header: Label + Count + Total% */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-xs text-foreground/90">{stage.label}</span>
                                                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium opacity-70 hidden sm:inline-block">{stage.description}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold text-white", stage.color)}>
                                                            {overallRate}%
                                                        </span>
                                                        <div className="font-bold text-lg leading-none">
                                                            <NumberTicker value={stage.count} duration={1} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Single Line Details Row */}
                                                <div className="flex items-center gap-3 text-[10px] bg-background/40 p-1.5 rounded border border-border/20 overflow-x-auto scrollbar-hide">
                                                    {stage.revenue !== undefined && stage.revenue !== 0 && (
                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                            <span className="text-muted-foreground">Rev:</span>
                                                            <span className={cn("font-mono font-medium", stage.revenue > 0 ? "text-green-600 dark:text-green-400" : "text-red-500")}>
                                                                {stage.revenue > 0 ? "+" : ""}{(stage.revenue / 1000).toFixed(0)}K
                                                            </span>
                                                        </div>
                                                    )}
                                                    {stage.avgTime && (
                                                        <>
                                                            <div className="w-px h-3 bg-border/50 flex-shrink-0" />
                                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                                <span className="text-muted-foreground">Time:</span>
                                                                <span className="font-mono font-medium">{stage.avgTime}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    {index > 0 && (
                                                        <>
                                                            <div className="w-px h-3 bg-border/50 flex-shrink-0" />
                                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                                <span className="text-muted-foreground">Conv:</span>
                                                                <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{stageConversionRate}%</span>
                                                            </div>
                                                            <div className="w-px h-3 bg-border/50 flex-shrink-0" />
                                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                                <span className="text-muted-foreground">Drop:</span>
                                                                <span className="font-mono font-medium text-red-500">{dropOff}%</span>
                                                            </div>
                                                        </>
                                                    )}

                                                    {/* Source Breakdown - Inline */}
                                                    {stage.sources && stage.sources.length > 0 && (
                                                        <>
                                                            <div className="w-px h-3 bg-border/50 flex-shrink-0 mx-1" />
                                                            {stage.sources.map((source, i) => (
                                                                <div key={i} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/60 border border-border/30 text-[9px] flex-shrink-0">
                                                                    {source.icon && <span className="opacity-70 scale-75">{source.icon}</span>}
                                                                    <span className="font-medium truncate max-w-[60px]">{source.name}</span>
                                                                    <span className="font-mono text-muted-foreground ml-0.5">{source.count}</span>
                                                                </div>
                                                            ))}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Returned Branch */}
                        {returnedStage && (
                            <div className="mt-8 ml-16 pt-6 border-t border-dashed flex items-center animate-in fade-in duration-1000 delay-500">
                                <div className="bg-rose-500/5 border border-rose-500/20 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-lg flex items-center gap-3 w-full sm:w-auto hover:bg-rose-500/10 transition-colors cursor-help">
                                    <div className="p-1.5 bg-rose-500/10 rounded-full">
                                        <RotateCcw className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold">Returned / Refused</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-bold">{returnedStage.count}</span>
                                            <span className="text-[10px] opacity-80">({((returnedStage.count / totalLeads) * 100).toFixed(1)}% Rate)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* 3. Traffic & Acquisition (Table + Chart side-by-side) - conditionally shown */}
                {!hideTrafficSection && (
                    <TrafficAcquisitionSection
                        trafficSourcesData={trafficSourcesData}
                        ordersSourceData={ordersSourceData}
                    />
                )}
            </CardContent>
        </Card>
    );
}

// ============================================
// Traffic & Acquisition Section (with Sorting)
// ============================================
type SortableColumn = 'visitors' | 'orders' | 'revenue' | 'conversion';

export function TrafficAcquisitionSection({
    trafficSourcesData,
    ordersSourceData
}: {
    trafficSourcesData?: TrafficSourceItem[];
    ordersSourceData?: SourceData[];
}) {
    const [sortBy, setSortBy] = React.useState<SortableColumn>('orders');
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');

    if (!trafficSourcesData && !ordersSourceData) return null;

    // Sort handler
    const handleSort = (column: SortableColumn) => {
        if (sortBy === column) {
            setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(column);
            setSortDirection('desc');
        }
    };

    // Sorted data
    const sortedData = trafficSourcesData
        ? [...trafficSourcesData].sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
        })
        : [];

    // Dynamic pie chart data based on sortBy
    const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#64748b'];
    const dynamicChartData: SourceData[] = sortedData.map((source, i) => {
        const total = sortedData.reduce((sum, s) => sum + s[sortBy], 0);
        return {
            name: source.name,
            value: source[sortBy],
            percentage: total > 0 ? Math.round((source[sortBy] / total) * 100) : 0,
            fill: COLORS[i % COLORS.length]
        };
    });

    // Chart title based on sortBy
    const chartTitles: Record<SortableColumn, string> = {
        visitors: 'Visitors by Source',
        orders: 'Orders by Source',
        revenue: 'Revenue by Source',
        conversion: 'Conversion by Source'
    };

    // Sort indicator
    const SortIndicator = ({ column }: { column: SortableColumn }) => (
        <span className="ml-1 opacity-60">
            {sortBy === column ? (sortDirection === 'desc' ? '↓' : '↑') : ''}
        </span>
    );

    return (
        <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Traffic & Acquisition
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Traffic Sources Table (2/3 width) */}
                {sortedData.length > 0 && (
                    <div className="lg:col-span-2 overflow-x-auto rounded-lg border">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/50 border-b">
                                    <th className="text-left py-3 px-4 font-medium text-sm">Source</th>
                                    <th
                                        className="text-right py-3 px-4 font-medium text-sm cursor-pointer hover:bg-muted/70 transition-colors"
                                        onClick={() => handleSort('visitors')}
                                    >
                                        Visitors<SortIndicator column="visitors" />
                                    </th>
                                    <th
                                        className="text-right py-3 px-4 font-medium text-sm cursor-pointer hover:bg-muted/70 transition-colors"
                                        onClick={() => handleSort('orders')}
                                    >
                                        Orders<SortIndicator column="orders" />
                                    </th>
                                    <th
                                        className="text-right py-3 px-4 font-medium text-sm cursor-pointer hover:bg-muted/70 transition-colors"
                                        onClick={() => handleSort('revenue')}
                                    >
                                        Revenue<SortIndicator column="revenue" />
                                    </th>
                                    <th className="text-right py-3 px-4 font-medium text-sm">Avg Value</th>
                                    <th
                                        className="text-right py-3 px-4 font-medium text-sm cursor-pointer hover:bg-muted/70 transition-colors"
                                        onClick={() => handleSort('conversion')}
                                    >
                                        Conv.<SortIndicator column="conversion" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.map((source) => (
                                    <tr key={source.name} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                                        <td className="py-3 px-4 font-medium text-sm">{source.name}</td>
                                        <td className="py-3 px-4 text-right text-sm text-muted-foreground">{source.visitors.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-right text-sm">{source.orders.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-right font-medium text-sm">{source.revenue.toLocaleString()} DA</td>
                                        <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                                            {source.orders > 0 ? Math.round(source.revenue / source.orders).toLocaleString() : 0} DA
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                {source.conversion}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Right: Dynamic Chart (1/3 width) */}
                {dynamicChartData.length > 0 && (
                    <div className="lg:col-span-1 space-y-3">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
                            {chartTitles[sortBy]}
                        </div>
                        <div className="bg-card/50 rounded-xl p-4 border border-border/50 shadow-sm h-[260px]">
                            <TrafficSourcesChart data={dynamicChartData} minimal={true} hideLegend={true} />
                        </div>
                        {/* Source Badges Legend */}
                        <div className="grid grid-cols-2 gap-2">
                            {dynamicChartData.map((d, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-transparent hover:border-border text-xs">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill as string }}></div>
                                    <span className="font-medium truncate">{d.name}</span>
                                    <span className="ml-auto font-mono text-muted-foreground">{d.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
