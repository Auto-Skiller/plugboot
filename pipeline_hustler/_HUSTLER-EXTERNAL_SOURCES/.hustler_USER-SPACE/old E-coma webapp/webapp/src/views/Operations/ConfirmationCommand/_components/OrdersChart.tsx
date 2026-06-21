"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const data = [
    { name: 'Lun', primary: 15, confirmed: 12, delivered: 10, returns: 2 },
    { name: 'Mar', primary: 25, confirmed: 19, delivered: 18, returns: 3 },
    { name: 'Mer', primary: 20, confirmed: 15, delivered: 14, returns: 1 },
    { name: 'Jeu', primary: 35, confirmed: 25, delivered: 22, returns: 5 },
    { name: 'Ven', primary: 40, confirmed: 32, delivered: 28, returns: 4 },
    { name: 'Sam', primary: 55, confirmed: 45, delivered: 42, returns: 8 },
    { name: 'Dim', primary: 45, confirmed: 38, delivered: 35, returns: 6 },
];

export function OrdersChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Détails des Commandes (7 derniers jours)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="confirmedGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="deliveredGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id="returnsGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="primary"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#primaryGradient)"
                                name="Initiales"
                            />
                            <Area
                                type="monotone"
                                dataKey="confirmed"
                                stroke="#f59e0b"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#confirmedGradient)"
                                name="Confirmées"
                            />
                            <Area
                                type="monotone"
                                dataKey="delivered"
                                stroke="#22c55e"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#deliveredGradient)"
                                name="Livrées"
                            />
                            <Area
                                type="monotone"
                                dataKey="returns"
                                stroke="#ef4444"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#returnsGradient)"
                                name="Retournées"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
