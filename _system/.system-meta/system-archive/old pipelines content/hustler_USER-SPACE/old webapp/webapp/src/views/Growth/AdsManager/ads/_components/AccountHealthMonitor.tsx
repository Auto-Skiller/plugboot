import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Progress } from "@/components/core/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/core/ui/alert";
import { Badge } from "@/components/core/ui/badge";
import { ShieldAlert, ShieldCheck, Shield, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface HealthIndicator {
    name: string;
    status: 'safe' | 'warning' | 'danger';
    details: string;
}

const AccountHealthMonitor = () => {
    // Mock data - replace with real logic/data later
    const healthScore = 78;
    const healthStatus = healthScore > 80 ? 'safe' : healthScore > 50 ? 'warning' : 'danger';

    const indicators: HealthIndicator[] = [
        { name: "Payment Methods", status: "safe", details: "All cards match ad account region" },
        { name: "IP Consistency", status: "warning", details: "Login detected from new location (Oran)" },
        { name: "Policy Violations", status: "safe", details: "0 rejections in last 30 days" },
        { name: "Spending Velocity", status: "safe", details: "Consistent daily spend increase (+5%)" },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'safe': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'warning': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'danger': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-slate-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'safe': return <CheckCircle className="h-4 w-4" />;
            case 'warning': return <AlertTriangle className="h-4 w-4" />;
            case 'danger': return <ShieldAlert className="h-4 w-4" />;
            default: return <Info className="h-4 w-4" />;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className={`h-5 w-5 ${healthScore > 80 ? 'text-emerald-500' : 'text-amber-500'}`} />
                        <CardTitle>Account Health Monitor</CardTitle>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" title="Download Backup">
                            <DownloadIcon className="h-3.5 w-3.5" /> Backup
                        </Button>
                        <Badge variant={healthStatus === 'safe' ? 'default' : healthStatus === 'warning' ? 'secondary' : 'destructive'}>
                            {healthStatus === 'safe' ? 'Secure' : 'At Risk'}
                        </Badge>
                    </div>
                </div>
                <CardDescription>Real-time ban risk assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Score Section */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Health Score</span>
                        <span className="font-bold">{healthScore}/100</span>
                    </div>
                    <Progress value={healthScore} className={`h-2 ${healthScore > 80 ? "bg-emerald-100 dark:bg-emerald-950" : "bg-amber-100 dark:bg-amber-950"}`} />
                    <p className="text-xs text-muted-foreground pt-1">
                        {healthScore > 80
                            ? "Your account is in good standing. Keep up the consistent activity."
                            : "Action required: review warning indicators to prevent restrictions."}
                    </p>
                </div>

                {/* Indicators List */}
                <div className="space-y-3">
                    {indicators.map((indicator, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border flex items-start gap-3 ${getStatusColor(indicator.status)} bg-opacity-5`}>
                            <div className={`mt-0.5 ${indicator.status === 'safe' ? 'text-emerald-600' :
                                indicator.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                                }`}>
                                {getStatusIcon(indicator.status)}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">{indicator.name}</p>
                                <p className="text-xs opacity-90 text-foreground/80">{indicator.details}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Warning Alert if needed */}
                {healthStatus !== 'safe' && (
                    <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Risk Detected</AlertTitle>
                        <AlertDescription>
                            Unusual login activity detected. Verify your session to avoid a temporary lock.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Recommendations Panel (NEW) */}
                <div className="bg-muted/30 p-4 rounded-lg border">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" /> Recommendations
                    </h4>
                    <ul className="space-y-2">
                        <li className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            <span>Use a dedicated browser profile for this ad account to maintain cookie consistency.</span>
                        </li>
                        <li className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            <span>Avoid logging in from different cities within 24 hours.</span>
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};

export default AccountHealthMonitor;

const DownloadIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
)
