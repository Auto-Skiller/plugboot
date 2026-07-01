"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Badge } from "@/components/core/ui/badge";
import { Sparkles, User, ShoppingBag, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function OrdersAiScores() {
    return (
        <Card className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/10 dark:to-indigo-900/10 border-purple-200/60 dark:border-purple-800/30">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-500">
                            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            AI Reliability Scores
                        </CardTitle>
                        <CardDescription>Real-time AI analysis of clients, orders & conversations</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Client Score */}
                    <div className="p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-purple-100/50 dark:border-purple-800/30 hover:border-purple-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <User className="h-4 w-4 text-purple-500" /> Client
                            </div>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                                Excellent
                            </Badge>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl font-bold text-foreground">94</span>
                            <span className="text-xs text-muted-foreground mb-1">/100</span>
                        </div>
                        <p className="text-xs text-muted-foreground">High delivery success rate & minimal returns history.</p>
                    </div>

                    {/* Order Score */}
                    <div className="p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-purple-100/50 dark:border-purple-800/30 hover:border-purple-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <ShoppingBag className="h-4 w-4 text-blue-500" /> Order
                            </div>
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                                Warning
                            </Badge>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl font-bold text-foreground">65</span>
                            <span className="text-xs text-muted-foreground mb-1">/100</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Address seems incomplete. Verification recommended.</p>
                    </div>

                    {/* Sales Chat Score */}
                    <div className="p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-purple-100/50 dark:border-purple-800/30 hover:border-purple-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <MessageSquare className="h-4 w-4 text-pink-500" /> Sales Chat
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                                Validated
                            </Badge>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl font-bold text-foreground">88</span>
                            <span className="text-xs text-muted-foreground mb-1">/100</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Strong buying intent detected in recent conversation.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
