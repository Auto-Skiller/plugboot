"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/core/ui/card";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Truck, MoreVertical, MapPin, Phone, Clock } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/core/ui/dropdown-menu";

export interface DeliveryCompany {
    id: string;
    name: string;
    logo?: string;
    wilayasCount: number;
    isActive: boolean;
    avgDeliveryDays: number;
    phone?: string;
    successRate: number;
}

interface DeliveryCompanyCardProps {
    company: DeliveryCompany;
    onEdit?: (company: DeliveryCompany) => void;
    onConfigurePrices?: (company: DeliveryCompany) => void;
    onToggleStatus?: (company: DeliveryCompany) => void;
    onDelete?: (company: DeliveryCompany) => void;
    className?: string;
}

export function DeliveryCompanyCard({
    company,
    onEdit,
    onConfigurePrices,
    onToggleStatus,
    onDelete,
    className,
}: DeliveryCompanyCardProps) {
    return (
        <Card className={cn("hover:shadow-md transition-shadow", className)}>
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {company.logo ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={company.logo}
                                alt={company.name}
                                className="w-8 h-8 object-contain"
                            />
                        ) : (
                            <Truck className="h-6 w-6 text-muted-foreground" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{company.name}</h3>
                            <Badge variant={company.isActive ? "default" : "secondary"}>
                                {company.isActive ? "Actif" : "Inactif"}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {company.wilayasCount} wilayas
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {company.avgDeliveryDays}j moy.
                            </span>
                            <span className={cn(
                                "font-medium",
                                company.successRate >= 90 ? "text-green-500" :
                                    company.successRate >= 70 ? "text-yellow-500" : "text-red-500"
                            )}>
                                {company.successRate}% succès
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit?.(company)}>
                                Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onConfigurePrices?.(company)}>
                                Configurer les prix
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleStatus?.(company)}>
                                {company.isActive ? "Désactiver" : "Activer"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onDelete?.(company)}
                            >
                                Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
}

// Grid of delivery company cards
interface DeliveryCompanyGridProps {
    companies: DeliveryCompany[];
    onEdit?: (company: DeliveryCompany) => void;
    onConfigurePrices?: (company: DeliveryCompany) => void;
    onToggleStatus?: (company: DeliveryCompany) => void;
    onDelete?: (company: DeliveryCompany) => void;
    className?: string;
}

export function DeliveryCompanyGrid({
    companies,
    onEdit,
    onConfigurePrices,
    onToggleStatus,
    onDelete,
    className,
}: DeliveryCompanyGridProps) {
    return (
        <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
            {companies.map((company) => (
                <DeliveryCompanyCard
                    key={company.id}
                    company={company}
                    onEdit={onEdit}
                    onConfigurePrices={onConfigurePrices}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

// Mock data for demo
export const mockDeliveryCompanies: DeliveryCompany[] = [
    { id: "1", name: "Yalidine", wilayasCount: 58, isActive: true, avgDeliveryDays: 2, successRate: 94, phone: "0550123456" },
    { id: "2", name: "ZR Express", wilayasCount: 48, isActive: true, avgDeliveryDays: 3, successRate: 88, phone: "0660987654" },
    { id: "3", name: "Ecotrack", wilayasCount: 35, isActive: true, avgDeliveryDays: 4, successRate: 82, phone: "0770456789" },
    { id: "4", name: "Maystro", wilayasCount: 42, isActive: false, avgDeliveryDays: 3, successRate: 79, phone: "0550111222" },
];
