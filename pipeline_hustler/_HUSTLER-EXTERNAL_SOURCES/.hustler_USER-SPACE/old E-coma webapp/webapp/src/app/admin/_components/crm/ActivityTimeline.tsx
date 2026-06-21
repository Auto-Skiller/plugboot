"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { ShoppingCart, MessageSquare, Phone, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Activity {
    id: string;
    type: 'order' | 'message' | 'call' | 'note';
    title: string;
    description: string;
    createdAt: string;
}

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'à l\'instant';
        if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)} h`;
        return `il y a ${Math.floor(diffInSeconds / 86400)} j`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Historique d&apos;Activité</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity, i) => (
                        <div key={activity.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center",
                                    activity.type === 'order' && "bg-green-100 text-green-600",
                                    activity.type === 'message' && "bg-blue-100 text-blue-600",
                                    activity.type === 'call' && "bg-purple-100 text-purple-600",
                                    activity.type === 'note' && "bg-yellow-100 text-yellow-600"
                                )}>
                                    {activity.type === 'order' && <ShoppingCart className="h-4 w-4" />}
                                    {activity.type === 'message' && <MessageSquare className="h-4 w-4" />}
                                    {activity.type === 'call' && <Phone className="h-4 w-4" />}
                                    {activity.type === 'note' && <FileText className="h-4 w-4" />}
                                </div>
                                {i < activities.length - 1 && (
                                    <div className="w-px h-full bg-border flex-1 mt-2" />
                                )}
                            </div>
                            <div className="flex-1 pb-4">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">{activity.title}</p>
                                    <span className="text-xs text-muted-foreground">
                                        {formatTimeAgo(activity.createdAt)}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{activity.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
