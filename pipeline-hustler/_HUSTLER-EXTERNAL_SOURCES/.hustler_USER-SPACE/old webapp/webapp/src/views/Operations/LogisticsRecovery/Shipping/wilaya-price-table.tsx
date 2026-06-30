"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/core/ui/table";
import { Pencil, Save, X, Truck } from "lucide-react";

export interface WilayaPrice {
    wilayaId: string;
    wilayaName: string;
    companyId: string;
    companyName: string;
    companyLogo?: string;
    priceDesk: number;
    priceHome: number;
    deliveryDays: number;
}

interface WilayaPriceTableProps {
    prices: WilayaPrice[];
    onPriceUpdate?: (wilayaId: string, companyId: string, priceDesk: number, priceHome: number) => void;
    className?: string;
}

export function WilayaPriceTable({ prices, onPriceUpdate, className }: WilayaPriceTableProps) {
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editValues, setEditValues] = React.useState<{ priceDesk: number; priceHome: number }>({
        priceDesk: 0,
        priceHome: 0,
    });

    const handleEdit = (price: WilayaPrice) => {
        setEditingId(`${price.wilayaId}-${price.companyId}`);
        setEditValues({ priceDesk: price.priceDesk, priceHome: price.priceHome });
    };

    const handleSave = (price: WilayaPrice) => {
        onPriceUpdate?.(price.wilayaId, price.companyId, editValues.priceDesk, editValues.priceHome);
        setEditingId(null);
    };

    const handleCancel = () => {
        setEditingId(null);
    };

    return (
        <div className={cn("rounded-lg border", className)}>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Wilaya</TableHead>
                        <TableHead>Société</TableHead>
                        <TableHead className="text-right">Prix Bureau (DA)</TableHead>
                        <TableHead className="text-right">Prix Domicile (DA)</TableHead>
                        <TableHead className="text-right">Délai (jours)</TableHead>
                        <TableHead className="w-20"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {prices.map((price) => {
                        const id = `${price.wilayaId}-${price.companyId}`;
                        const isEditing = editingId === id;

                        return (
                            <TableRow key={id}>
                                <TableCell className="font-medium">{price.wilayaName}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {price.companyLogo ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={price.companyLogo}
                                                alt={price.companyName}
                                                className="w-5 h-5 object-contain"
                                            />
                                        ) : (
                                            <Truck className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        {price.companyName}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={editValues.priceDesk}
                                            onChange={(e) =>
                                                setEditValues((prev) => ({
                                                    ...prev,
                                                    priceDesk: parseInt(e.target.value) || 0,
                                                }))
                                            }
                                            className="w-24 h-8 text-right ml-auto"
                                        />
                                    ) : (
                                        <span>{price.priceDesk.toLocaleString()}</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={editValues.priceHome}
                                            onChange={(e) =>
                                                setEditValues((prev) => ({
                                                    ...prev,
                                                    priceHome: parseInt(e.target.value) || 0,
                                                }))
                                            }
                                            className="w-24 h-8 text-right ml-auto"
                                        />
                                    ) : (
                                        <span>{price.priceHome.toLocaleString()}</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">{price.deliveryDays}</TableCell>
                                <TableCell>
                                    {isEditing ? (
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-green-600"
                                                onClick={() => handleSave(price)}
                                            >
                                                <Save className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600"
                                                onClick={handleCancel}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleEdit(price)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

// Mock data
export const mockWilayaPrices: WilayaPrice[] = [
    { wilayaId: "16", wilayaName: "Alger", companyId: "1", companyName: "Yalidine", priceDesk: 400, priceHome: 600, deliveryDays: 1 },
    { wilayaId: "16", wilayaName: "Alger", companyId: "2", companyName: "ZR Express", priceDesk: 350, priceHome: 550, deliveryDays: 2 },
    { wilayaId: "31", wilayaName: "Oran", companyId: "1", companyName: "Yalidine", priceDesk: 450, priceHome: 650, deliveryDays: 2 },
    { wilayaId: "31", wilayaName: "Oran", companyId: "2", companyName: "ZR Express", priceDesk: 400, priceHome: 600, deliveryDays: 3 },
    { wilayaId: "25", wilayaName: "Constantine", companyId: "1", companyName: "Yalidine", priceDesk: 500, priceHome: 700, deliveryDays: 2 },
    { wilayaId: "09", wilayaName: "Blida", companyId: "1", companyName: "Yalidine", priceDesk: 350, priceHome: 500, deliveryDays: 1 },
    { wilayaId: "19", wilayaName: "Setif", companyId: "1", companyName: "Yalidine", priceDesk: 550, priceHome: 750, deliveryDays: 3 },
];
