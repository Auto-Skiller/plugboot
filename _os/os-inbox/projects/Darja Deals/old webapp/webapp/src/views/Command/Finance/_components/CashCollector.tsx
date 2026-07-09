"use client";

import { Badge } from "@/components/core/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/core/ui/table";
import { AlertTriangle, CheckCircle2, Clock, Truck } from "lucide-react";

// Mock Data for Carrier Remittance
const CARRIER_REMITTANCE_DATA = [
    {
        id: "yalidine",
        name: "Yalidine Express",
        collectedAmount: 450000,
        pendingAmount: 320000,
        lastDepositDate: "2024-03-20",
        expectedDepositDate: "2024-03-27",
        actualDepositDate: "2024-03-28", // Actual deposit date
        avgDelay: 2, // days
        status: "normal", // normal, warning, critical
    },
    {
        id: "zr_express",
        name: "ZR Express",
        collectedAmount: 280000,
        pendingAmount: 280000,
        lastDepositDate: "2024-03-15",
        expectedDepositDate: "2024-03-22",
        actualDepositDate: null, // Still pending
        avgDelay: 5,
        status: "warning",
    },
    {
        id: "nord_ouest",
        name: "Nord & Ouest",
        collectedAmount: 120000,
        pendingAmount: 120000,
        lastDepositDate: "2024-03-10",
        expectedDepositDate: "2024-03-17",
        actualDepositDate: null, // Still pending
        avgDelay: 12,
        status: "critical",
    },
];


export function CashCollector() {
    const totalPending = CARRIER_REMITTANCE_DATA.reduce((acc, curr) => acc + curr.pendingAmount, 0);
    const totalOverdue = CARRIER_REMITTANCE_DATA
        .filter(c => c.status === "critical" || c.status === "warning")
        .reduce((acc, curr) => acc + curr.pendingAmount, 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        Cash Collector
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Track COD remittances and carrier performance
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Pending Remittance</p>
                    <p className="text-2xl font-bold text-primary">{totalPending.toLocaleString()} DZD</p>
                    {totalOverdue > 0 && (
                        <p className="text-xs text-red-500 font-medium mt-1">
                            {totalOverdue.toLocaleString()} DZD Overdue/Delayed
                        </p>
                    )}
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Carrier</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Pending Amount</TableHead>
                            <TableHead className="text-center">Avg. Delay</TableHead>
                            <TableHead className="text-center">Expected</TableHead>
                            <TableHead className="text-center">Actual Deposit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {CARRIER_REMITTANCE_DATA.map((carrier) => (
                            <TableRow key={carrier.id}>
                                <TableCell className="font-medium">
                                    {carrier.name}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            carrier.status === "critical"
                                                ? "destructive"
                                                : carrier.status === "warning"
                                                    ? "secondary" // using secondary for warning-like visual if outline/warning variant not available
                                                    : "outline"
                                        }
                                        className={
                                            carrier.status === "warning"
                                                ? "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"
                                                : ""
                                        }
                                    >
                                        {carrier.status === "critical" && (
                                            <AlertTriangle className="mr-1 h-3 w-3" />
                                        )}
                                        {carrier.status === "warning" && (
                                            <Clock className="mr-1 h-3 w-3" />
                                        )}
                                        {carrier.status === "normal" && (
                                            <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                                        )}
                                        {carrier.status === "critical"
                                            ? "Delayed"
                                            : carrier.status === "warning"
                                                ? "Slow"
                                                : "On Time"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                    {carrier.pendingAmount.toLocaleString()} DZD
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className={carrier.avgDelay > 7 ? "text-red-500 font-medium" : ""}>
                                        {carrier.avgDelay} days
                                    </span>
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground text-sm">
                                    {carrier.expectedDepositDate}
                                </TableCell>
                                <TableCell className="text-center text-sm">
                                    {carrier.actualDepositDate ? (
                                        <span className="text-green-600 font-medium">{carrier.actualDepositDate}</span>
                                    ) : (
                                        <span className="text-amber-600">Pending</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
