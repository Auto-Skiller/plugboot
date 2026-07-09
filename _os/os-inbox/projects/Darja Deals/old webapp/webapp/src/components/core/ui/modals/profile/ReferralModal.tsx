"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/core/ui/dialog";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Copy, Gift, Twitter, Facebook, Linkedin } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner or use standard toast if available, will stick to copy logic for now.

interface ReferralModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    referralCode?: string;
}

export function ReferralModal({
    open,
    onOpenChange,
    referralCode = "RIGLIFY-2024-XJY"
}: ReferralModalProps) {

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`https://riglify.com/join?ref=${referralCode}`);
        // Simple alert or toast placeholder if toast not ready
        // alert("Copied to clipboard!"); 
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <div className="mx-auto bg-gradient-to-br from-[hsl(var(--accent-orange))] to-[hsl(var(--accent-blue))] w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <Gift className="text-white w-6 h-6" />
                    </div>
                    <DialogTitle className="text-center text-xl">Refer a friend, get $50</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        Share your referral link with friends. When they sign up and subscribe, you both get $50 in credits.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-6">
                    <div className="space-y-2">
                        <Label>Your Referral Link</Label>
                        <div className="flex gap-2">
                            <Input
                                readOnly
                                value={`https://riglify.com/join?ref=${referralCode}`}
                                className="bg-muted/50"
                            />
                            <Button variant="outline" size="icon" onClick={copyToClipboard}>
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button variant="outline" className="gap-2 w-full" onClick={() => window.open('https://twitter.com', '_blank')}>
                            <Twitter className="w-4 h-4 fill-current" />
                            Tweet
                        </Button>
                        <Button variant="outline" className="gap-2 w-full" onClick={() => window.open('https://facebook.com', '_blank')}>
                            <Facebook className="w-4 h-4 fill-current" />
                            Share
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
