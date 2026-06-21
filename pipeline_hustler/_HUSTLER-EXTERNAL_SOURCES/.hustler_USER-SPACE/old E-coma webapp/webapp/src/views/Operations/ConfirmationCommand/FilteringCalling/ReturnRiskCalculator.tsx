"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Badge } from "@/components/core/ui/badge";
import { AlertTriangle, CheckCircle2, XCircle, MapPin, Clock, User, MessageSquare, DollarSign } from "lucide-react";

interface RiskFactor {
    name: string;
    score: number;
    maxScore: number;
    status: "good" | "warning" | "danger";
    icon: React.ReactNode;
    description: string;
}

interface ReturnRiskCalculatorProps {
    orderId?: string;
    className?: string;
}

export default function ReturnRiskCalculator({ orderId, className }: ReturnRiskCalculatorProps) {
    // Mock risk factors - in production, these would come from API
    const riskFactors: RiskFactor[] = [
        {
            name: "Client History",
            score: 85,
            maxScore: 100,
            status: "good",
            icon: <User className="h-4 w-4" />,
            description: "3 previous orders, 0 returns"
        },
        {
            name: "Address Validation",
            score: 60,
            maxScore: 100,
            status: "warning",
            icon: <MapPin className="h-4 w-4" />,
            description: "Incomplete address - missing building number"
        },
        {
            name: "Order Amount",
            score: 45,
            maxScore: 100,
            status: "warning",
            icon: <DollarSign className="h-4 w-4" />,
            description: "High value order (15,000 DA) - medium risk"
        },
        {
            name: "Time Since Order",
            score: 90,
            maxScore: 100,
            status: "good",
            icon: <Clock className="h-4 w-4" />,
            description: "Ordered 2 hours ago - fresh order"
        },
        {
            name: "Chat Sentiment",
            score: 75,
            maxScore: 100,
            status: "good",
            icon: <MessageSquare className="h-4 w-4" />,
            description: "Positive buying intent detected"
        }
    ];

    const overallScore = Math.round(
        riskFactors.reduce((sum, f) => sum + f.score, 0) / riskFactors.length
    );

    const getRiskLevel = (score: number) => {
        if (score >= 75) return { label: "Low Risk", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
        if (score >= 50) return { label: "Medium Risk", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
        return { label: "High Risk", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
    };

    const riskLevel = getRiskLevel(overallScore);

    const getStatusIcon = (status: RiskFactor["status"]) => {
        switch (status) {
            case "good": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case "danger": return <XCircle className="h-4 w-4 text-red-500" />;
        }
    };

    const getProgressColor = (status: RiskFactor["status"]) => {
        switch (status) {
            case "good": return "bg-green-500";
            case "warning": return "bg-yellow-500";
            case "danger": return "bg-red-500";
        }
    };

    return (
        <Card className={`bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-900/10 dark:to-amber-900/10 border-orange-200/60 dark:border-orange-800/30 ${className}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-500">
                            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            Return Risk Calculator
                        </CardTitle>
                        <CardDescription>AI-powered return probability analysis</CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{overallScore}</div>
                        <Badge className={riskLevel.color}>{riskLevel.label}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {riskFactors.map((factor, index) => (
                        <div key={index} className="p-3 rounded-lg bg-white/60 dark:bg-white/5 border border-orange-100/50 dark:border-orange-800/30">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-orange-600 dark:text-orange-400">{factor.icon}</span>
                                    <span className="text-sm font-medium">{factor.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(factor.status)}
                                    <span className="text-sm font-bold">{factor.score}</span>
                                </div>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${getProgressColor(factor.status)} transition-all`}
                                    style={{ width: `${factor.score}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{factor.description}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
