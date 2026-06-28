"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Input } from "@/components/core/ui/input";
import { Textarea } from "@/components/core/ui/textarea";
import {
    Layers, Upload, FileSpreadsheet, CheckCircle,
    AlertCircle, Loader2, X, Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";

export default function BulkCreation() {
    const [step, setStep] = useState(1);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewAds, setPreviewAds] = useState<{ name: string; headline: string; status: string }[]>([]);

    const handleFileUpload = () => {
        // Simulate file upload
        setUploadedFile("products_bulk_ads.csv");
        toast.success("File uploaded successfully!");

        // Simulate parsing
        setTimeout(() => {
            setPreviewAds([
                { name: "Écouteurs Bluetooth Pro", headline: "🎧 Qualité Premium -30%", status: "ready" },
                { name: "Montre Connectée Sport", headline: "⌚ Nouveau Design 2024", status: "ready" },
                { name: "Chargeur Sans Fil", headline: "⚡ Charge Rapide 15W", status: "warning" },
                { name: "Coque iPhone Premium", headline: "📱 Protection Maximale", status: "ready" },
                { name: "Lampe LED Bureau", headline: "💡 Éclairage Intelligent", status: "ready" },
            ]);
            setStep(2);
        }, 1500);
    };

    const handleCreateAds = () => {
        setIsProcessing(true);

        setTimeout(() => {
            setIsProcessing(false);
            setStep(3);
            toast.success("5 ads created successfully!");
        }, 2000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-orange-500" />
                    Bulk Ad Creation
                </CardTitle>
                <CardDescription>
                    Create multiple ads at once from a spreadsheet or template
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Progress Steps */}
                <div className="flex items-center gap-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                }`}>
                                {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                            </div>
                            <span className={`text-sm ${step >= s ? "font-medium" : "text-muted-foreground"}`}>
                                {s === 1 ? "Upload" : s === 2 ? "Preview" : "Confirm"}
                            </span>
                            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Upload */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div
                            className="border-2 border-dashed rounded-xl p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={handleFileUpload}
                        >
                            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="font-medium mb-2">Upload CSV or Excel File</p>
                            <p className="text-sm text-muted-foreground mb-4">
                                Drag and drop or click to browse
                            </p>
                            <Button variant="outline" className="gap-2">
                                <FileSpreadsheet className="h-4 w-4" /> Select File
                            </Button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">Or use a template:</p>
                            <div className="flex gap-2 justify-center">
                                <Button variant="outline" size="sm">Product Carousel</Button>
                                <Button variant="outline" size="sm">Collection Ads</Button>
                                <Button variant="outline" size="sm">Dynamic Retargeting</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Preview */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-green-500" />
                                <span className="font-medium">{uploadedFile}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => { setStep(1); setUploadedFile(null); }}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left p-3 text-xs font-medium">Product</th>
                                        <th className="text-left p-3 text-xs font-medium">Headline</th>
                                        <th className="text-center p-3 text-xs font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewAds.map((ad, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <span className="font-medium text-sm">{ad.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-sm">{ad.headline}</td>
                                            <td className="p-3 text-center">
                                                {ad.status === "ready" ? (
                                                    <Badge className="bg-green-100 text-green-700">Ready</Badge>
                                                ) : (
                                                    <Badge className="bg-yellow-100 text-yellow-700">
                                                        <AlertCircle className="h-3 w-3 mr-1" /> Review
                                                    </Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                            <Button onClick={handleCreateAds} disabled={isProcessing} className="gap-2">
                                {isProcessing ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                                ) : (
                                    <>Create {previewAds.length} Ads</>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Ads Created Successfully!</h3>
                        <p className="text-muted-foreground mb-6">
                            {previewAds.length} ads have been created and are pending review.
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button variant="outline" onClick={() => { setStep(1); setPreviewAds([]); setUploadedFile(null); }}>
                                Create More
                            </Button>
                            <Button>View in Ads Manager</Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
