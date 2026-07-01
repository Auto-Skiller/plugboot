import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Users, Eye, MousePointer, Clock, TrendingUp, TrendingDown } from "lucide-react";

interface KPIData {
    visitors: string;
    visitorsChange: number;
    pageviews: string;
    pageviewsChange: number;
    bounceRate: number;
    bounceChange: number;
    avgSession: string;
    sessionChange: number;
    conversionRate: number;
    conversionChange: number;
}

interface TrafficKPIDashboardProps {
    data: KPIData;
}

export function TrafficKPIDashboard({ data }: TrafficKPIDashboardProps) {
    const items = [
        {
            title: "Total Visitors",
            value: data.visitors,
            change: data.visitorsChange,
            icon: Users,
        },
        {
            title: "Page Views",
            value: data.pageviews,
            change: data.pageviewsChange,
            icon: Eye,
        },
        {
            title: "Bounce Rate",
            value: `${data.bounceRate}%`,
            change: data.bounceChange,
            icon: MousePointer,
            inverse: true,
        },
        {
            title: "Avg. Session",
            value: data.avgSession,
            change: data.sessionChange,
            icon: Clock,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <Card key={item.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {item.title}
                        </CardTitle>
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.value}</div>
                        <p className={`text-xs ${item.change > 0 ? "text-green-500" : "text-red-500"} flex items-center`}>
                            {item.change > 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                            {Math.abs(item.change)}% from last month
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
