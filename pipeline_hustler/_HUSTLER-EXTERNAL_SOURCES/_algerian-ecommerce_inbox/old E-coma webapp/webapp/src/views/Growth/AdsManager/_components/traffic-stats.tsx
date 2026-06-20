"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/core/ui/card';
import { Button } from '@/components/core/ui/button';
import { Badge } from '@/components/core/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/core/ui/tabs';
import { MousePointer2, GitMerge, Filter, Plus, Save } from 'lucide-react';

// --- Heatmap Visualizer ---

export function HeatmapVisualizer() {
    return (
        <Card className="h-[500px] overflow-hidden relative group">
            <CardHeader className="absolute top-0 left-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm w-full border-b">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium">Homepage Heatmap</CardTitle>
                    <div className="flex gap-2">
                        <Badge variant="secondary">Desktop</Badge>
                        <Badge variant="outline">Clicks</Badge>
                    </div>
                </div>
            </CardHeader>
            <div className="w-full h-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center relative">
                {/* Mock Website Content */}
                <div className="w-3/4 h-3/4 bg-white dark:bg-card shadow-2xl rounded-lg border p-4 opacity-50 blur-[1px] group-hover:blur-0 transition-all">
                    <div className="h-8 bg-gray-200 dark:bg-muted rounded mb-4 w-1/3"></div>
                    <div className="h-32 bg-gray-200 dark:bg-muted rounded mb-4"></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 bg-gray-200 dark:bg-muted rounded"></div>
                        <div className="h-24 bg-gray-200 dark:bg-muted rounded"></div>
                        <div className="h-24 bg-gray-200 dark:bg-muted rounded"></div>
                    </div>
                </div>

                {/* Heatmap Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-blue-500/20 pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>
                <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-red-500/40 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/3 w-32 h-32 bg-yellow-500/30 rounded-full blur-xl"></div>

                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs backdrop-blur-md">
                    <MousePointer2 className="w-3 h-3 inline mr-1" />
                    1,245 clicks recorded
                </div>
            </div>
        </Card>
    );
}

// --- User Flow Chart ---

export function UserFlowChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>User Flow Journey</CardTitle>
                <CardDescription>Visualize how users navigate through your store.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center min-w-[150px]">
                        <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800 w-full text-center font-bold">
                            Landing Page
                            <div className="text-xs font-normal mt-1">100% (5,000)</div>
                        </div>
                        <div className="h-8 w-0.5 bg-gray-300 dark:bg-gray-700 my-2"></div>
                        <div className="text-xs text-muted-foreground">Drop-off: 20%</div>
                    </div>

                    <GitMerge className="text-gray-300 rotate-90" />

                    {/* Step 2 */}
                    <div className="flex flex-col gap-4 min-w-[150px]">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 w-full text-center text-sm font-medium">
                            Product Page
                            <div className="text-xs font-normal mt-1">60% (3,000)</div>
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg border border-orange-200 dark:border-orange-800 w-full text-center text-sm font-medium">
                            Collection
                            <div className="text-xs font-normal mt-1">20% (1,000)</div>
                        </div>
                    </div>

                    <GitMerge className="text-gray-300 rotate-90" />

                    {/* Step 3 */}
                    <div className="flex flex-col items-center min-w-[150px]">
                        <div className="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-800 w-full text-center font-bold">
                            Add to Cart
                            <div className="text-xs font-normal mt-1">15% (750)</div>
                        </div>
                        <div className="h-8 w-0.5 bg-gray-300 dark:bg-gray-700 my-2"></div>
                        <div className="text-xs text-muted-foreground">Checkout: 8%</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// --- Segment Builder ---

export function SegmentBuilder() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Custom Segments
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-secondary/80">
                        High Value Users
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-muted">
                        Mobile Traffic
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 cursor-pointer hover:bg-muted">
                        Returning Visitors
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-6 rounded-full">
                        <Plus className="w-3 h-3 mr-1" /> New
                    </Button>
                </div>

                <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option>Total Spend</option>
                            <option>Visit Count</option>
                            <option>Last Seen</option>
                        </select>
                        <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <option>Greater than</option>
                            <option>Less than</option>
                            <option>Equals</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Value"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button size="sm" className="gap-2">
                            <Save className="w-4 h-4" />
                            Save Segment
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// --- Device Breakdown ---

export function DeviceBreakdown() {
    const devices = [
        { name: 'Desktop', percentage: 52, sessions: 12450, color: 'bg-blue-500' },
        { name: 'Mobile', percentage: 38, sessions: 9120, color: 'bg-green-500' },
        { name: 'Tablet', percentage: 10, sessions: 2430, color: 'bg-orange-500' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>Traffic distribution by device type.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {devices.map((device) => (
                    <div key={device.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">{device.name}</span>
                            <span className="text-muted-foreground">{device.sessions.toLocaleString()} sessions</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${device.color} transition-all`} 
                                style={{ width: `${device.percentage}%` }}
                            />
                        </div>
                        <div className="text-xs text-muted-foreground text-right">{device.percentage}%</div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

// --- Geo Distribution ---

export function GeoDistribution() {
    const countries = [
        { name: 'Algeria', code: 'DZ', visitors: 15234, percentage: 62 },
        { name: 'France', code: 'FR', visitors: 4521, percentage: 18 },
        { name: 'Morocco', code: 'MA', visitors: 2134, percentage: 9 },
        { name: 'Tunisia', code: 'TN', visitors: 1523, percentage: 6 },
        { name: 'Others', code: 'XX', visitors: 1245, percentage: 5 },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Visitor locations by country.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {countries.map((country, index) => (
                        <div key={country.code} className="flex items-center gap-3">
                            <div className="w-6 text-center text-sm font-medium text-muted-foreground">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span className="font-medium text-sm">{country.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {country.visitors.toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary transition-all" 
                                        style={{ width: `${country.percentage}%` }}
                                    />
                                </div>
                            </div>
                            <div className="w-10 text-right text-xs text-muted-foreground">
                                {country.percentage}%
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// --- Real Time Visitors ---

export function RealTimeVisitors() {
    return (
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="pt-6">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Live</span>
                    </div>
                    <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">47</div>
                    <div className="text-sm text-muted-foreground">Active Visitors</div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-background/50 rounded-lg">
                        <div className="font-semibold">12</div>
                        <div className="text-muted-foreground">On Homepage</div>
                    </div>
                    <div className="p-2 bg-background/50 rounded-lg">
                        <div className="font-semibold">8</div>
                        <div className="text-muted-foreground">Checkout</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
