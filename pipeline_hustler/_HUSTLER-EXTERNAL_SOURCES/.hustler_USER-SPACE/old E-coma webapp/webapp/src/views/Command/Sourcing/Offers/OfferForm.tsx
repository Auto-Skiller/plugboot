"use client";

import { Button } from "@/components/core/ui/button";
import { Input } from "@/components/core/ui/input";
import { Label } from "@/components/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/ui/select";
import { Offer } from "./offers-data";

interface OfferFormContentProps {
    products: { id: string; name: string }[];
    initialData?: Offer | null;
    onCancel: () => void;
    onSave: () => void;
}

export function OfferFormContent({ products, initialData, onCancel, onSave }: OfferFormContentProps) {
    return (
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nom de l&apos;offre</Label>
                <Input id="name" placeholder="Ex: Promo Weekend -20%" defaultValue={initialData?.name} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Type d&apos;offre</Label>
                    <Select defaultValue={initialData?.type || "discount"}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="discount">Réduction %</SelectItem>
                            <SelectItem value="bundle">Bundle</SelectItem>
                            <SelectItem value="bogo">1 Acheté = 1 Offert</SelectItem>
                            <SelectItem value="flash">Vente Flash</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Réduction</Label>
                    <div className="relative">
                        <Input type="number" placeholder="20" defaultValue={initialData?.discount} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Date de début</Label>
                    <Input type="date" defaultValue={initialData?.startDate} />
                </div>
                <div className="space-y-2">
                    <Label>Date de fin</Label>
                    <Input type="date" defaultValue={initialData?.endDate} />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Produits concernés</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner les produits..." />
                    </SelectTrigger>
                    <SelectContent>
                        {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={onCancel}>
                    Annuler
                </Button>
                <Button onClick={onSave}>
                    {initialData ? "Mettre à jour" : "Créer l'offre"}
                </Button>
            </div>
        </div>
    );
}
