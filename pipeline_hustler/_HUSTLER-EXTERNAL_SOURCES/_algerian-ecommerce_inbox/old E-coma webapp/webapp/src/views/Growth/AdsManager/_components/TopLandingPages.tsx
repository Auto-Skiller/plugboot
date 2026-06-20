"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/core/ui/table";
import { ExternalLink, Layout } from "lucide-react";

interface LandingPage {
    id: string;
    url: string;
    visits: number;
    conversions: number;
    conversionRate: number;
}

const MOCK_PAGES: LandingPage[] = [
    { id: '1', url: '/products/ecouteurs-pro', visits: 12500, conversions: 450, conversionRate: 3.6 },
    { id: '2', url: '/products/montre-sport', visits: 8900, conversions: 320, conversionRate: 3.5 },
    { id: '3', url: '/collections/promo-ete', visits: 15600, conversions: 480, conversionRate: 3.0 },
    { id: '4', url: '/products/ventilateur', visits: 6200, conversions: 210, conversionRate: 3.3 },
    { id: '5', url: '/bundles/pack-tech', visits: 4500, conversions: 180, conversionRate: 4.0 },
];

export function TopLandingPages() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Layout className="h-5 w-5 text-indigo-600" />
                    Meilleurs Landing Pages
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Page URL</TableHead>
                            <TableHead className="text-right">Visites</TableHead>
                            <TableHead className="text-right">Conversions</TableHead>
                            <TableHead className="text-right">Taux Conv.</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_PAGES.map((page) => (
                            <TableRow key={page.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <span className="truncate max-w-[200px]">{page.url}</span>
                                    <ExternalLink className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-primary" />
                                </TableCell>
                                <TableCell className="text-right">{page.visits.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{page.conversions}</TableCell>
                                <TableCell className="text-right text-green-600 font-medium">{page.conversionRate}%</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
