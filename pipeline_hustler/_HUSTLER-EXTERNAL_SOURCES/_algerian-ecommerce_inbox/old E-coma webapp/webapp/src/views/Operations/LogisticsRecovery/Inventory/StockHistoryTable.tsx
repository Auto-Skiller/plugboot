"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/core/ui/table";
import { Badge } from "@/components/core/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/ui/avatar";
import { cn } from "@/lib/utils";
import { Product } from "./ProductCard";

export interface StockMovement {
    id: string;
    createdAt: string;
    product: Product;
    type: 'in' | 'out';
    quantity: number;
    reason: string;
    user: {
        name: string;
        avatar?: string;
        initials: string;
    };
}

// Removed invalid lines
export function StockHistoryTable({ movements, compact }: { movements: StockMovement[], compact?: boolean }) {
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            ...(compact ? {} : { year: 'numeric' }),
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    {!compact && <TableHead>Raison</TableHead>}
                    {!compact && <TableHead>Par</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {movements.map(mov => (
                    <TableRow key={mov.id} className="h-10">
                        <TableCell className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(mov.createdAt)}
                        </TableCell>
                        <TableCell className="py-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 min-w-6 rounded bg-muted">
                                    {mov.product.image && (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={mov.product.image} alt={mov.product.name} className="w-full h-full object-cover rounded" />
                                    )}
                                </div>
                                <span className={cn("truncate max-w-[120px] text-xs font-medium", compact && "hidden xl:block")}>
                                    {mov.product.name}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="py-2">
                            <Badge variant={mov.type === 'in' ? 'secondary' : 'destructive'} className="whitespace-nowrap text-[10px] px-1.5 h-5">
                                {mov.type === 'in' ? 'Entrée' : 'Sortie'}
                            </Badge>
                        </TableCell>
                        <TableCell className={cn(
                            "text-right font-medium text-xs py-2",
                            mov.type === 'in' ? "text-green-600" : "text-red-600"
                        )}>
                            {mov.type === 'in' ? '+' : '-'}{mov.quantity}
                        </TableCell>
                        {!compact && <TableCell className="py-2 text-xs">{mov.reason}</TableCell>}
                        {!compact && (
                            <TableCell className="py-2">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                        <AvatarImage src={mov.user.avatar} />
                                        <AvatarFallback className="text-[10px]">{mov.user.initials}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs">{mov.user.name}</span>
                                </div>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
