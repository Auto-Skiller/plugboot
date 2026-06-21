import React from 'react';
import { Card, CardContent } from "@/components/core/ui/card";
import { Truck, CheckCircle2, TrendingDown, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/core/ui/tooltip";

interface DeliveryRateKPIProps {
    delivered: number;
    totalOrders: number;
    trend?: number;
}

const DeliveryRateKPI = ({ delivered = 85, totalOrders = 120, trend = 4.5 }: DeliveryRateKPIProps) => {
    const rate = totalOrders > 0 ? ((delivered / totalOrders) * 100).toFixed(1) : "0.0";
    const numRate = parseFloat(rate as string);

    // Color logic for Algeria COD context
    // >80% is great, 60-80% is average, <60% is bad
    const getRateColor = () => {
        if (numRate >= 80) return "text-emerald-500";
        if (numRate >= 60) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-muted-foreground">Delivery Rate</p>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Percentage of orders successfully delivered & paid.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Truck className={`h-4 w-4 ${getRateColor()}`} />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                    <h3 className="text-2xl font-bold">{rate}%</h3>
                    {trend && (
                        <span className={`text-xs font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{delivered} / {totalOrders} Orders</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default DeliveryRateKPI;
