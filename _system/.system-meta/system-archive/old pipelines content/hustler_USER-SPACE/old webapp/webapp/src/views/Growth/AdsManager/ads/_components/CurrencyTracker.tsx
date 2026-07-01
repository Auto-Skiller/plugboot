import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/core/ui/table";
import { DollarSign, RefreshCw, Calculator, ArrowRight } from "lucide-react";

const CurrencyTracker = () => {
    // State for calculations
    const [dzdAmount, setDzdAmount] = useState<string>('');
    const [foreignAmount, setForeignAmount] = useState<string>('');
    const [rate, setRate] = useState<number | null>(null);

    // Mock history data
    const history = [
        { id: 1, date: '2023-11-20', dzd: 450000, type: 'EUR', amount: 2000, rate: 225, campaign: 'Summer Promo' },
        { id: 2, date: '2023-11-15', dzd: 220000, type: 'USD', amount: 1000, rate: 220, campaign: 'General' },
    ];

    const calculateRate = () => {
        if (dzdAmount && foreignAmount) {
            const calculated = parseFloat(dzdAmount) / parseFloat(foreignAmount);
            setRate(parseFloat(calculated.toFixed(2)));
        }
    };

    const currentMonthSpend = history.reduce((acc, item) => acc + item.dzd, 0);

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <div>
                            <CardTitle>Currency Expense Tracker</CardTitle>
                            <CardDescription>Track real ad costs (Black Market Rates)</CardDescription>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">This Month</p>
                        <p className="text-lg font-bold text-foreground">{currentMonthSpend.toLocaleString()} DZD</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Calculator Section */}
                <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                    <div className="flex items-center gap-2 font-medium text-sm">
                        <Calculator className="h-4 w-4" /> Exchange Calculator
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end">
                        <div className="md:col-span-2 space-y-1.5">
                            <Label>I Paid (DZD)</Label>
                            <Input
                                placeholder="e.g. 45000"
                                value={dzdAmount}
                                onChange={(e) => setDzdAmount(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-1 flex justify-center pb-2">
                            <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0 text-muted-foreground" />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <Label>I got (EUR/USD)</Label>
                            <Input
                                placeholder="e.g. 200"
                                value={foreignAmount}
                                onChange={(e) => setForeignAmount(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <Label>Campaign (Optional)</Label>
                            <Input placeholder="Link to campaign..." className="text-xs" />
                        </div>
                        <div className="md:col-span-7 mt-2">
                            <Button className="w-full" onClick={calculateRate}>Calculate Rate & Save</Button>
                        </div>
                    </div>

                    {rate && (
                        <div className="flex flex-col gap-1 p-3 bg-primary/5 rounded border border-primary/20">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Effective Rate:</span>
                                <span className="text-lg font-bold text-primary">1 EUR = {rate} DZD</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-primary/10 pt-1 mt-1">
                                <span>Bank Rate (~134 DA)</span>
                                <span className="text-amber-600 font-medium">Premium: +{Math.round(((rate - 134) / 134) * 100)}%</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* History Table */}
                <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <RefreshCw className="h-3.5 w-3.5" /> Recent Transactions
                    </h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Paid (DZD)</TableHead>
                                <TableHead>Received</TableHead>
                                <TableHead>Campaign</TableHead>
                                <TableHead className="text-right">Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="text-muted-foreground text-xs">{item.date}</TableCell>
                                    <TableCell className="font-medium">{item.dzd.toLocaleString()} DA</TableCell>
                                    <TableCell>{item.amount} {item.type}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{item.campaign}</TableCell>
                                    <TableCell className="text-right font-mono text-xs bg-muted/50 rounded">{item.rate}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

            </CardContent>
        </Card>
    );
};

export default CurrencyTracker;
