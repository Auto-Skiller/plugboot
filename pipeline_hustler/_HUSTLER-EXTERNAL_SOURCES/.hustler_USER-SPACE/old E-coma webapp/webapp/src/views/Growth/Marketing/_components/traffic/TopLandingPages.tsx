import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/core/ui/table"; // Assuming table components exist

interface LandingPage {
    title: string;
    url: string;
    visitors: number;
    bounceRate: number;
    conversions: number;
}

interface TopLandingPagesProps {
    pages: LandingPage[];
}

export function TopLandingPages({ pages }: TopLandingPagesProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Landing Pages</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Fallback to simple div structure if Table component is not available, but assuming it is based on ui folders */}
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Page Title</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">URL</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Visitors</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Bounce Rate</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Conversions</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {pages.map((page) => (
                                <tr key={page.url} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 font-medium">{page.title}</td>
                                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-muted-foreground">{page.url}</td>
                                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">{page.visitors.toLocaleString()}</td>
                                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">{page.bounceRate}%</td>
                                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 text-right">{page.conversions}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
