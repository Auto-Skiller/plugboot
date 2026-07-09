"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Badge } from "@/components/core/ui/badge";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Textarea } from "@/components/core/ui/textarea";
import { FileText, Download, Plus, X, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export function ContractGenerator() {
    const [brandName, setBrandName] = useState("");
    const [influencerName, setInfluencerName] = useState("");
    const [deliverables, setDeliverables] = useState<string[]>([""]);
    const [timeline, setTimeline] = useState("");
    const [payment, setPayment] = useState("");
    const [additionalTerms, setAdditionalTerms] = useState("");
    const [contractStatus, setContractStatus] = useState<"Draft" | "Pending Approval" | "Approved">("Draft");

    const addDeliverable = () => {
        setDeliverables([...deliverables, ""]);
    };

    const removeDeliverable = (index: number) => {
        setDeliverables(deliverables.filter((_, i) => i !== index));
    };

    const updateDeliverable = (index: number, value: string) => {
        const updated = [...deliverables];
        updated[index] = value;
        setDeliverables(updated);
    };

    const generateContract = () => {
        if (!brandName || !influencerName || !payment || !timeline) {
            toast.error("Please fill in all required fields");
            return;
        }

        // Mock contract generation
        toast.success("Contract generated successfully! (Mock PDF)");

        // In a real implementation, this would generate a PDF
        console.log({
            brandName,
            influencerName,
            deliverables: deliverables.filter(d => d.trim()),
            timeline,
            payment,
            additionalTerms
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    Influencer Contract Generator
                </h2>
                <p className="text-sm text-muted-foreground">
                    Create legally-binding contracts for your influencer partnerships. Protect both parties with clear terms.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Contract Details</CardTitle>
                        <CardDescription>Fill in the agreement terms</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand Name *</Label>
                                <Input
                                    id="brand"
                                    placeholder="Your Store DZ"
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="influencer">Influencer Name *</Label>
                                <Input
                                    id="influencer"
                                    placeholder="@handle or Full Name"
                                    value={influencerName}
                                    onChange={(e) => setInfluencerName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Deliverables *</Label>
                            {deliverables.map((deliverable, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        placeholder="e.g., 1 Instagram Reel + 2 Stories"
                                        value={deliverable}
                                        onChange={(e) => updateDeliverable(index, e.target.value)}
                                    />
                                    {deliverables.length > 1 && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeDeliverable(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addDeliverable}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" /> Add Deliverable
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="timeline">Timeline / Deadline *</Label>
                                <Input
                                    id="timeline"
                                    type="date"
                                    value={timeline}
                                    onChange={(e) => setTimeline(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment">Payment Amount (DZD) *</Label>
                                <Input
                                    id="payment"
                                    type="text"
                                    placeholder="50,000"
                                    value={payment}
                                    onChange={(e) => setPayment(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="terms">Additional Terms</Label>
                            <Textarea
                                id="terms"
                                placeholder="Any special conditions, usage rights, exclusivity clauses, etc."
                                rows={4}
                                value={additionalTerms}
                                onChange={(e) => setAdditionalTerms(e.target.value)}
                            />
                        </div>

                        <Button onClick={generateContract} className="w-full gap-2">
                            <Download className="h-4 w-4" /> Generate & Download PDF
                        </Button>
                    </CardContent>
                </Card>

                {/* Preview */}
                <Card className="bg-muted/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="text-lg">Contract Preview</CardTitle>
                            <CardDescription>Summary of your agreement</CardDescription>
                        </div>
                        <Badge variant={
                            contractStatus === "Approved" ? "default" :
                                contractStatus === "Pending Approval" ? "secondary" : "outline"
                        } className="h-6">
                            {contractStatus}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-background p-4 rounded-lg border space-y-3 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Parties</p>
                                <p className="font-medium">
                                    {brandName || "[Brand Name]"} & {influencerName || "[Influencer Name]"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Deliverables</p>
                                <ul className="list-disc list-inside space-y-1">
                                    {deliverables.filter(d => d.trim()).length > 0 ? (
                                        deliverables.filter(d => d.trim()).map((d, i) => (
                                            <li key={i} className="font-medium">{d}</li>
                                        ))
                                    ) : (
                                        <li className="text-muted-foreground italic">[No deliverables specified]</li>
                                    )}
                                </ul>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Deadline</p>
                                    <p className="font-medium">{timeline || "[Not set]"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Payment</p>
                                    <p className="font-medium">{payment ? `${payment} DZD` : "[Not set]"}</p>
                                </div>
                            </div>

                            {additionalTerms && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Additional Terms</p>
                                    <p className="text-xs">{additionalTerms}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg text-xs space-y-1">
                            <p className="font-medium">Standard Clauses Included:</p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                                <li>Content approval process</li>
                                <li>IP rights & usage permissions</li>
                                <li>Payment terms (50% upfront, 50% on delivery)</li>
                                <li>Cancellation policy</li>
                                <li>Confidentiality agreement</li>
                            </ul>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 gap-2"
                                onClick={() => {
                                    setContractStatus("Pending Approval");
                                    toast.success("Contract sent to influencer for review!");
                                }}
                                disabled={contractStatus === "Approved"}
                            >
                                <Clock className="h-4 w-4" /> Send for Review
                            </Button>
                            <Button
                                className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                                onClick={() => {
                                    setContractStatus("Approved");
                                    toast.success("Contract officially approved!");
                                }}
                                disabled={contractStatus === "Approved"}
                            >
                                <CheckCircle className="h-4 w-4" /> Approve Contract
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
