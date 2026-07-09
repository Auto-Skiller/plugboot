"use client";

import * as React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    FunnelChart,
    Funnel,
    LabelList,
} from "recharts";
import { cn } from "@/lib/utils";
import { algeriaColors, deliveryCompanies, getDeliveryCompanyById } from "@/lib/chart-utils";
import { ArrowRight, TrendingUp, TrendingDown, Package, Truck, CheckCircle, XCircle, Clock, RotateCcw } from "lucide-react";

// ============================================================================
// ORDER STATUS TYPES
// ============================================================================

export type OrderStatus = "new" | "confirmed" | "shipped" | "in_transit" | "delivered" | "returned" | "cancelled";

export interface OrderStatusData {
    status: OrderStatus;
    count: number;
    percentage: number;
    trend?: number;
}

export interface OrderByDeliveryCompany {
    company: string;
    orders: number;
    delivered: number;
    returned: number;
    avgDays: number;
    successRate: number;
}

// ============================================================================
// STATUS CONFIG
// ============================================================================

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
    new: { label: "New", color: algeriaColors.status.new, icon: Package },
    confirmed: { label: "Confirmed", color: algeriaColors.status.confirmed, icon: CheckCircle },
    shipped: { label: "Shipped", color: algeriaColors.status.shipped, icon: Truck },
    in_transit: { label: "In Transit", color: algeriaColors.status.inTransit, icon: Truck },
    delivered: { label: "Delivered", color: algeriaColors.status.delivered, icon: CheckCircle },
    returned: { label: "Returned", color: algeriaColors.status.returned, icon: RotateCcw },
    cancelled: { label: "Cancelled", color: algeriaColors.status.cancelled, icon: XCircle },
};

// ============================================================================
// ORDER STATUS BREAKDOWN CHART
// ============================================================================

interface OrderStatusBreakdownProps {
    data: OrderStatusData[];
    height?: number;
    showTrend?: boolean;
    onStatusClick?: (status: OrderStatus) => void;
    className?: string;
}

export function OrderStatusBreakdown({
    data,
    height = 300,
    showTrend = true,
    onStatusClick,
    className,
}: OrderStatusBreakdownProps) {
    const chartData = data.map(item => ({
        ...item,
        ...statusConfig[item.status],
        fill: statusConfig[item.status].color,
    }));

    return (
        <div className={cn("w-full", className)}>
            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis
                        type="category"
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const data = payload[0].payload;
                            return (
                                <div className="bg-card/95 backdrop-blur-xl border rounded-xl p-3 shadow-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                                        <span className="font-medium">{data.label}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {data.count} orders ({data.percentage.toFixed(1)}%)
                                    </p>
                                    {showTrend && data.trend !== undefined && (
                                        <p className={cn("text-xs flex items-center gap-1 mt-1", data.trend >= 0 ? "text-green-500" : "text-red-500")}>
                                            {data.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                            {Math.abs(data.trend)}% vs last period
                                        </p>
                                    )}
                                </div>
                            );
                        }}
                    />
                    <Bar
                        dataKey="count"
                        radius={[0, 6, 6, 0]}
                        cursor={onStatusClick ? "pointer" : undefined}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.fill}
                                onClick={() => onStatusClick?.(entry.status)}
                                style={onStatusClick ? { cursor: "pointer" } : undefined}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Legend with icons */}
            <div className="flex flex-wrap gap-4 justify-center mt-4">
                {chartData.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.status}
                            onClick={() => onStatusClick?.(item.status)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors",
                                "hover:bg-muted",
                                onStatusClick && "cursor-pointer"
                            )}
                        >
                            <Icon className="h-4 w-4" style={{ color: item.color }} />
                            <span>{item.label}</span>
                            <span className="text-muted-foreground">({item.count})</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================================
// ORDER FUNNEL CHART
// ============================================================================

interface FunnelData {
    name: string;
    value: number;
    fill: string;
}

interface OrderFunnelProps {
    data?: {
        ordered: number;
        confirmed: number;
        shipped: number;
        delivered: number;
        completed: number;
    };
    height?: number;
    className?: string;
}

export function OrderFunnel({
    data = { ordered: 1000, confirmed: 850, shipped: 780, delivered: 720, completed: 680 },
    height = 350,
    className,
}: OrderFunnelProps) {
    const funnelData: FunnelData[] = [
        { name: "Ordered", value: data.ordered, fill: algeriaColors.status.new },
        { name: "Confirmed", value: data.confirmed, fill: algeriaColors.status.confirmed },
        { name: "Shipped", value: data.shipped, fill: algeriaColors.status.shipped },
        { name: "Delivered", value: data.delivered, fill: algeriaColors.status.inTransit },
        { name: "Completed", value: data.completed, fill: algeriaColors.status.delivered },
    ];

    // Calculate drop-off rates
    const dropoffs = funnelData.map((item, index) => {
        if (index === 0) return null;
        const prev = funnelData[index - 1].value;
        const drop = ((prev - item.value) / prev) * 100;
        return drop.toFixed(1);
    });

    return (
        <div className={cn("w-full", className)}>
            <ResponsiveContainer width="100%" height={height}>
                <FunnelChart>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const data = payload[0].payload;
                            const conversionFromStart = ((data.value / funnelData[0].value) * 100).toFixed(1);
                            return (
                                <div className="bg-card/95 backdrop-blur-xl border rounded-xl p-3 shadow-lg">
                                    <p className="font-medium">{data.name}</p>
                                    <p className="text-sm text-muted-foreground">{data.value.toLocaleString()} orders</p>
                                    <p className="text-xs text-green-500 mt-1">{conversionFromStart}% from start</p>
                                </div>
                            );
                        }}
                    />
                    <Funnel
                        dataKey="value"
                        data={funnelData}
                        isAnimationActive
                    >
                        <LabelList
                            position="right"
                            fill="hsl(var(--foreground))"
                            stroke="none"
                            dataKey="name"
                            fontSize={12}
                        />
                        <LabelList
                            position="center"
                            fill="#fff"
                            stroke="none"
                            dataKey="value"
                            formatter={(value: any) =>
                                typeof value === 'number' ? value.toLocaleString() : String(value ?? '')
                            }
                            fontSize={14}
                            fontWeight="bold"
                        />
                    </Funnel>
                </FunnelChart>
            </ResponsiveContainer>

            {/* Conversion rates */}
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                {funnelData.map((item, index) => (
                    <React.Fragment key={item.name}>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/50">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className="text-xs font-medium">{item.name}</span>
                        </div>
                        {index < funnelData.length - 1 && (
                            <div className="flex items-center text-xs text-muted-foreground">
                                <ArrowRight className="h-3 w-3 mx-1" />
                                <span className="text-red-500">-{dropoffs[index + 1]}%</span>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// DELIVERY COMPANY COMPARISON
// ============================================================================

interface DeliveryComparisonProps {
    data: OrderByDeliveryCompany[];
    height?: number;
    className?: string;
}

export function DeliveryCompanyComparison({
    data,
    height = 300,
    className,
}: DeliveryComparisonProps) {
    const chartData = data.map(item => {
        const company = getDeliveryCompanyById(item.company);
        return {
            ...item,
            name: company?.name || item.company,
            color: company?.color || "#666",
        };
    });

    return (
        <div className={cn("w-full space-y-4", className)}>
            {/* Header metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {chartData.map((company) => (
                    <div
                        key={company.company}
                        className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                        style={{ borderLeftColor: company.color, borderLeftWidth: 4 }}
                    >
                        <p className="text-sm text-muted-foreground">{company.name}</p>
                        <p className="text-2xl font-bold">{company.orders}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-green-500">{company.successRate.toFixed(1)}% success</span>
                            <span className="text-xs text-muted-foreground">• {company.avgDays.toFixed(1)}d avg</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bar chart comparison */}
            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const data = payload[0].payload;
                            return (
                                <div className="bg-card/95 backdrop-blur-xl border rounded-xl p-4 shadow-lg">
                                    <p className="font-semibold mb-2" style={{ color: data.color }}>{data.name}</p>
                                    <div className="space-y-1 text-sm">
                                        <p>Total Orders: <span className="font-medium">{data.orders}</span></p>
                                        <p className="text-green-500">Delivered: {data.delivered}</p>
                                        <p className="text-red-500">Returned: {data.returned}</p>
                                        <p className="text-muted-foreground">Avg Delivery: {data.avgDays.toFixed(1)} days</p>
                                        <p className="font-medium mt-2">Success Rate: {data.successRate.toFixed(1)}%</p>
                                    </div>
                                </div>
                            );
                        }}
                    />
                    <Bar dataKey="delivered" name="Delivered" stackId="a" radius={[0, 0, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-delivered-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                    <Bar dataKey="returned" name="Returned" stackId="a" fill={algeriaColors.status.returned} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>

            {/* Summary table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-2 px-3">Company</th>
                            <th className="text-right py-2 px-3">Orders</th>
                            <th className="text-right py-2 px-3">Delivered</th>
                            <th className="text-right py-2 px-3">Returned</th>
                            <th className="text-right py-2 px-3">Avg Days</th>
                            <th className="text-right py-2 px-3">Success</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chartData.map((company) => (
                            <tr key={company.company} className="border-b hover:bg-muted/50 transition-colors">
                                <td className="py-2 px-3 flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: company.color }} />
                                    {company.name}
                                </td>
                                <td className="text-right py-2 px-3 font-medium">{company.orders}</td>
                                <td className="text-right py-2 px-3 text-green-500">{company.delivered}</td>
                                <td className="text-right py-2 px-3 text-red-500">{company.returned}</td>
                                <td className="text-right py-2 px-3">{company.avgDays.toFixed(1)}d</td>
                                <td className="text-right py-2 px-3">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-medium",
                                        company.successRate >= 90 ? "bg-green-500/20 text-green-500" :
                                            company.successRate >= 80 ? "bg-yellow-500/20 text-yellow-500" :
                                                "bg-red-500/20 text-red-500"
                                    )}>
                                        {company.successRate.toFixed(1)}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ============================================================================
// DEMO DATA GENERATORS
// ============================================================================

export function generateOrderStatusData(): OrderStatusData[] {
    const base = Math.floor(Math.random() * 500) + 500;
    const statuses: { status: OrderStatus; factor: number }[] = [
        { status: "delivered", factor: 1.0 },
        { status: "in_transit", factor: 0.25 },
        { status: "shipped", factor: 0.15 },
        { status: "confirmed", factor: 0.12 },
        { status: "new", factor: 0.08 },
        { status: "returned", factor: 0.06 },
        { status: "cancelled", factor: 0.04 },
    ];

    const data = statuses.map(({ status, factor }) => ({
        status,
        count: Math.floor(base * factor * (0.8 + Math.random() * 0.4)),
        percentage: 0,
        trend: Math.floor(Math.random() * 20) - 10,
    }));

    const total = data.reduce((sum, d) => sum + d.count, 0);
    data.forEach(d => d.percentage = (d.count / total) * 100);

    return data;
}

export function generateDeliveryCompanyData(): OrderByDeliveryCompany[] {
    return deliveryCompanies.slice(0, 4).map(company => {
        const orders = Math.floor(Math.random() * 300) + 100;
        const returned = Math.floor(orders * (0.05 + Math.random() * 0.1));
        const delivered = orders - returned - Math.floor(orders * 0.15);

        return {
            company: company.id,
            orders,
            delivered,
            returned,
            avgDays: company.avgDeliveryDays + (Math.random() - 0.5),
            successRate: (delivered / orders) * 100,
        };
    });
}
