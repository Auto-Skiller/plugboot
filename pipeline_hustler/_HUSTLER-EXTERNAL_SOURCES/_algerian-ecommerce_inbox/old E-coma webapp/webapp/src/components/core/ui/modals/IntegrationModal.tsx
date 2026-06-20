import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/core/ui/dialog";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Switch } from "@/components/core/ui/switch";
import { Badge } from "@/components/core/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/core/ui/alert";
import { CheckCircle2, AlertCircle, Link, RefreshCw, X, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IntegrationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    serviceName?: string;
    logo?: React.ReactNode;
    status?: "connected" | "disconnected" | "error";
}

export function IntegrationModal({
    open,
    onOpenChange,
    serviceName = "Google Analytics",
    logo,
    status = "disconnected"
}: IntegrationModalProps) {
    const [apiKey, setApiKey] = useState("");
    const [isConnecting, setIsConnecting] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(status);

    const handleConnect = async () => {
        setIsConnecting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setCurrentStatus("connected");
        setIsConnecting(false);
    };

    const handleDisconnect = () => {
        setCurrentStatus("disconnected");
        setApiKey("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 gap-0">
                {/* Header Brand Area */}
                <div className="bg-muted/30 p-8 flex flex-col items-center justify-center border-b">
                    <div className="w-16 h-16 bg-white rounded-xl shadow-sm border flex items-center justify-center mb-4 text-3xl">
                        {logo || serviceName.charAt(0)}
                    </div>
                    <DialogTitle className="text-xl mb-1">{serviceName}</DialogTitle>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={currentStatus === "connected" ? "default" : "secondary"}
                            className={cn(
                                "capitalize",
                                currentStatus === "connected" ? "bg-green-100 text-green-700 hover:bg-green-200" : ""
                            )}
                        >
                            {currentStatus === "connected" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                            {currentStatus}
                        </Badge>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {currentStatus === "connected" ? (
                        <div className="space-y-6">
                            <Alert className="bg-green-50 border-green-200">
                                <ShieldCheck className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-800">Connection Active</AlertTitle>
                                <AlertDescription className="text-green-700 text-xs">
                                    Last synced: Just now. Your data is flowing correctly.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Auto-Sync</Label>
                                        <p className="text-xs text-muted-foreground">Sync data every 15 minutes</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Read-Only Access</Label>
                                        <p className="text-xs text-muted-foreground">Prevent write changes</p>
                                    </div>
                                    <Switch />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Connect your {serviceName} account to unlock advanced analytics and automated reporting.
                            </p>
                            <div className="space-y-2">
                                <Label>API Key</Label>
                                <Input
                                    type="password"
                                    placeholder="Enter your API key"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    You can find this in your {serviceName} developer settings.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-muted/10 border-t flex items-center justify-between">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>

                    {currentStatus === "connected" ? (
                        <Button variant="destructive" onClick={handleDisconnect}>Disconnect</Button>
                    ) : (
                        <Button onClick={handleConnect} disabled={!apiKey || isConnecting}>
                            {isConnecting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                            Connect Account
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
