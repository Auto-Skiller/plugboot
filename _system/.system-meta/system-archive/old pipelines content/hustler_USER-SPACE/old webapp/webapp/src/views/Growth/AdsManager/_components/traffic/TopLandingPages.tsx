"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/core/ui/table";
import { Badge } from "@/components/core/ui/badge";

export interface LandingPage {
    title: string;
    url: string;
    visitors: number;
    bounceRate: number;
    conversions: number;
}

export function TopLandingPages({ pages }: { pages: LandingPage[] }) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Meilleurs Landing Pages</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Page</TableHead>
                            <TableHead className="text-right">Visiteurs</TableHead>
                            <TableHead className="text-right">Taux Rebond</TableHead>
                            <TableHead className="text-right">Conversions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pages.map((page, i) => (
                            <TableRow key={page.url}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground text-sm w-6">{i + 1}.</span>
                                        <div>
                                            <p className="font-medium truncate max-w-[200px]">{page.title}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                {page.url}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {page.visitors.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={page.bounceRate > 50 ? 'destructive' : 'secondary'}>
                                        {page.bounceRate}%
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium text-green-600">
                                    {page.conversions}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
