"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/core/ui/card";
import { Badge } from "@/components/core/ui/badge";
import { Star, AlertTriangle, CheckCircle2, Clock, Truck } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/core/ui/table";

interface UnifiedCarrier {
    id: string;
    name: string;
    logo: string;
    recommendedFor?: string;
    // Carrier Info columns
    avgDeliveryDays?: string;
    feesAlgiers?: string;
    feesOran?: string;
    codFee?: string;
    codPercentage?: string;
    remittanceSpeed?: string;
    coverage?: string;
    rating?: number;
    // Cash Collector columns
    pendingAmount?: number;
    avgDelay?: number;
    expectedDepositDate?: string;
    actualDepositDate?: string | null;
    status?: "normal" | "warning" | "critical";
}

const UNIFIED_CARRIERS: UnifiedCarrier[] = [
    {
        id: "yalidine",
        name: "Yalidine",
        logo: "🟠",
        recommendedFor: "Local eCommerce",
        avgDeliveryDays: "1-2 Days",
        feesAlgiers: "400 DA",
        feesOran: "600 DA",
        codFee: "Free",
        codPercentage: "95%",
        remittanceSpeed: "Weekly (Tue)",
        coverage: "100% (58 Wilayas)",
        rating: 4.8,
        pendingAmount: 320000,
        avgDelay: 2,
        expectedDepositDate: "2024-03-27",
        actualDepositDate: "2024-03-28",
        status: "normal",
    },
    {
        id: "maystro",
        name: "Maystro",
        logo: "🟢",
        recommendedFor: "Algiers & Blida",
        avgDeliveryDays: "1-3 Days",
        feesAlgiers: "350 DA",
        feesOran: "550 DA",
        codFee: "Free",
        codPercentage: "92%",
        remittanceSpeed: "Bi-Weekly",
        coverage: "100% (58 Wilayas)",
        rating: 4.5,
        pendingAmount: 185000,
        avgDelay: 3,
        expectedDepositDate: "2024-03-29",
        actualDepositDate: null,
        status: "normal",
    },
    {
        id: "zr_express",
        name: "ZR Express",
        logo: "🔵",
        avgDeliveryDays: "2-4 Days",
        feesAlgiers: "450 DA",
        feesOran: "650 DA",
        codFee: "1%",
        codPercentage: "88%",
        remittanceSpeed: "On Demand",
        coverage: "82% (48 Wilayas)",
        rating: 4.0,
        pendingAmount: 280000,
        avgDelay: 5,
        expectedDepositDate: "2024-03-22",
        actualDepositDate: null,
        status: "warning",
    },
    {
        id: "ems",
        name: "EMS",
        logo: "📬",
        recommendedFor: "Remote Areas",
        avgDeliveryDays: "3-5 Days",
        feesAlgiers: "300 DA",
        feesOran: "500 DA",
        codFee: "2%",
        codPercentage: "85%",
        remittanceSpeed: "Monthly",
        coverage: "100% (58 Wilayas)",
        rating: 3.5,
        pendingAmount: 95000,
        avgDelay: 8,
        expectedDepositDate: "2024-04-01",
        actualDepositDate: null,
        status: "warning",
    },
    {
        id: "nord_ouest",
        name: "Nord & Ouest",
        logo: "🟤",
        avgDeliveryDays: "3-5 Days",
        feesAlgiers: "380 DA",
        feesOran: "580 DA",
        codFee: "1.5%",
        codPercentage: "82%",
        remittanceSpeed: "Bi-Weekly",
        coverage: "72% (42 Wilayas)",
        rating: 3.2,
        pendingAmount: 120000,
        avgDelay: 12,
        expectedDepositDate: "2024-03-17",
        actualDepositDate: null,
        status: "critical",
    },
];

export function CarrierComparison({ showFinancials = false }: { showFinancials?: boolean }) {
    const totalPending = UNIFIED_CARRIERS.reduce((acc, c) => acc + (c.pendingAmount || 0), 0);
    const totalOverdue = UNIFIED_CARRIERS
        .filter(c => c.status === "critical" || c.status === "warning")
        .reduce((acc, c) => acc + (c.pendingAmount || 0), 0);

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            Delivery Hub
                        </CardTitle>
                        <CardDescription>Compare rates, performance, and COD remittances</CardDescription>
                    </div>
                    {showFinancials && (
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total Pending</p>
                            <p className="text-xl font-bold text-primary">{totalPending.toLocaleString()} DZD</p>
                            {totalOverdue > 0 && (
                                <p className="text-xs text-red-500 font-medium">
                                    {totalOverdue.toLocaleString()} DZD Delayed
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[160px]">Carrier</TableHead>
                                <TableHead className="text-center">Delivery</TableHead>
                                <TableHead className="text-center">Fee (Algiers)</TableHead>
                                <TableHead className="text-center">COD %</TableHead>
                                <TableHead className="text-center">Rating</TableHead>
                                {showFinancials && (
                                    <>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Pending</TableHead>
                                        <TableHead className="text-center">Delay</TableHead>
                                    </>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {UNIFIED_CARRIERS.map(c => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{c.logo}</span>
                                            <div className="flex flex-col">
                                                <span className="font-bold">{c.name}</span>
                                                {c.recommendedFor && (
                                                    <Badge variant="secondary" className="text-[9px] h-4 px-1 w-fit mt-0.5">
                                                        {c.recommendedFor}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{c.avgDeliveryDays || "—"}</TableCell>
                                    <TableCell className="text-center">{c.feesAlgiers || "—"}</TableCell>
                                    <TableCell className="text-center">
                                        {c.codPercentage ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700">{c.codPercentage}</Badge>
                                        ) : "—"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {c.rating ? (
                                            <div className="flex items-center justify-center gap-1">
                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                {c.rating}
                                            </div>
                                        ) : "—"}
                                    </TableCell>
                                    {showFinancials && (
                                        <>
                                            <TableCell className="text-center">
                                                {c.status ? (
                                                    <Badge
                                                        variant={
                                                            c.status === "critical"
                                                                ? "destructive"
                                                                : c.status === "warning"
                                                                    ? "secondary"
                                                                    : "outline"
                                                        }
                                                        className={
                                                            c.status === "warning"
                                                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                                                : ""
                                                        }
                                                    >
                                                        {c.status === "critical" && <AlertTriangle className="mr-1 h-3 w-3" />}
                                                        {c.status === "warning" && <Clock className="mr-1 h-3 w-3" />}
                                                        {c.status === "normal" && <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />}
                                                        {c.status === "critical" ? "Delayed" : c.status === "warning" ? "Slow" : "On Time"}
                                                    </Badge>
                                                ) : "—"}
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {c.pendingAmount ? `${c.pendingAmount.toLocaleString()} DZD` : "—"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {c.avgDelay !== undefined ? (
                                                    <span className={c.avgDelay > 7 ? "text-red-500 font-medium" : ""}>
                                                        {c.avgDelay}d
                                                    </span>
                                                ) : "—"}
                                            </TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
