"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { algeriaColors, generateColorPalette } from "@/lib/chart-utils";

const roasData = [
    { date: "01/06", roas: 2.1, breakEven: 1.5 },
    { date: "02/06", roas: 2.4, breakEven: 1.5 },
    { date: "03/06", roas: 1.8, breakEven: 1.5 },
    { date: "04/06", roas: 3.2, breakEven: 1.5 },
    { date: "05/06", roas: 4.5, breakEven: 1.5 },
    { date: "06/06", roas: 3.8, breakEven: 1.5 },
    { date: "07/06", roas: 4.2, breakEven: 1.5 },
];

const spendRevenueData = [
    { date: "01/06", spend: 5000, revenue: 10500 },
    { date: "02/06", spend: 4500, revenue: 10800 },
    { date: "03/06", spend: 6000, revenue: 10800 },
    { date: "04/06", spend: 5500, revenue: 17600 },
    { date: "05/06", spend: 7000, revenue: 31500 },
    { date: "06/06", spend: 6500, revenue: 24700 },
    { date: "07/06", spend: 6000, revenue: 25200 },
];

export function ROASTrendChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={roasData}>
                <defs>
                    <linearGradient id="colorRoas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={algeriaColors.status.new} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={algeriaColors.status.new} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                    dataKey="date"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}x`}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                />
                <Area
                    type="monotone"
                    dataKey="roas"
                    stroke={algeriaColors.status.new}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRoas)"
                />
                <Area
                    type="monotone"
                    dataKey="breakEven"
                    stroke={algeriaColors.status.shipped}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="none"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export function SpendVsRevenueChart() {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                    dataKey="date"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                    cursor={{ fill: 'var(--muted)' }}
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                />
                <Legend />
                <Bar dataKey="spend" name="Ad Spend" fill={algeriaColors.status.cancelled} radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" name="Revenue" fill={algeriaColors.status.confirmed} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
