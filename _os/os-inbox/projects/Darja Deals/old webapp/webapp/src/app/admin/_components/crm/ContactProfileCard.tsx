"use client";

import { Card, CardContent } from "@/components/core/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/ui/avatar";
import { Button } from "@/components/core/ui/button";
import { Badge } from "@/components/core/ui/badge";
import { Label } from "@/components/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/core/ui/dropdown-menu";
import { MoreVertical, X, Plus } from "lucide-react";

export interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    initials: string;
    lifecycleStage: string;
    tags: string[];
    customFields: { key: string; label: string; value: string }[];
    ordersCount: number;
    totalSpent: number;
    avgOrderValue: number;
}

export function ContactProfileCard({ contact }: { contact: Contact }) {
    return (
        <Card>
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback className="text-lg">{contact.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold">{contact.name}</h2>
                        <p className="text-muted-foreground">{contact.email}</p>
                        <p className="text-muted-foreground">{contact.phone}</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Modifier</DropdownMenuItem>
                            <DropdownMenuItem>Exporter</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Lifecycle Stage */}
                <div className="mb-6">
                    <Label className="text-xs text-muted-foreground">ÉTAPE DU CYCLE</Label>
                    <Select defaultValue={contact.lifecycleStage}>
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="new_lead">Nouveau Lead</SelectItem>
                            <SelectItem value="hot_lead">Lead Chaud</SelectItem>
                            <SelectItem value="negotiation">Négociation</SelectItem>
                            <SelectItem value="customer">Client</SelectItem>
                            <SelectItem value="loyal">Fidèle</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Tags */}
                <div className="mb-6">
                    <Label className="text-xs text-muted-foreground">TAGS</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {contact.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="gap-1">
                                {tag}
                                <X className="h-3 w-3 cursor-pointer" />
                            </Badge>
                        ))}
                        <Button variant="outline" size="sm" className="h-6 text-xs">
                            <Plus className="h-3 w-3 mr-1" />
                            Ajouter
                        </Button>
                    </div>
                </div>

                {/* Custom Fields */}
                <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground">CHAMPS PERSONNALISÉS</Label>
                    {contact.customFields.map(field => (
                        <div key={field.key} className="flex items-center justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">{field.label}</span>
                            <span className="text-sm font-medium">{field.value}</span>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                    <div className="text-center">
                        <p className="text-2xl font-bold">{contact.ordersCount}</p>
                        <p className="text-xs text-muted-foreground">Commandes</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold">{contact.totalSpent.toLocaleString()} DA</p>
                        <p className="text-xs text-muted-foreground">Total Dépensé</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold">{contact.avgOrderValue.toLocaleString()} DA</p>
                        <p className="text-xs text-muted-foreground">Panier Moyen</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
