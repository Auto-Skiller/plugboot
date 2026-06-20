"use client";

import * as React from "react";
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Maximize2, X } from "lucide-react";

// ============================================================================
// THEME-AWARE CHART COLORS (using CSS variables)
// ============================================================================

export const chartColors = {
    // Semantic colors
    primary: "hsl(var(--primary))",
    secondary: "hsl(var(--secondary))",
    accent: "hsl(var(--accent))",
    muted: "hsl(var(--muted))",
    destructive: "hsl(var(--destructive))",

    // Chart-specific semantic colors
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",

    // Extended palette (color-blind friendly)
    palette: [
        "#3b82f6", // Blue
        "#22c55e", // Green
        "#a855f7", // Purple
        "#f97316", // Orange
        "#ec4899", // Pink
        "#06b6d4", // Cyan
        "#eab308", // Yellow
        "#6366f1", // Indigo
    ],
};

// Get contrasting text color
function getContrastColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
}

// ============================================================================
// ENHANCED GLASSMORPHISM TOOLTIP
// ============================================================================

interface EnhancedTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color: string;
        payload?: Record<string, number>;
    }>;
    label?: string;
    formatter?: (value: number) => string;
    showTrend?: boolean;
    previousDataKey?: string;
}

function EnhancedTooltip({
    active,
    payload,
    label,
    formatter = (v) => v.toLocaleString(),
    showTrend = false,
}: EnhancedTooltipProps) {
    if (!active || !payload?.length) return null;

    return (
        <div className={cn(
            "relative",
            "bg-card/95 backdrop-blur-xl",
            "border border-border/50",
            "shadow-2xl shadow-black/20",
            "rounded-xl p-4",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            "min-w-[160px]"
        )}>
            {/* Arrow pointer */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-card/95 border-r border-b border-border/50" />

            {/* Label */}
            <p className="text-sm font-semibold text-foreground mb-3 border-b border-border/30 pb-2">
                {label}
            </p>

            {/* Values */}
            <div className="space-y-2">
                {payload.map((entry, index) => {
                    const prevValue = entry.payload?.[`prev_${entry.name}`];
                    const change = prevValue ? ((entry.value - prevValue) / prevValue) * 100 : null;

                    return (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full ring-2 ring-offset-1 ring-offset-card"
                                    style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}40` }}
                                />
                                <span className="text-sm text-muted-foreground capitalize">{entry.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground">
                                    {formatter(entry.value)}
                                </span>
                                {showTrend && change !== null && (
                                    <span className={cn(
                                        "flex items-center gap-0.5 text-xs font-medium",
                                        change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-muted-foreground"
                                    )}>
                                        {change > 0 ? <TrendingUp className="h-3 w-3" /> :
                                            change < 0 ? <TrendingDown className="h-3 w-3" /> :
                                                <Minus className="h-3 w-3" />}
                                        {Math.abs(change).toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================================
// RESPONSIVE CHART CONTAINER
// ============================================================================

interface ChartContainerProps {
    children: React.ReactNode;
    height?: number | string;
    aspectRatio?: "video" | "square" | "wide" | "ultrawide";
    className?: string;
    fullScreenEnabled?: boolean;
    title?: string;
}

const aspectRatios = {
    video: "aspect-video", // 16:9
    square: "aspect-square", // 1:1
    wide: "aspect-[21/9]", // 21:9
    ultrawide: "aspect-[32/9]", // 32:9
};

export function ChartContainer({
    children,
    height,
    aspectRatio,
    className,
    fullScreenEnabled = false,
    title,
}: ChartContainerProps) {
    const [isFullScreen, setIsFullScreen] = React.useState(false);

    const containerClass = cn(
        "w-full",
        !height && aspectRatio && aspectRatios[aspectRatio],
        className
    );

    const content = (
        <div className={containerClass} style={height ? { height } : undefined}>
            {fullScreenEnabled && (
                <button
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-muted/80 hover:bg-muted transition-colors"
                >
                    {isFullScreen ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
            )}
            {children}
        </div>
    );

    if (isFullScreen) {
        return (
            <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-8 animate-in fade-in zoom-in-95">
                <div className="h-full flex flex-col">
                    {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
                    <div className="flex-1 relative">{content}</div>
                </div>
            </div>
        );
    }

    return <div className="relative">{content}</div>;
}

// ============================================================================
// ENHANCED AREA CHART
// ============================================================================

interface AreaChartData {
    name: string;
    [key: string]: number | string;
}

interface RevenueAreaChartProps {
    data: AreaChartData[];
    dataKeys: string[];
    colors?: string[];
    height?: number | string;
    aspectRatio?: "video" | "square" | "wide" | "ultrawide";
    showGrid?: boolean;
    showLegend?: boolean;
    showGradient?: boolean;
    formatter?: (value: number) => string;
    className?: string;
    fullScreenEnabled?: boolean;
}

export function RevenueAreaChart({
    data,
    dataKeys,
    colors = chartColors.palette,
    height,
    aspectRatio = "video",
    showGrid = true,
    showLegend = false,
    showGradient = true,
    formatter = (v) => `${v.toLocaleString()} DZD`,
    className,
    fullScreenEnabled = false,
}: RevenueAreaChartProps) {
    return (
        <ChartContainer
            height={height}
            aspectRatio={!height ? aspectRatio : undefined}
            className={className}
            fullScreenEnabled={fullScreenEnabled}
        >
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    {/* Gradient definitions */}
                    {showGradient && (
                        <defs>
                            {dataKeys.map((key, index) => (
                                <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.05} />
                                </linearGradient>
                            ))}
                        </defs>
                    )}

                    {showGrid && (
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            strokeOpacity={0.5}
                            vertical={false}
                        />
                    )}
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        dx={-10}
                    />
                    <Tooltip content={<EnhancedTooltip formatter={formatter} showTrend />} />
                    {showLegend && <Legend />}
                    {dataKeys.map((key, index) => (
                        <Area
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={colors[index % colors.length]}
                            fill={showGradient ? `url(#gradient-${key})` : colors[index % colors.length]}
                            fillOpacity={showGradient ? 1 : 0.2}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                                r: 6,
                                strokeWidth: 2,
                                stroke: "hsl(var(--background))",
                                fill: colors[index % colors.length],
                            }}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}

// ============================================================================
// ENHANCED LINE CHART
// ============================================================================

interface TrendLineChartProps {
    data: AreaChartData[];
    dataKeys: string[];
    colors?: string[];
    height?: number | string;
    aspectRatio?: "video" | "square" | "wide" | "ultrawide";
    showGrid?: boolean;
    showDots?: boolean;
    curved?: boolean;
    className?: string;
}

export function TrendLineChart({
    data,
    dataKeys,
    colors = chartColors.palette,
    height,
    aspectRatio = "video",
    showGrid = true,
    showDots = false,
    curved = true,
    className,
}: TrendLineChartProps) {
    return (
        <ChartContainer height={height} aspectRatio={!height ? aspectRatio : undefined} className={className}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    {showGrid && (
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
                    )}
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <Tooltip content={<EnhancedTooltip />} />
                    {dataKeys.map((key, index) => (
                        <Line
                            key={key}
                            type={curved ? "monotone" : "linear"}
                            dataKey={key}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            dot={showDots ? { fill: colors[index % colors.length], strokeWidth: 0, r: 4 } : false}
                            activeDot={{ r: 6, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}

// ============================================================================
// ENHANCED BAR CHART
// ============================================================================

interface ComparisonBarChartProps {
    data: AreaChartData[];
    dataKeys: string[];
    colors?: string[];
    height?: number | string;
    aspectRatio?: "video" | "square" | "wide" | "ultrawide";
    showGrid?: boolean;
    stacked?: boolean;
    horizontal?: boolean;
    radius?: number;
    className?: string;
}

export function ComparisonBarChart({
    data,
    dataKeys,
    colors = chartColors.palette,
    height,
    aspectRatio = "video",
    showGrid = true,
    stacked = false,
    horizontal = false,
    radius = 6,
    className,
}: ComparisonBarChartProps) {
    return (
        <ChartContainer height={height} aspectRatio={!height ? aspectRatio : undefined} className={className}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout={horizontal ? "vertical" : "horizontal"}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    {showGrid && (
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                    )}
                    {horizontal ? (
                        <>
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        </>
                    ) : (
                        <>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                        </>
                    )}
                    <Tooltip content={<EnhancedTooltip />} />
                    {dataKeys.map((key, index) => (
                        <Bar
                            key={key}
                            dataKey={key}
                            fill={colors[index % colors.length]}
                            radius={[radius, radius, 0, 0]}
                            stackId={stacked ? "stack" : undefined}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}

// ============================================================================
// ENHANCED PIE / DONUT CHART
// ============================================================================

interface PieChartData {
    name: string;
    value: number;
    color?: string;
}

interface StatusPieChartProps {
    data: PieChartData[];
    colors?: string[];
    height?: number | string;
    aspectRatio?: "video" | "square";
    innerRadius?: number | string;
    showLabels?: boolean;
    showLegend?: boolean;
    centerLabel?: { value: string; label: string };
    className?: string;
}

export function StatusPieChart({
    data,
    colors = chartColors.palette,
    height,
    aspectRatio = "square",
    innerRadius = "60%",
    showLabels = false,
    showLegend = true,
    centerLabel,
    className,
}: StatusPieChartProps) {
    const dataWithColors = data.map((item, index) => ({
        ...item,
        color: item.color || colors[index % colors.length],
    }));

    return (
        <ChartContainer height={height} aspectRatio={!height ? aspectRatio : undefined} className={className}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={dataWithColors}
                        cx="50%"
                        cy="50%"
                        innerRadius={innerRadius}
                        outerRadius="80%"
                        paddingAngle={2}
                        dataKey="value"
                        label={showLabels ? ({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%` : false}
                        labelLine={showLabels}
                        strokeWidth={0}
                    >
                        {dataWithColors.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                style={{ filter: `drop-shadow(0 0 6px ${entry.color}40)` }}
                            />
                        ))}
                    </Pie>

                    {/* Center label for donut charts */}
                    {centerLabel && (
                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                            <tspan x="50%" dy="-0.5em" className="fill-foreground text-2xl font-bold">
                                {centerLabel.value}
                            </tspan>
                            <tspan x="50%" dy="1.5em" className="fill-muted-foreground text-sm">
                                {centerLabel.label}
                            </tspan>
                        </text>
                    )}

                    <Tooltip
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const data = payload[0].payload;
                            const total = dataWithColors.reduce((acc, item) => acc + item.value, 0);
                            const percentage = ((data.value / total) * 100).toFixed(1);

                            return (
                                <div className="bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-xl p-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                                        <span className="font-medium">{data.name}</span>
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                        {data.value.toLocaleString()} ({percentage}%)
                                    </div>
                                </div>
                            );
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}

// ============================================================================
// MINI SPARKLINE (inline chart)
// ============================================================================

interface SparklineProps {
    data: number[];
    color?: string;
    height?: number;
    showArea?: boolean;
    showTrend?: boolean;
    className?: string;
}

export function Sparkline({
    data,
    color = chartColors.palette[0],
    height = 40,
    showArea = true,
    showTrend = true,
    className,
}: SparklineProps) {
    const chartData = data.map((value, index) => ({ value, index }));
    const trend = data.length > 1 ? data[data.length - 1] - data[0] : 0;
    const trendColor = trend > 0 ? chartColors.success : trend < 0 ? chartColors.error : color;

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex-1" style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                        <defs>
                            <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            fill={showArea ? "url(#sparkline-gradient)" : "none"}
                            strokeWidth={1.5}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            {showTrend && (
                <div className={cn("flex items-center gap-0.5 text-xs font-medium", trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-muted-foreground")}>
                    {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// DEMO DATA GENERATORS
// ============================================================================

function randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate revenue data with realistic patterns
export function generateRevenueData(months: number = 7): AreaChartData[] {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();

    return Array.from({ length: months }, (_, i) => {
        const monthIndex = (now.getMonth() - months + i + 13) % 12;
        // Add seasonality: higher in Q4, lower in summer
        const seasonalFactor = monthIndex >= 9 || monthIndex <= 1 ? 1.2 : monthIndex >= 5 && monthIndex <= 7 ? 0.85 : 1;
        const baseRevenue = 50000 * seasonalFactor;

        return {
            name: monthNames[monthIndex],
            revenue: Math.floor(baseRevenue + randomInRange(-10000, 15000)),
            orders: randomInRange(120, 220),
            prev_revenue: Math.floor(baseRevenue * 0.9 + randomInRange(-8000, 10000)),
        };
    });
}

// Generate daily data for last N days
export function generateDailyData(days: number = 30): AreaChartData[] {
    const data: AreaChartData[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayOfWeek = date.getDay();
        // Weekend dip
        const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1;

        data.push({
            name: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            revenue: Math.floor(randomInRange(35000, 75000) * weekendFactor),
            orders: Math.floor(randomInRange(80, 180) * weekendFactor),
            visitors: randomInRange(500, 2000),
        });
    }

    return data;
}

// Generate status distribution data
export function generateStatusData(): PieChartData[] {
    const delivered = randomInRange(400, 600);
    const inTransit = randomInRange(100, 200);
    const pending = randomInRange(50, 150);
    const returned = randomInRange(20, 60);

    return [
        { name: "Delivered", value: delivered, color: chartColors.success },
        { name: "In Transit", value: inTransit, color: chartColors.info },
        { name: "Pending", value: pending, color: chartColors.warning },
        { name: "Returned", value: returned, color: chartColors.error },
    ];
}

// Generate sparkline data with trend
export function generateSparklineData(points: number = 12, trend: "up" | "down" | "flat" = "up"): number[] {
    const data: number[] = [];
    let current = randomInRange(10, 30);

    for (let i = 0; i < points; i++) {
        const trendFactor = trend === "up" ? 1.5 : trend === "down" ? -1.5 : 0;
        current = Math.max(5, current + randomInRange(-3, 5) + trendFactor);
        data.push(Math.floor(current));
    }

    return data;
}

// Algerian wilayas data for geographic charts
export const algerianWilayas = [
    { name: "Algiers", orders: randomInRange(200, 400) },
    { name: "Oran", orders: randomInRange(150, 300) },
    { name: "Constantine", orders: randomInRange(100, 200) },
    { name: "Setif", orders: randomInRange(80, 180) },
    { name: "Blida", orders: randomInRange(70, 150) },
    { name: "Batna", orders: randomInRange(60, 140) },
    { name: "Annaba", orders: randomInRange(50, 120) },
    { name: "Tlemcen", orders: randomInRange(40, 100) },
];

// Static demo data (for consistent examples)
export const demoRevenueData = generateRevenueData(7);
export const demoStatusData = generateStatusData();
export const demoSparklineData = generateSparklineData(12, "up");
