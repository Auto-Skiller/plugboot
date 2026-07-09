import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/core/ui/table";
import { Users, Plus, DollarSign, TrendingUp, AlertCircle, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/core/ui/dialog";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";

const AgencyAccountManager = () => {
    // Mock Data
    const [accounts, setAccounts] = useState([
        { id: 1, name: 'Client A - Fashion', platform: 'Facebook', status: 'active', spend: 124500, roas: 3.2, budget: 150000 },
        { id: 2, name: 'Client B - Electronics', platform: 'TikTok', status: 'warning', spend: 45000, roas: 1.8, budget: 50000 },
        { id: 3, name: 'Client C - Home', platform: 'Google', status: 'active', spend: 89000, roas: 4.5, budget: 100000 },
    ]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25">Active</Badge>;
            case 'warning': return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25">Review</Badge>;
            default: return <Badge variant="outline">Inactive</Badge>;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500" />
                        Agency Account Manager
                    </CardTitle>
                    <CardDescription>Manage multiple client ad accounts safely</CardDescription>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Connect Account</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Connect New Ad Account</DialogTitle>
                            <DialogDescription>
                                Add a client account to your agency dashboard.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" placeholder="Client Name" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="id" className="text-right">Ad Acc ID</Label>
                                <Input id="id" placeholder="1234-5678-9101" className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Connect</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Account Name</TableHead>
                            <TableHead>Platform</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Spend (DZD)</TableHead>
                            <TableHead>ROAS</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accounts.map((account) => (
                            <TableRow key={account.id}>
                                <TableCell className="font-medium">{account.name}</TableCell>
                                <TableCell>{account.platform}</TableCell>
                                <TableCell>{getStatusBadge(account.status)}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold">{account.spend.toLocaleString()}</span>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground group cursor-pointer">
                                            Limit: {account.budget.toLocaleString()}
                                            <Button variant="ghost" size="icon" className="h-4 w-4 opacity-0 group-hover:opacity-100"><DollarSign className="h-3 w-3" /></Button>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1 font-semibold text-sm">
                                        {account.roas}x
                                        {account.roas > 2 ? <TrendingUp className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-amber-500" />}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm">Edit Budget</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Update Budget Allocation</DialogTitle>
                                                <DialogDescription>Set new spending limit for {account.name}</DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <Label>New Budget Limit (DZD)</Label>
                                                <Input type="number" defaultValue={account.budget} />
                                            </div>
                                            <DialogFooter>
                                                <Button>Save Changes</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default AgencyAccountManager;
