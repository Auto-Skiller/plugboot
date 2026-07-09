"use client";

import { useState } from "react";
import { Button } from "@/components/core/ui/button";
import { Checkbox } from "@/components/core/ui/checkbox";
import { Label } from "@/components/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import { Input } from "@/components/core/ui/input";
import { Calendar } from "@/components/core/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/core/ui/popover";
import { CalendarIcon, Download, Mail, Clock, FileBarChart } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReportBuilderProps {
    category: string;
}

const REPORT_METRICS = {
    lifecycle: [
        { id: "cac", label: "Customer Acquisition Cost (CAC)" },
        { id: "cltv", label: "Customer Lifetime Value (CLTV)" },
        { id: "retention", label: "Retention Rate" },
        { id: "churn", label: "Churn Rate" },
    ],
    sales: [
        { id: "revenue", label: "Total Revenue" },
        { id: "net_profit", label: "Net Profit" },
        { id: "aov", label: "Average Order Value" },
        { id: "refunds", label: "Refund Rate" },
    ],
    inventory: [
        { id: "turnover", label: "Inventory Turnover" },
        { id: "sell_through", label: "Sell-through Rate" },
        { id: "stockouts", label: "Stockout Incidents" },
        { id: "dead_stock", label: "Dead Stock Value" },
    ]
};

export function ReportBuilder({ category }: ReportBuilderProps) {
    const [date, setDate] = useState<Date>();
    const [frequency, setFrequency] = useState("one-time");
    const [email, setEmail] = useState("");
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Get metrics for current category or default to sales
    const currentMetrics = REPORT_METRICS[category as keyof typeof REPORT_METRICS] || REPORT_METRICS.sales;

    const toggleMetric = (id: string) => {
        setSelectedMetrics(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleGenerate = () => {
        if (selectedMetrics.length === 0) {
            toast.error("Please select at least one metric");
            return;
        }

        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            toast.success("Report generated successfully!");
        }, 2000);
    };

    const handleSchedule = () => {
        if (selectedMetrics.length === 0) {
            toast.error("Please select at least one metric");
            return;
        }
        if (!email && frequency !== "one-time") {
            toast.error("Email is required for scheduled reports");
            return;
        }

        toast.success(`Report scheduled: ${frequency} sent to ${email || "admin"}`);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <FileBarChart className="h-5 w-5 text-purple-500" />
                        Configure {category.charAt(0).toUpperCase() + category.slice(1)} Report
                    </h3>
                    <p className="text-sm text-muted-foreground">Select metrics and schedule delivery</p>
                </div>
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date range</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Metrics Selection */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold mb-2">1. Select Metrics</h4>
                    <div className="grid grid-cols-1 gap-3">
                        {currentMetrics.map((metric) => (
                            <div key={metric.id} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 transition-colors">
                                <Checkbox
                                    id={metric.id}
                                    checked={selectedMetrics.includes(metric.id)}
                                    onCheckedChange={() => toggleMetric(metric.id)}
                                />
                                <Label htmlFor={metric.id} className="cursor-pointer flex-1 font-normal">
                                    {metric.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                    <div className="pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground h-auto p-0"
                            onClick={() => setSelectedMetrics(currentMetrics.map(m => m.id))}
                        >
                            Select All
                        </Button>
                    </div>
                </div>

                {/* Scheduling Options */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-semibold mb-3">2. Delivery Settings</h4>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Frequency</Label>
                                <Select value={frequency} onValueChange={setFrequency}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="one-time">One-time Export</SelectItem>
                                        <SelectItem value="daily">Daily at 9:00 AM</SelectItem>
                                        <SelectItem value="weekly">Weekly (Mondays)</SelectItem>
                                        <SelectItem value="monthly">Monthly (1st day)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {frequency !== "one-time" && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label>Recipients</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="admin@example.com"
                                            className="pl-10"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Separate multiple emails with commas</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <Button className="w-full gap-2 box-glow" onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? (
                                <>Generarting...</>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    Generate & Download PDF
                                </>
                            )}
                        </Button>
                        <Button variant="secondary" className="w-full gap-2" onClick={handleSchedule}>
                            <Clock className="h-4 w-4" />
                            {frequency === "one-time" ? "Schedule for Later" : "Save Schedule"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
